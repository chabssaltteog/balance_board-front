"use client";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect } from "react";

import { constant } from "@/utils/constant";

interface IRefreshToken {
  accessToken?: string;
  message?: string;
}
export default function TokenLoginComponent() {
  const { update, data } = useSession();
  const accessToken = data?.user.accessToken;
  const refreshToken = data?.user.refreshToken;
  console.log(accessToken, refreshToken);
  /**
   *
   * @param type 1. token 2. refreshToken
   */
  const checktokenValidation = (type: number, token: string) => {
    if (!token) return false;
    const { exp } = jwtDecode(token);
    if (!exp) return false;
    let tokenTime;
    if (type === 1) {
      tokenTime = dayjs.unix(exp).subtract(10, "minute");
    } else {
      tokenTime = dayjs.unix(exp);
    }
    const isBefore = tokenTime.isBefore(dayjs());
    return isBefore;
  };

  // 먼저 토큰 만료시간 체크해서 10분전 토큰 재발급
  // 만료되었으면 refreshToken 체크해서 토큰 재발급
  // 둘다 만료되었으면 logout
  // 매번 체크해줘야한다.
  const tokenCheck = () => {
    if (!accessToken || !refreshToken) return;
    const tokenValidation = checktokenValidation(1, accessToken);
    if (!tokenValidation) return;

    const refreshTokenValidation = checktokenValidation(2, refreshToken);
    if (refreshTokenValidation) {
      void signOut({
        redirect: false,
      });
    } else {
      void handleRefreshToken();
    }
  };

  async function handleRefreshToken() {
    if (!accessToken) return;
    if (!refreshToken) return;
    try {
      const res = await fetch(constant.apiUrl + "api/user/login/token", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          refreshToken: refreshToken || "",
        },
        credentials: "include",
      });
      const data: IRefreshToken = await res.json();
      if (data.message) {
        void signOut({
          redirect: false,
        });
        console.log("token 만료");
        return;
      }
      void update({
        accessToken: data.accessToken,
      });
    } catch (err) {
      console.error(err);
      void signOut({
        redirect: false,
      });
    }
  }

  useEffect(() => {
    const interval = setInterval(
      () => {
        tokenCheck();
      },
      5 * 60 * 1000,
    ); // 5분에 한 번씩 실행되도록 설정

    return () => clearInterval(interval);
  }, [refreshToken]);
  return <></>;
}
