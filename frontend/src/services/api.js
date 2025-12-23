import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, REQUEST_TIMEOUT } from '../../config';

const BASE_URL = API_URL; // Direct use of /api/ endpoint

/**
 * Helper to add a timeout to fetch calls
 */
const fetchWithTimeout = async (url, options = {}, retries = 2) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT || 15000);

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      if (i === retries || error.name === 'AbortError') {
        clearTimeout(timeout);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const getDeviceInfo = () => {
  return `Mobile Device - ${new Date().toISOString()}`;
};

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  const base = { 'Content-Type': 'application/json' };
  if (token) base['Authorization'] = `Bearer ${token}`;
  return base;
};

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) throw new Error('Token refresh failed');

  const data = await response.json();
  await AsyncStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
};

const fetchWithAuth = async (url, options = {}) => {
  let response = await fetchWithTimeout(url, options);

  if (response.status === 401) {
    try {
      await refreshAccessToken();
      const headers = await getAuthHeaders();
      response = await fetchWithTimeout(url, { ...options, headers: { ...options.headers, ...headers } });
    } catch (error) {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
};

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text || text.trim() === '') {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: 'Invalid response format', raw: text };
  }
};

export const authAPI = {
  login: async (username, password) => {
    try {
      let response = await fetchWithTimeout(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });



      const data = await parseResponse(response);

      if (!response.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          throw new Error('EMAIL_NOT_VERIFIED');
        }
        if (data.error === 'PENDING_APPROVAL') {
          throw new Error('PENDING_APPROVAL');
        }
        throw new Error(data.error || 'Login failed');
      }

      // store tokens and user info (support both new and old format)
      if (data.accessToken) {
        await AsyncStorage.setItem('accessToken', data.accessToken);
      } else if (data.token) {
        await AsyncStorage.setItem('accessToken', data.token);
      }
      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.username) {
        await AsyncStorage.setItem('username', data.username);
      }
      if (data.role) {
        await AsyncStorage.setItem('role', data.role);
      }
      if (data.profilePicture) {
        await AsyncStorage.setItem('profilePicture', data.profilePicture);
      }

      return data;
    } catch (error) {
      // better network error message - reference API URL (production or local)
      if (error.name === 'AbortError' || error.message.includes('Network request failed') || error.message.includes('fetch')) {
        throw new Error(`Cannot connect to server at ${API_URL}. Make sure the backend is running and reachable.`);
      }
      throw error;
    }
  },

  register: async (name, username, email, phone, password) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      let response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, phone, password }),
        signal: controller.signal
      });



      clearTimeout(timeout);
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        return { message: 'Registration successful. Please check your email to verify your account.' };
      }
      throw err;
    }
  },

  forgotPassword: async (email) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to send reset email');
      return data;
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Email sending may take longer than expected. Please check your email.');
      }
      throw error;
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');
      return data;
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  },

  logout: async () => {
    const username = await AsyncStorage.getItem('username');
    try {
      const headers = await getAuthHeaders();
      await fetchWithTimeout(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('role');
  },

  deleteUser: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/auth/delete-user/${username}`, {
      method: 'DELETE',
      headers
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  getPendingUsers: async () => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/auth/pending-users`, { headers });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to fetch pending users');
    return data;
  },

  approveUser: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/auth/approve-user/${username}`, {
      method: 'POST',
      headers
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to approve user');
    return data;
  },

  verifyEmail: async (email, otp) => {
    const response = await fetchWithTimeout(`${BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Verification failed');
    return data;
  },

  resendVerification: async (email) => {
    const response = await fetchWithTimeout(`${BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to resend verification');
    return data;
  },

  updateProfilePicture: async (username, formData) => {
    const token = await AsyncStorage.getItem('accessToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    // Do not set Content-Type header when sending FormData; fetch will set it with boundary
    const encodedUsername = encodeURIComponent(username);
    const response = await fetchWithTimeout(`${BASE_URL}/auth/profile-picture?username=${encodedUsername}`, {
      method: 'POST',
      headers,
      body: formData
    }, 5); // Increase retries for upload
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to update profile picture');
    return data;
  }
};

export const attendanceAPI = {
  markAttendance: async (attended) => {
    try {
      const username = await AsyncStorage.getItem('username');
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: { ...headers, 'username': username },
        body: JSON.stringify({ attended, deviceInfo: getDeviceInfo() })
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to mark attendance');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  getUserAttendance: async (username) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/attendance/user/${username}`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  getAllAttendance: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/attendance/all`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  updateAttendance: async (id, attended) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/attendance/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ attended })
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to update attendance');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/attendance/users`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  }
};

