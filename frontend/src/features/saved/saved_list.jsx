import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Box, 
  Chip,
  Grid,
  AppBar,
  Toolbar,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Star as StarIcon,
  LocationOn as LocationIcon,
  DirectionsBus as BusIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { API_BASE_URL } from '../../utils/api';

const SavedList = ({ onBack, onSelectStation }) => {
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 도착정보에서 "[~번째 전]" 부분 제거
  const cleanArrivalMessage = (message) => {
    if (!message) return message;
    // "[~번째 전]" 패턴 제거
    return message.replace(/\s*\[[^\]]*번째\s*전\]\s*/g, '').trim();
  };

  // 401 오류 처리 함수
  const handleAuthError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); // 로그인 페이지로 리다이렉트
  };

  useEffect(() => {
    fetchSavedRoutes();
  }, []);

  const fetchSavedRoutes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        handleAuthError();
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await fetch(`${API_BASE_URL}/api/saved-routes/list`, { headers });
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 정류소별로 그룹화
        const groupedByStation = data.savedRoutes.reduce((acc, route) => {
          const key = route.arsId;
          if (!acc[key]) {
            acc[key] = {
              arsId: route.arsId,
              stationName: route.stationName,
              longitude: route.longitude,
              latitude: route.latitude,
              routes: []
            };
          }
          acc[key].routes.push({
            routeNumber: route.routeNumber,
            arrmsg1: route.arrmsg1,
            arrmsg2: route.arrmsg2,
            direction: route.direction
          });
          return acc;
        }, {});
        
        setSavedRoutes(Object.values(groupedByStation));
      } else {
        setError('즐겨찾기 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 목록 조회 오류:', error);
      setError('즐겨찾기 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFavorite = async (arsId, routeNumber) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        handleAuthError();
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await fetch(
        `${API_BASE_URL}/api/saved-routes/delete?ars_id=${arsId}&route_number=${routeNumber}`,
        { 
          method: 'DELETE',
          headers
        }
      );
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (response.ok) {
        // 목록에서 제거
        setSavedRoutes(prev => prev.map(station => {
          if (station.arsId === arsId) {
            return {
              ...station,
              routes: station.routes.filter(route => route.routeNumber !== routeNumber)
            };
          }
          return station;
        }).filter(station => station.routes.length > 0)); // 빈 정류소 제거
      }
    } catch (error) {
      console.error('즐겨찾기 삭제 오류:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 상단 앱바 */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            즐겨찾기
          </Typography>
          <IconButton color="inherit" onClick={fetchSavedRoutes} sx={{ ml: 1 }}>
            <RefreshIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {savedRoutes.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            minHeight="60vh"
            textAlign="center"
          >
            <StarIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              즐겨찾기한 버스가 없습니다
            </Typography>
            <Typography variant="body2" color="textSecondary">
              지도에서 버스를 즐겨찾기에 추가해보세요!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Grid container spacing={3} sx={{ alignItems: 'stretch', justifyContent: 'center', maxWidth: '1200px' }}>
            {savedRoutes.map((station) => (
              <Grid
                key={station.arsId}
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                }}
              >
                                                  <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px solid #1976d2',
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 320, md: 280, lg: 280 },
                    cursor: onSelectStation ? 'pointer' : 'default',
                    '& .MuiCardContent-root': {
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '16px',
                    },
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                      backgroundColor: onSelectStation ? '#e3f2fd' : undefined
                    }
                  }}
                  onClick={() => onSelectStation && onSelectStation({
                    ...station,
                    x: station.longitude,
                    y: station.latitude,
                    stNm: station.stationName
                  })}
                >
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minHeight: { xs: 180, sm: 180, md: 100 } }}>
                    {/* 정류소 정보 */}
                    <Box display="flex" alignItems="flex-start" mb={2}>
                      <LocationIcon sx={{ color: '#1976d2', mr: 1, mt: 0, flexShrink: 0 }} />
                      <Typography variant="h6" component="div" sx={{ wordBreak: 'break-word', lineHeight: 1.2 }}>
                        {station.stationName}
                      </Typography>
                    </Box>

                    {/* 버스 노선들 */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, width: '100%', minHeight: { xs: 80, sm: 80, md: 100 } }}>
                      {station.routes.map((route) => (
                        <Box
                          key={`${station.arsId}-${route.routeNumber}`}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1.5,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            backgroundColor: '#fafafa',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%' }}>
                              <BusIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2', display: 'inline-block' }}>
                                  {route.routeNumber}번
                                  {route.direction && (
                                    <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal', marginLeft: 4 }}>
                                      [{route.direction}]
                                    </span>
                                  )}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, justifyContent: 'center', width: '100%' }}>
                                  {[route.arrmsg1, route.arrmsg2].filter(Boolean).map((msg, i) => {
                                    // 10분 이내 또는 '곧 도착'이면 빨강, 아니면 회색
                                    const isSoon = (() => {
                                      if (msg.includes('곧 도착')) return true;
                                      if (msg.includes('정보 없음')) return false;
                                      // "분초" 패턴(예: 9분59초, 5분2초 등)
                                      const minSecMatch = msg.match(/(\d+)분(\d+)초/);
                                      if (minSecMatch) {
                                        const min = parseInt(minSecMatch[1], 10);
                                        // 10분 이내면 빨간색
                                        return min < 10;
                                      }
                                      // "분"만 있는 경우(예: 8분후)
                                      const minMatch = msg.match(/(\d+)분/);
                                      if (minMatch) {
                                        const min = parseInt(minMatch[1], 10);
                                        return min < 10;
                                      }
                                      return false;
                                    })();
                                    const bgColor = isSoon ? '#ffcdd2' : '#eeeeee';
                                    const color = isSoon ? '#b71c1c' : '#666';
                                    return (
                                      <Box
                                        key={i}
                                        sx={{
                                          px: 1,
                                          py: 0.5,
                                          backgroundColor: bgColor,
                                          color: color,
                                          borderRadius: 0.5,
                                          fontSize: '0.75rem',
                                          fontWeight: 'bold',
                                          minWidth: 'fit-content',
                                          textAlign: 'center'
                                        }}
                                      >
                                        {cleanArrivalMessage(msg)}
                                      </Box>
                                    );
                                  })}
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteFavorite(station.arsId, route.routeNumber);
                            }}
                            sx={{ color: '#1976d2' }}
                          >
                            <StarIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            </Grid>
          </Box>
        )}
      </Container>
    </div>
  );
};

export default SavedList;
