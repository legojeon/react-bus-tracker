import React from 'react';
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

const Home = ({ user, isMobile, handleLogout, openServiceModal, handleRealtimeBus, handleRouteSearch, handleFavorite, handleCloseServiceModal }) => {
  return (
    <Box sx={{ 
      flexGrow: 1,
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
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Box sx={{ width: '100%' }}>
          <Container maxWidth="lg" sx={{ 
            p: { xs: 2, sm: 3, md: 4, lg: 4 }
          }}>
            <AppBar 
              position="static" 
              sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                color: '#1976d2',
                borderRadius: 2,
                mb: 2
              }}
            >
              <Toolbar sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusIcon sx={{ mr: 2, fontSize: 32, color: '#1976d2' }} />
                </Box>
                
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold',
                    color: '#1976d2'
                  }}
                >
                  언제와
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  marginLeft: 'auto'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      display: { xs: 'none', sm: 'block' },
                      color: '#1976d2'
                    }}
                  >
                    안녕하세요, {user?.username}님!
                  </Typography>
                  <Button
                    color="primary"
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.1)'
                      }
                    }}
                  >
                    {isMobile ? '' : '로그아웃'}
                  </Button>
                </Box>
              </Toolbar>
            </AppBar>

            <Paper
              elevation={3}
              sx={{
                padding: isMobile ? 3 : 6,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 3
              }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                  onClick={handleRealtimeBus}
                >
                  <BusIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom color="primary">
                    실시간 버스 정보
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    현재 운행 중인 버스의 실시간 위치와 도착 정보를 확인하세요
                  </Typography>
                </Paper>

                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                  onClick={handleRouteSearch}
                >
                  <SearchIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom color="primary">
                    노선 검색
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    출발지와 도착지를 입력하여 최적의 버스 노선을 찾아보세요
                  </Typography>
                </Paper>

                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                  onClick={handleFavorite}
                >
                  <StarIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom color="primary">
                    즐겨찾기
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    자주 이용하는 버스 정류장과 노선을 즐겨찾기에 추가하세요
                  </Typography>
                </Paper>
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* 서비스 준비중 모달 */}
        <Dialog
          open={openServiceModal}
          onClose={handleCloseServiceModal}
          aria-labelledby="service-modal-title"
          aria-describedby="service-modal-description"
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 300
            }
          }}
        >
          <DialogTitle 
            id="service-modal-title"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'primary.main',
              fontWeight: 'bold'
            }}
          >
            <InfoIcon color="primary" />
            서비스 준비중
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="service-modal-description" sx={{ fontSize: '1.1rem' }}>
              노선 검색 서비스가 현재 준비중입니다.
              <br />
              빠른 시일 내에 서비스를 제공하겠습니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseServiceModal} 
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1
              }}
            >
              확인
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Home; 