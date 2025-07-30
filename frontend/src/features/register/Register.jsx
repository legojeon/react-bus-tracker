import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as RegisterIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';

// API URL을 환경 변수에서 가져오거나 상대경로 사용
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    if (formData.username.length < 3) {
      setError('사용자명은 최소 3자 이상이어야 합니다.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        onRegister(data.data);
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('네트워크 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
    
      <TextField
        margin="normal"
        required
        fullWidth
              id="username"
        label="사용자명"
              name="username"
        autoComplete="username"
        autoFocus
              value={formData.username}
              onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5 }}
        size="small"
      />

      <TextField
        margin="normal"
        required
        fullWidth
              id="email"
        label="이메일"
              name="email"
        autoComplete="email"
        type="email"
              value={formData.email}
              onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5 }}
        size="small"
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="비밀번호"
        type={showPassword ? 'text' : 'password'}
              id="password"
        autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5 }}
        size="small"
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="비밀번호 확인"
        type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
        autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={handleToggleConfirmPasswordVisibility}
                edge="end"
                size="small"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
        size="small"
      />

      <Button
            type="submit" 
        fullWidth
        variant="contained"
        size="medium"
            disabled={loading}
        sx={{
          mt: 1,
          mb: 2,
          py: 1,
          fontSize: '0.9rem',
          fontWeight: 'bold',
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)'
          },
          transition: 'all 0.3s ease'
        }}
          >
        {loading ? '회원가입 중...' : '회원가입'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          이미 계정이 있으신가요?
        </Typography>
        <Button
          variant="text"
              onClick={onSwitchToLogin}
          size="small"
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
            >
          로그인하기
        </Button>
      </Box>
    </Box>
  );
};

export default Register; 