import axios from 'axios';

// Vite exposes env vars on import.meta.env, not process.env, and only ones
// prefixed with VITE_. Referencing process here throws in the browser and
// takes the whole app down with it.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
