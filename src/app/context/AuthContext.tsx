
import React, { createContext, useContext} from 'react';
import type { ReactNode } from 'react';
import { useWhoAmI } from '../hooks/useQueries';
import { useNavigate } from 'react-router-dom';
import { axiosPost } from '../lib/api';

export interface AuthContextType {
  user: IUser | null;
  login: (user: IUser) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: boolean;
  isRefetching: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

export type ValidUserRole = "candidate" | "admin";

export type ValidUserStatus = "active" | "inactive";

export interface IUser {
  _id : string
  full_name: string;
  email: string;
  phone: string;
  role: ValidUserRole;
  cv ?: {
    filename: string;
    url: string;
  } | null;
  status ?: ValidUserStatus
  target_department ?: string
    
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isRefetching,
    isError,
    refetch
  } = useWhoAmI();

  const login = async () => {
    await refetch();
    navigate("/admin");
  };

  const logout = async () => {
    await axiosPost("auth/logout", {}, true);
    navigate("/admin/login");
  };

  const loading = isLoading || isRefetching;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        login,
        logout,
        loading,
        error: isError,
        isRefetching,
        isAuthenticated: !!user,
        refetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
