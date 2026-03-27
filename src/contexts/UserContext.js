import { useContext, createContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';

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
      dispatch({ type: USER_ACTIONS.SET_USER, payload: user });
    } catch {
      dispatch({ type: USER_ACTIONS.LOGOUT });
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    dispatch({ type: USER_ACTIONS.LOGOUT });
    window.location.href = '/';
  }, []);

  const updateUser = useCallback((data) => {
    dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: data });
  }, []);

  // Supabase Broadcast: listen for credit updates (no RLS needed)
  useEffect(() => {
    if (!state.data?.id) return;

    const channel = supabase
      .channel(`user-credits:${state.data.id}`)
      .on('broadcast', { event: 'credits_updated' }, (payload) => {
        console.log('[realtime] credits updated:', payload.payload);
        dispatch({
          type: USER_ACTIONS.UPDATE_USER,
          payload: payload.payload,
        });
      })
      .subscribe((status) => {
        console.log('[realtime] broadcast subscription:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.data?.id]);

  // Initialize on mount
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
