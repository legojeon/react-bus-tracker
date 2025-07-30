// API 설정 - 상대경로 사용
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// API 헬퍼 함수들
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// 인증 헤더가 필요한 요청을 위한 헬퍼
export const authenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  return apiRequest(endpoint, {
    ...options,
    headers,
  });
}; 