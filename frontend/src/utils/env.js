/**
 * 환경 변수 검증 유틸리티
 */

// 모든 환경 변수 목록
const ALL_ENV_VARS = {
  VITE_NAVER_CLIENT_ID: '네이버 클라이언트 ID',
  VITE_NAVER_CLIENT_SECRET: '네이버 클라이언트 시크릿',
  VITE_APP_ENV: '애플리케이션 환경',
  VITE_API_URL: 'API 서버 URL'
};

/**
 * 환경 변수 검증
 */
export const validateEnvironment = () => {
  const missing = [];
  const available = [];

  // 모든 환경 변수 검증
  for (const [key, description] of Object.entries(ALL_ENV_VARS)) {
    const value = import.meta.env[key];
    // VITE_API_URL은 빈 문자열도 유효한 값으로 처리
    if (key === 'VITE_API_URL') {
      if (value === undefined || value === null) {
        missing.push({ key, description });
      } else {
        available.push({ key, description, value: value || '(빈 문자열)' });
      }
    } else if (!value || value === `your-${key.toLowerCase().replace('vite_', '').replace('_', '-')}-here`) {
      missing.push({ key, description });
    } else {
      available.push({ key, description, value });
    }
  }

  // 오류 출력
  if (missing.length > 0) {
    console.error('❌ 환경 변수가 설정되지 않았습니다:');
    missing.forEach(({ key, description }) => {
      console.error(`   - ${key}: ${description}`);
    });
    console.error('   .env 파일을 확인하고 올바른 값을 설정해주세요.');
  }

  // 사용 가능한 환경 변수 출력 (제거됨)

  return {
    isValid: missing.length === 0,
    missing,
    available
  };
};

/**
 * 환경 변수 값 가져오기 (안전한 방식)
 */
export const getEnvVar = (key, defaultValue = null) => {
  const value = import.meta.env[key];
  
  if (!value || value.includes('your-') || value.includes('here')) {
    if (defaultValue !== null) {
      return defaultValue;
    }
    console.error(`환경 변수 ${key}가 설정되지 않았습니다.`);
    return null;
  }
  
  return value;
};

/**
 * 개발 환경인지 확인
 */
export const isDevelopment = () => {
  return import.meta.env.DEV === true;
};

/**
 * 프로덕션 환경인지 확인
 */
export const isProduction = () => {
  return import.meta.env.PROD === true;
}; 