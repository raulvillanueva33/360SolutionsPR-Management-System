import { useState, useEffect, useCallback, useRef } from 'react';

export default function useGeolocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
    watch = false,
  } = options;

  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef(null);

  const onSuccess = useCallback((pos) => {
    setPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      timestamp: pos.timestamp,
    });
    setError(null);
    setLoading(false);
  }, []);

  const onError = useCallback((err) => {
    const messages = {
      1: 'Permiso de ubicacion denegado.',
      2: 'Ubicacion no disponible.',
      3: 'Tiempo de espera agotado.',
    };
    setError(messages[err.code] || err.message);
    setLoading(false);
  }, []);

  const geoOptions = { enableHighAccuracy, timeout, maximumAge };

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalizacion no soportada.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
  }, [onSuccess, onError, enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    if (!watch || !navigator.geolocation) return;
    setLoading(true);
    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions);
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [watch, onSuccess, onError, enableHighAccuracy, timeout, maximumAge]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  function distanceBetween(pos1, pos2) {
    const R = 6371e3;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(pos2.lat - pos1.lat);
    const dLng = toRad(pos2.lng - pos1.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  return { position, error, loading, getCurrentPosition, stopWatching, distanceBetween };
}
