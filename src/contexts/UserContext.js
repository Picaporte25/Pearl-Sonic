import { useContext, createContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { getSocket, connectSocket, joinRoom, disconnectSocket } from '@/lib/socket';

const USER_ACTIONS = {
  SET_USER: 'SET_USER',
  UPDATE_USER: 'UPDATE_USER',
  LOGOUT: 'LOGOUT',
};

const initialState = {
  data: null,
  status: 'loading',
};

function userReducer(state, action) {
  switch (action.type) {
    case USER_ACTIONS.SET_USER:
      return { data: action.payload, status: 'success' };

    case USER_ACTIONS.UPDATE_USER:
      return {
        ...state,
        data: state.data ? { ...state.data, ...action.payload } : null,
      };

    case USER_ACTIONS.LOGOUT:
      return { data: null, status: 'idle' };

    default:
      return state;
  }
}

const UserContext = createContext(undefined);

export function ProvideUser({ children }) {
  const provider = useProvideUser();
  return <UserContext.Provider value={provider}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a ProvideUser');
  }
  return context;
};

function useProvideUser() {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const isLogged = useMemo(() => !!state.data?.id, [state.data?.id]);

  const getUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/verify', { credentials: 'include' });
      if (!res.ok) {
        dispatch({ type: USER_ACTIONS.LOGOUT });
        return;
      }
      const { user } = await res.json();
      console.log('[user] verified:', user);
      dispatch({ type: USER_ACTIONS.SET_USER, payload: user });
    } catch (err) {
      console.error('[user] verify error:', err);
      dispatch({ type: USER_ACTIONS.LOGOUT });
    }
  }, []);

  const logout = useCallback(async () => {
    disconnectSocket();
    // Clear HttpOnly cookie by setting it expired via a server call
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    dispatch({ type: USER_ACTIONS.LOGOUT });
    window.location.href = '/';
  }, []);

  const updateUser = useCallback((data) => {
    dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: data });
  }, []);

  // Connect socket and join room when user is available
  useEffect(() => {
    if (!state.data?.id) return;

    const socket = getSocket();
    let reconnectInterval;

    const handleConnect = () => {
      console.log('[socket] connected');
      clearInterval(reconnectInterval);
      joinRoom(state.data.id);
    };

    const handleDisconnect = (reason) => {
      console.log('[socket] disconnected:', reason);
      reconnectInterval = setInterval(() => {
        connectSocket();
      }, 5000);
    };

    const handleConnectError = (err) => {
      console.error('[socket] connect error:', err.message);
    };

    const handleUserUpdate = (userData) => {
      console.log('[socket] user:update received:', userData);
      dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: userData });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('user:update', handleUserUpdate);

    connectSocket();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('user:update', handleUserUpdate);
      clearInterval(reconnectInterval);
    };
  }, [state.data?.id]);

  // Initialize on mount — always call verify, browser sends HttpOnly cookie automatically
  useEffect(() => {
    getUser();
  }, [getUser]);

  return {
    user: state.data,
    status: state.status,
    isLogged,
    getUser,
    updateUser,
    logout,
  };
}
