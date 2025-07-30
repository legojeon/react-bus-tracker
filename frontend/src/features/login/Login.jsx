import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';

// API URL을 환경 변수에서 가져오거나 상대경로 사용
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.access_token); //local storage에 jwt저장
        localStorage.setItem('user', JSON.stringify({
          id: data.data.user_id,
          username: data.data.username
        }));
        onLogin(data.data);
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('네트워크 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        name="password"
        label="비밀번호"
        type={showPassword ? 'text' : 'password'}
              id="password"
        autoComplete="current-password"
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
            {loading ? '로그인 중...' : '로그인'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          계정이 없으신가요?
        </Typography>
        <Button
          variant="text"
              onClick={onSwitchToRegister}
          size="small"
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
            >
          회원가입하기
        </Button>
      </Box>
    </Box>
  );
};

export default Login; 