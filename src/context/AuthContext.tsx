"use client";
import React, { createContext, useContext, useState } from "react";

interface IJwtToken {
  accessToken: string;
  refreshToken: string;
}

// 초기 데이터 타입
export interface IAuth {
  email: string;
  jwtToken: IJwtToken;
  nickname: string;
  userId: number;
  isLogin: number;
  imageType: number;
}

// 초기 데이터
const initialData: IAuth = {
  email: "",
  jwtToken: {
    accessToken: "",
    refreshToken: "",
  },
  nickname: "",
  userId: 0,
  imageType: 1,
  isLogin: 0, // 0. 로그인 api 실행 전, 1. 로그인 완료, 2. 로그인 실패
};

// Context의 타입
interface DataContextType {
  userInfo: IAuth;
  setUserData: (payload: IAuth) => void;
  logoutContext: () => void;
}

// createContext를 사용하여 새로운 컨텍스트를 생성
export const DataContext = createContext<DataContextType | undefined>(undefined);

// 컨텍스트를 사용하는 커스텀 훅
export const useUserDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useJoinDataContext must be used within a JoinContextProvider");
  }
  return context;
};

// DataContext의 Provider를 만드는 컴포넌트
export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [userInfo, setUserInfo] = useState<IAuth>(initialData);

  const setUserData = (payload: IAuth) => {
    setUserInfo(payload);
  };

  const logoutContext = () => {
    setUserInfo({ ...initialData, isLogin: 2 });
  };

  return (
    <DataContext.Provider
      value={{
        userInfo,
        setUserData,
        logoutContext,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
