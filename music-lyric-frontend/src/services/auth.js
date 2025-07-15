import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/';

// Configure Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message);
  }
);

export const register = async (username, email, password) => {
  try {
    const response = await api.post('register/', {
      username,
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.username?.[0] ||
      error.email?.[0] ||
      error.password?.[0] ||
      'Registration failed. Please try again.'
    );
  }
};

export const login = async (username, password) => {
  try {
    const response = await api.post('login/', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.non_field_errors?.[0] ||
      'Login failed. Please check your credentials.'
    );
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  return api.post('logout/');
};

export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    await api.get('verify-token/');
    return true;
  } catch (error) {
    return false;
  }
};

export const getSearchHistory = async () => {
  try {
    const response = await api.get('search-history/');
    return response.data;
  } catch (error) {
    throw new Error(
      error.detail || 'Failed to fetch search history'
    );
  }
};

// Additional API calls can be added here following the same pattern
export const addFavorite = async (songId) => {
  try {
    const response = await api.post('favorites/', { song_id: songId });
    return response.data;
  } catch (error) {
    throw new Error(
      error.detail || 'Failed to add favorite'
    );
  }
};

export const getFavorites = async () => {
  try {
    const response = await api.get('favorites/');
    return response.data;
  } catch (error) {
    throw new Error(
      error.detail || 'Failed to fetch favorites'
    );
  }
};