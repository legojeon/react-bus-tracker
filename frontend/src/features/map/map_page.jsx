import React, { useEffect, useRef, useState } from 'react';
import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RefreshIcon from '@mui/icons-material/Refresh';
import { API_BASE_URL } from '../../utils/api';

// .env에서 VITE_NAVER_CLIENT_ID를 읽어옴
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;

// API 키 검증
if (!NAVER_CLIENT_ID || NAVER_CLIENT_ID === 'your-naver-client-id-here') {
  console.error('VITE_NAVER_CLIENT_ID가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

function loadNaverMapScript(callback) {
  // 이미 로드된 경우 중복 로드 방지
  if (document.getElementById('naver-map-script')) {
    if (window.naver && window.naver.maps) callback();
    else {
      // 스크립트는 있지만 아직 로딩 중일 수 있으니 이벤트로 대기
      document.getElementById('naver-map-script').addEventListener('load', callback);
    }
    return;
  }
  const script = document.createElement('script');
  script.id = 'naver-map-script';
  script.type = 'text/javascript';
  script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`;
  script.async = true;
  script.onload = callback;
  document.body.appendChild(script);
}

const MapPage = ({ onBack, selectedStation: initialSelectedStation }) => {
  const mapRef = useRef(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [busInfo, setBusInfo] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadNaverMapScript(() => {
      if (!window.naver) return;
      mapRef.current = new window.naver.maps.Map('map', {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 13,
      });
    });
  }, []);

  // 즐겨찾기 -> 지도 이동시 sation객체 attribute name 변경
  useEffect(() => {
    if (initialSelectedStation && initialSelectedStation.arsId && initialSelectedStation.x && initialSelectedStation.y) {
      handleStationSelect({
        ...initialSelectedStation,
        stNm: initialSelectedStation.stationName || initialSelectedStation.stNm,
        x: initialSelectedStation.x,
        y: initialSelectedStation.y,
        arsId: initialSelectedStation.arsId
      });
    }
    // eslint-disable-next-line
  }, [initialSelectedStation]);

  const handleSearch = async () => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/stations/search?name=${encodeURIComponent(search)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.stations);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // 401 오류 처리 함수
  const handleAuthError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); // 로그인 페이지로 리다이렉트
  };

  // 즐겨찾기 여부 확인
  const checkFavoriteStatus = async (arsId, routeNumber) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        handleAuthError();
        return false;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await fetch(
        `${API_BASE_URL}/api/saved-routes/check?ars_id=${arsId}&route_number=${routeNumber}`,
        { headers }
      );
      
      if (response.status === 401) {
        handleAuthError();
        return false;
      }
      
      const data = await response.json();
      return data.isFavorite;
    } catch (error) {
      console.error('즐겨찾기 상태 확인 오류:', error);
      return false;
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = async (arsId, routeNumber, routeId = null) => {
    const key = `${arsId}-${routeNumber}`;
    const isFavorite = favorites.has(key);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        handleAuthError();
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      
      if (isFavorite) {
        // 삭제
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
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
          setBusInfo(prev => prev && prev.map(bus =>
            bus.rtNm === routeNumber ? { ...bus, isFavorite: false } : bus
          ));
        }
      } else {
        // 추가
        const params = new URLSearchParams({
          ars_id: arsId,
          route_number: routeNumber
        });
        if (routeId) {
          params.append('route_id', routeId);
        }
        

        
        const response = await fetch(
          `${API_BASE_URL}/api/saved-routes/save?${params.toString()}`,
          { 
            method: 'POST',
            headers
          }
        );
        
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        
        if (response.ok) {
          setFavorites(prev => new Set([...prev, key]));
          setBusInfo(prev => prev && prev.map(bus =>
            bus.rtNm === routeNumber ? { ...bus, isFavorite: true } : bus
          ));
        }
      }
    } catch (error) {
      console.error('즐겨찾기 토글 오류:', error);
    }
  };

  const handleStationSelect = async (station) => {
    if (!mapRef.current || !window.naver) return;

    // 선택된 정류소 정보 저장
    setSelectedStation(station);

    // 지도 중심을 선택된 정류소로 이동
    const latlng = new window.naver.maps.LatLng(station.y, station.x);
    mapRef.current.setCenter(latlng);
    mapRef.current.setZoom(17);

    // 기존 마커들 제거
    if (window.searchMarker) {
      window.searchMarker.setMap(null);
    }
    if (window.nearbyMarkers) {
      window.nearbyMarkers.forEach(marker => marker.setMap(null));
    }
    window.nearbyMarkers = [];

    // 선택된 정류소 마커 생성 (빨간색)
    window.searchMarker = new window.naver.maps.Marker({
      position: latlng,
      map: mapRef.current,
      icon: {
        path: window.naver.maps.SymbolPath.CIRCLE,
        fillColor: '#FF0000',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 10
      },
    });

    // 버스 도착 정보 가져오기
    try {
      const busResponse = await fetch(
        `${API_BASE_URL}/api/stations/arrival_info?ars_id=${station.arsId}`
      );
      const busData = await busResponse.json();
      
      if (busData.success) {
        // 각 버스의 즐겨찾기 상태 확인
        const busesWithFavorites = await Promise.all(
          busData.buses.map(async (bus) => {
            const isFavorite = await checkFavoriteStatus(station.arsId, bus.rtNm);
            return { ...bus, isFavorite };
          })
        );
        setBusInfo(busesWithFavorites);
        // 전체 즐겨찾기 set도 갱신
        const favoriteSet = new Set();
        busesWithFavorites.forEach(bus => {
          if (bus.isFavorite) favoriteSet.add(`${station.arsId}-${bus.rtNm}`);
        });
        setFavorites(favoriteSet);
      } else {
        setBusInfo([]);
      }
    } catch (error) {
      console.error('버스 정보 조회 중 오류 발생:', error);
      setBusInfo([]);
    }

    // 주변 정류소들 가져오기
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/stations/nearby?ars_id=${station.arsId}&x=${station.x}&y=${station.y}`
      );
      const data = await response.json();
      
      if (data.success && data.stations.length > 0) {
        // 주변 정류소들 마커 생성 (파란색)
        data.stations.forEach(nearbyStation => {
          const nearbyLatlng = new window.naver.maps.LatLng(nearbyStation.y, nearbyStation.x);
          const nearbyMarker = new window.naver.maps.Marker({
            position: nearbyLatlng,
            map: mapRef.current,
            icon: {
              path: window.naver.maps.SymbolPath.CIRCLE,
              fillColor: '#0066FF',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 1,
              scale: 8
            },
          });
          
          // 마커 클릭 시 해당 정류소로 다시 검색
          window.naver.maps.Event.addListener(nearbyMarker, 'click', () => {
            // 검색창에 정류소명 입력
            setSearch(nearbyStation.stNm);
            // 해당 정류소로 지도 이동 및 마커 표시
            handleStationSelect(nearbyStation);
          });
          
          window.nearbyMarkers.push(nearbyMarker);
        });
        

      }
    } catch (error) {
      console.error('주변 정류소 검색 중 오류 발생:', error);
    }

    // 검색 결과 숨기기
    setShowResults(false);
    setSearch('');
  };

  // 즐겨찾기 아이콘 클릭 핸들러
  const handleFavoriteClick = (arsId, routeNumber, routeId = null) => {
    toggleFavorite(arsId, routeNumber, routeId);
  };

  const handleRefreshBusInfo = async () => {
    if (!selectedStation) return;
    
    try {
      const busResponse = await fetch(
        `${API_BASE_URL}/api/stations/arrival_info?ars_id=${selectedStation.arsId}`
      );
      const busData = await busResponse.json();
      
      if (busData.success) {
        // 각 버스의 즐겨찾기 상태 확인
        const busesWithFavorites = await Promise.all(
          busData.buses.map(async (bus) => {
            const isFavorite = await checkFavoriteStatus(selectedStation.arsId, bus.rtNm);
            return { ...bus, isFavorite };
          })
        );
        setBusInfo(busesWithFavorites);
        // 전체 즐겨찾기 set도 갱신
        const favoriteSet = new Set();
        busesWithFavorites.forEach(bus => {
          if (bus.isFavorite) favoriteSet.add(`${selectedStation.arsId}-${bus.rtNm}`);
        });
        setFavorites(favoriteSet);
      }
    } catch (error) {
      console.error('버스 정보 새로고침 중 오류 발생:', error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 100,
      background: '#f5f5f5',
      overflow: 'hidden',
    }}>
      {/* 상단 검색 입력창 */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        minWidth: 280,
        maxWidth: 400
      }}>
        <IconButton onClick={() => onBack && onBack()} sx={{ mr: 1 }}>
          <HomeIcon sx={{ color: '#1976d2' }} />
        </IconButton>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="정류소명을 입력하세요"
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              background: 'transparent',
              width: 180,
              marginLeft: 0,
              marginRight: 12,
              color: '#222',
              padding: '6px 0'
            }}
          />
        </div>
        <IconButton onClick={handleSearch} sx={{ ml: 1 }}>
          <SearchIcon sx={{ color: '#1976d2', fontSize: 26 }} />
        </IconButton>
      </div>

      {/* 검색 결과 드롭다운 */}
      {showResults && searchResults.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxHeight: 300,
          overflowY: 'auto',
          minWidth: 280,
          maxWidth: 400
        }}>
          {searchResults.map((station, index) => (
            <div
              key={index}
              onClick={() => handleStationSelect(station)}
              style={{
                padding: '12px 16px',
                borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#333',
                ':hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {station.stNm}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                정류소 ID: {station.arsId}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 버스 정보 패널 (화면 하단) */}
      {busInfo && selectedStation && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          maxHeight: '40vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* 정류소 이름 헤더 (고정) */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.95)',
            position: 'sticky',
            top: 0,
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h3 style={{ 
              margin: '0', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              color: '#1976d2'
            }}>
            {selectedStation.stNm}
            </h3>
            <IconButton 
                onClick={handleRefreshBusInfo}
                sx={{ 
                    color: '#1976d2',
                    position: 'absolute',
                    right: 20
                  }}
            >
                <RefreshIcon fontSize="small" />
            </IconButton>
          </div>
          {/* 버스 리스트 (스크롤 영역) */}
          <div style={{ 
            padding: '16px 20px 16px 20px',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0
          }}>
            {busInfo.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {[...busInfo].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)).map((bus, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: bus.isFavorite ? '2px solid #1976d2' : '1px solid #e9ecef'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        {bus.rtNm}번
                        {bus.direction && (
                          <span style={{
                            fontSize: '0.9rem',
                            color: '#333',
                            fontWeight: 'normal',
                            marginLeft: 6
                          }}>
                            [{bus.direction} 방면]
                          </span>
                        )}
                      </span>
                      {/* 즐겨찾기 아이콘 */}
                      <IconButton size="small" onClick={() => handleFavoriteClick(selectedStation.arsId, bus.rtNm, bus.busRouteId)} sx={{ color: bus.isFavorite ? '#1976d2' : '#BDBDBD', ml: 1 }}>
                        {bus.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                    </div>
                    {/* 도착정보 두 개의 동적 색상 박스 */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: 8 }}>
                      {[bus.arrmsg1, bus.arrmsg2].filter(Boolean).map((msg, i) => {
                        // 10분 이내 또는 '곧 도착'이면 빨강, 아니면 회색
                        const isSoon = /곧 도착|[0-9]+분/.test(msg) && (() => {
                          if (msg.includes('곧 도착')) return true;
                          const match = msg.match(/([0-9]+)분/);
                          return match && parseInt(match[1], 10) <= 10;
                        })();
                        const bgColor = isSoon ? '#ffcdd2' : '#eeeeee';
                        const color = isSoon ? '#b71c1c' : '#666';
                        return (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              background: bgColor,
                              color,
                              borderRadius: 6,
                              padding: '6px 0',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.95rem',
                              boxShadow: '0 1px 2px rgba(229,57,53,0.05)'
                            }}
                          >
                            {msg}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#666',
                fontSize: '0.9rem'
              }}>
                이 정류소를 지나는 버스 정보가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 지도 */}
      <div id="map" style={{
        position: 'absolute',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
      }}></div>
    </div>
  );
};

export default MapPage;
