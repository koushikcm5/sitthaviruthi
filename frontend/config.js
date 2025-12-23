// Backend API Configuration
// ------------------------------------------------------

// OPTION 1: Android Emulator
// export const API_URL = 'http://10.0.2.2:8080/api';

// OPTION 2: Physical Device (Try these IPs one by one)

// Candidate 1 (Likely Router Network):
export const API_URL = 'http://10.10.42.68:8080/api/v1';

// Candidate 2 (Hotspot / Shared Connection):
// export const API_URL = 'http://192.168.137.1:8080/api/v1';

export const REQUEST_TIMEOUT = 60000;
