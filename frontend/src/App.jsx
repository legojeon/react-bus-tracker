import React, { useState, useEffect } from 'react'
import { validateEnvironment } from './utils/env'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { Login, Register, Home } from './features'
import MapPage from './features/map/map_page'
import SavedList from './features/saved/saved_list'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [user, setUser] = useState(null)
  const [openServiceModal, setOpenServiceModal] = useState(false)
  const [isMap, setIsMap] = useState(false)
  const [isSavedList, setIsSavedList] = useState(false)
  const [selectedStation, setSelectedStation] = useState(null)

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // 환경 변수 검증
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.error('환경 변수 설정에 문제가 있습니다.');
    }
    
    // 페이지 로드 시 로컬 스토리지에서 토큰 확인
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleRegister = (userData) => {
    // 회원가입 성공 시 로그인 화면으로 전환
    setShowRegister(false)
    alert('회원가입이 완료되었습니다. 로그인해주세요.')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
  }

  const switchToRegister = () => {
    setShowRegister(true)
  }

  const switchToLogin = () => {
    setShowRegister(false)
  }

  const handleRealtimeBus = () => {
    setSelectedStation(null);
    setIsMap(true);
  }

  const handleRouteSearch = () => {
    setOpenServiceModal(true);
  }

  const handleFavorite = () => {
    setIsSavedList(true);
  }

  const handleCloseServiceModal = () => {
    setOpenServiceModal(false)
  }

  // 즐겨찾기에서 정류소 선택 시
  const handleSelectStationFromSaved = (station) => {
    setSelectedStation(station);
    setIsSavedList(false);
    setIsMap(true);
  }

  if (isMap) {
    return <MapPage onBack={() => setIsMap(false)} selectedStation={selectedStation} />
  }

  if (isSavedList) {
    return <SavedList onBack={() => setIsSavedList(false)} onSelectStation={handleSelectStationFromSaved} />
  }

  if (isLoggedIn) {
    return (
      <Home
        user={user}
        isMobile={isMobile}
        handleLogout={handleLogout}
        openServiceModal={openServiceModal}
        handleRealtimeBus={handleRealtimeBus}
        handleRouteSearch={handleRouteSearch}
        handleFavorite={handleFavorite}
        handleCloseServiceModal={handleCloseServiceModal}
      />
    )
  }

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
      zIndex: 0
    }}>
      <Box sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <Container maxWidth="xs">
          <Paper
            elevation={8}
            sx={{
              p: isMobile ? 3 : 4,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              maxWidth: '350px',
              margin: '0 auto'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <BusIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
                언제와
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {showRegister ? '회원가입' : '로그인'}
              </Typography>
            </Box>

            {showRegister ? (
              <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
            ) : (
              <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}

export default App
