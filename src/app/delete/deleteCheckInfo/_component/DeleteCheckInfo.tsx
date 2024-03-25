"use client";

import Image from "next/image";
import { useEffect } from "react";

import { useUserDataContext } from "@/context/AuthContext";

import x_circle from "../../../../../public/x-circle-md.svg";
import styles from "./deleteCheckInfo.module.css";

interface IDeleteCheckPageProps {
  isPasswordCorrect: boolean;
  setIsPasswordCorrect: React.Dispatch<React.SetStateAction<boolean>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  isError: boolean;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DeleteCheckInfo({
  isPasswordCorrect,
  setIsPasswordCorrect,
  password,
  setPassword,
  isError,
  setIsError,
}: IDeleteCheckPageProps) {
  const { userInfo } = useUserDataContext();

  useEffect(() => {
    setIsPasswordCorrect(false);
  }, [password, setIsPasswordCorrect]);

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsError(true);
    setPassword(e.target.value);
  };

  const handleClearPassword = () => {
    setPassword("");
    setIsError(true);
  };

  return (
    <div className={styles.deleteCheckContainer}>
      <div className={styles.deleteHeader}>
        <p>안전한 탈퇴를 위해</p>
        <p>가입정보를 확인해주세요.</p>
      </div>
      <div className={styles.deleteCheckPassword}>
        <span>비밀번호를 입력해주세요.</span>
      </div>
      <div className={styles.userInfoContainer}>
        <input type="id" value={userInfo.email} readOnly className={styles.userInfoEmail} />
        <div className={styles.userInfoPasswordContainer}>
          <input
            type="password"
            value={password}
            onChange={handlePassword}
            className={styles.userInfoPassword}
            placeholder="비밀번호"
            maxLength={16}
          />
          <div className={styles.deleteImgBox}>
            {password && (
              <Image
                src={x_circle}
                alt="비밀번호 확인 상태"
                width={24}
                height={24}
                onClick={handleClearPassword}
                className={`${styles.deleteImg} ${isPasswordCorrect ? styles.disabled : ""}`}
              />
            )}
          </div>
        </div>
        <div className={`${styles.seperator} ${isError ? "" : styles.isError}`}></div>
        <div className={styles.errorMessageContainer}>
          {!isError && <div className={styles.errorMessage}>비밀번호를 확인해주세요!</div>}
        </div>
      </div>
    </div>
  );
}
