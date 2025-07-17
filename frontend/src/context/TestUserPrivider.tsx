// src/context/TestUserProvider.tsx

'use client';

import { createContext, useContext } from 'react';

interface User {
  firebase_uid: string;
  child_name: string;
  current_plan: 'free' | 'premium';
}

interface AuthContextType {
  currentUser: User | null;
}

const mockUser: User = {
  firebase_uid: 'test-uid',
  child_name: 'さき',
  current_plan: 'premium',
};

const AuthContext = createContext<AuthContextType>({ currentUser: mockUser });

export const TestUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <AuthContext.Provider value={{ currentUser: mockUser }}>
    {children}
  </AuthContext.Provider>
);

// useAuthのモック用
export const useAuth = () => useContext(AuthContext);
