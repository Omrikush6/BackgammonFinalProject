import { useState, useCallback, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import debounce from 'lodash/debounce';
import { TOKEN_CLAIMS, AUTH_ENDPOINTS } from '../constants';
import { tokenUtils } from '../utils/tokenutils';

export const useAuth = () => {
  // Memoize token parsing logic
  const parseToken = useMemo(() => 
    (token) => {
      if (!token) return null;
      try {
        const decoded = jwtDecode(token);
        return {
          exp: decoded.exp,
          id: decoded[TOKEN_CLAIMS.USER_ID],
          name: decoded[TOKEN_CLAIMS.USER_NAME],
        };
      } catch {
        return null;
      }
    }, 
  []);

  const [authState, setAuthState] = useState(() => {
    // Initialize state with token check
    const token = tokenUtils.getToken();
    const parsedToken = parseToken(token);
    return {
      isLoggedIn: !!parsedToken && Date.now() <= parsedToken.exp * 1000,
      user: parsedToken ? { id: parsedToken.id, name: parsedToken.name } : null,
      isInitialized: false
    };
  });

  // Memoize the token check function
  const checkToken = useMemo(() => 
    () => {
      const token = tokenUtils.getToken();
      if (!token) return false;

      const parsedToken = parseToken(token);
      return !!parsedToken && Date.now() <= parsedToken.exp * 1000;
    },
  [parseToken]);

  // Create a debounced refresh token function
  const debouncedRefreshToken = useMemo(
    () => debounce(async (onSuccess, onError) => {
      const token = tokenUtils.getToken();
      if (!token) {
        onError();
        return;
      }

      try {
        const response = await fetch(AUTH_ENDPOINTS.REFRESH, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const { Token } = await response.json();
        const parsedToken = parseToken(Token);
        
        if (!parsedToken) throw new Error('Invalid token received');

        tokenUtils.setToken(Token);
        onSuccess(parsedToken);
      } catch (error) {
        console.error('Token refresh failed:', error);
        tokenUtils.removeToken();
        onError();
      }
    }, 1000, { leading: true, trailing: false }), // Execute on the leading edge only
    [parseToken]
  );

  // Wrapper for the debounced refresh token
  const refreshToken = useCallback(async () => {
    return new Promise((resolve) => {
      debouncedRefreshToken(
        (parsedToken) => {
          setAuthState({
            isLoggedIn: true,
            user: { id: parsedToken.id, name: parsedToken.name },
            isInitialized: true
          });
          resolve(true);
        },
        () => {
          setAuthState({
            isLoggedIn: false,
            user: null,
            isInitialized: true
          });
          resolve(false);
        }
      );
    });
  }, [debouncedRefreshToken]);

  // Memoize logout function
  const logout = useMemo(() => 
    async () => {
      const token = tokenUtils.getToken();
      if (token) {
        try {
          await fetch(AUTH_ENDPOINTS.LOGOUT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
      
      tokenUtils.removeToken();
      setAuthState({
        isLoggedIn: false,
        user: null,
        isInitialized: true
      });
    },
  []);

  // Memoize login function
  const login = useMemo(() => 
    (token) => {
      const parsedToken = parseToken(token);
      if (!parsedToken) {
        console.error('Invalid token received during login');
        return;
      }

      tokenUtils.setToken(token);
      setAuthState({
        isLoggedIn: true,
        user: { id: parsedToken.id, name: parsedToken.name },
        isInitialized: true
      });
    },
  [parseToken]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenUtils.getToken();
      if (!token) {
        setAuthState(prev => ({
          ...prev,
          isInitialized: true
        }));
        return;
      }

      if (checkToken()) {
        const parsedToken = parseToken(token);
        setAuthState({
          isLoggedIn: true,
          user: { id: parsedToken.id, name: parsedToken.name },
          isInitialized: true
        });
      } else {
        await refreshToken();
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      debouncedRefreshToken.cancel();
    };
  }, [checkToken, parseToken, refreshToken, debouncedRefreshToken]);

  // Memoize the return value
  return useMemo(() => ({
    ...authState,
    login,
    logout,
    refreshToken,
  }), [authState, login, logout, refreshToken]);
};