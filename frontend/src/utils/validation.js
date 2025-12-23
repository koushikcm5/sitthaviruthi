export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) return 'Invalid phone number';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain a special character';
  return null;
};

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!username) return 'Username is required';
  if (!usernameRegex.test(username)) return 'Username must be 3-20 characters (letters, numbers, underscore only)';
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 50) return 'Name must be less than 50 characters';
  return null;
};