export const contentAPI = {
  getVideos: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/videos`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch videos');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  },

  getManifestationVideo: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/manifestation-video`, { headers });
      if (!response.ok) return null;
      const text = await response.text();
      return text && text !== 'null' ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error fetching manifestation video:', error);
      return null;
    }
  },

  getVideoByLevel: async (level) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/video/level/${level}`, { headers });
      if (!response.ok) return null;
      const text = await response.text();
      return text && text !== 'null' ? JSON.parse(text) : null;
    } catch (error) {
      console.error(`Error fetching level ${level} video:`, error);
      return null;
    }
  },

  getHabits: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/habits`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch habits');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
  },

  addVideo: async (videoData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/video`, {
        method: 'POST',
        headers,
        body: JSON.stringify(videoData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to add video');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },



  addHabit: async (habitData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/habit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(habitData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to add habit');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  updateHabit: async (id, habitData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/habit/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(habitData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to update habit');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  deleteHabit: async (id) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/habit/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to delete habit');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  addWorkshop: async (workshopData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/workshop`, {
        method: 'POST',
        headers,
        body: JSON.stringify(workshopData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to add workshop');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  addOrUpdateManifestationVideo: async (videoData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/manifestation-video`, {
        method: 'POST',
        headers,
        body: JSON.stringify(videoData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to update manifestation video');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  fixHabits: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/fix-habits`, {
        method: 'POST',
        headers
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fix habits');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  addRoutine: async (routineData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/routine`, {
        method: 'POST',
        headers,
        body: JSON.stringify(routineData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to add routine');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  getRoutines: async () => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/routines`, { headers });
    return parseResponse(response);
  },

  getUserProgress: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/progress/${username}`, { headers });
    return parseResponse(response);
  },

  completeVideo: async (username, videoId) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/complete-video`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, videoId: videoId.toString() })
    });
    return parseResponse(response);
  },

  completeRoutine: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/complete-routine`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username })
    });
    return parseResponse(response);
  },

  completeHabits: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/complete-habits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username })
    });
    return parseResponse(response);
  },

  uploadHealingPhoto: async (formData) => {
    // We need auth headers but WITHOUT Content-Type (fetch handles multipart boundary)
    const headers = await getAuthHeaders();
    delete headers['Content-Type'];

    const response = await fetch(`${BASE_URL}/content/user/healing-upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to upload photo');
    return data;
  },

  getHealingUploads: async () => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/admin/healing-uploads`, { headers });
    return parseResponse(response);
  },

  getUserProgress: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/progress/${username}`, { headers });
    return parseResponse(response);
  },

  completeQA: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/complete-qa`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username })
    });
    return parseResponse(response);
  }
};

export const workshopAPI = {
  getWorkshops: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/workshops`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch workshops');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching workshops:', error);
      return [];
    }
  },

  getWorkshopsByLevel: async (level) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/workshops/${level}`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch workshops');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching workshops:', error);
      return [];
    }
  },

  getSessionWorkshops: async (level) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/workshops/sessions/${level}`, { headers });
    return parseResponse(response);
  }
};

export const notificationAPI = {
  getUserNotifications: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/notifications`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch notifications');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  getUnreadCount: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/notifications/unread-count?t=${new Date().getTime()}`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) return 0;
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to mark as read');
      return data;
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to mark all as read');
      return data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  saveDeviceToken: async (username, token, deviceType) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/notifications/device-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, token, deviceType })
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to save device token');
      return data;
    } catch (error) {
      console.error('Error saving device token:', error);
      throw error;
    }
  }
};

export const qaAPI = {
  askQuestion: async (username, question) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/qa/ask`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, question })
    });
    return parseResponse(response);
  },

  getUserQuestions: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/qa/user/${username}`, { headers });
    return parseResponse(response);
  }
};

export const userAPI = {
  getContentProfile: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/content/user/${username}`, { headers });
    return parseResponse(response);
  }
};

export const appointmentAPI = {
  getUserAppointments: async (username) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/appointments/user/${username}`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch appointments');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      throw error;
    }
  },

  requestAppointment: async (username, reason, doctorName) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/appointments/request`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, reason, doctorName })
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to request appointment');
    return data;
  }
};

export const adminAPI = {
  getAllAppointments: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/appointments/admin/all`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch appointments');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  approveAppointment: async (id, data) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/appointments/admin/approve/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    const resData = await parseResponse(response);
    if (!response.ok) throw new Error(resData.error || 'Failed to approve appointment');
    return resData;
  },

  rejectAppointment: async (id, data) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/appointments/admin/reject/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    const resData = await parseResponse(response);
    if (!response.ok) throw new Error(resData.error || 'Failed to reject appointment');
    return resData;
  },

  getAllQA: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/qa/admin/all`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch Q&A');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching Q&A:', error);
      return [];
    }
  },

  answerQuestion: async (id, answer) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithAuth(`${BASE_URL}/qa/admin/answer/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ answer })
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to answer question');
    return data;
  },

  getAllProgress: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithAuth(`${BASE_URL}/content/admin/progress`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch progress');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching progress:', error);
      return [];
    }
  }
};
