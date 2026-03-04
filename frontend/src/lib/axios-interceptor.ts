import axios from 'axios';

// Global axios interceptor to handle authentication errors
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized errors globally
      if (error.response?.status === 401) {
        // Clear stored authentication data
        localStorage.removeItem('lush_token');
        localStorage.removeItem('lush_user');
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  );
};
