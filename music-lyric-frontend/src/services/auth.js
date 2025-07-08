// src/services/auth.js
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

// Add request interceptor to include token
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

export const register = async (username, email, password) => {
  const response = await fetch('http://localhost:8000/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.username?.[0] || 
      errorData.email?.[0] || 
      errorData.password?.[0] || 
      'Registration failed'
    );
  }
  return await response.json();
};

export const login = async (username, password) => {
  try {
    const response = await api.post('/login/', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.non_field_errors?.[0] ||
      'Login failed. Please check your credentials.'
    );
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

// Verify token validity
export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const response = await api.get('/verify-token/');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const getSearchHistory = (token) => {
  return axios.get(`${API_URL}/search-history/`, {
    headers: { 'Authorization': `Token ${token}` }
  });
};