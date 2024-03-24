"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // client일떄
import React, { ChangeEvent, FormEvent, useState } from "react";

import Input from "@/app/_component/Input";

import styles from "./loginForm.module.css";

export interface ILogin {
  email: string;
  jwtToken: {
    accessToken: string;
    refreshToken: string;
  };
  refreshToken: string;
  accessToken?: string;
  nickname: string;
  userId: number;
  isLogin: number;
  message?: string;
  imageType: number;
  status?: number;
}

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [disabledBtn, setDisabledBtn] = useState(true);
  // const disabledBtn = !form.email || !form.password;
  const [errMsg, setErrMsg] = useState("");
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    if (form.email && form.password) {
      setDisabledBtn(false);
    }
  };
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        username: form.email,
        password: form.password,
        redirect: false,
      });
      if (res && res.ok !== true) {
        setErrMsg("login false");
        return;
      }
      router.push("/");
    } catch (err) {
      console.error(err);
      setErrMsg("아이디(이메일) 또는 비밀번호를 확인해주세요!");
    }
  };
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.input_container}>
        <Input
          className={styles.input}
          onChange={handleChange}
          name="email"
          type="text"
          placeholder="이메일"
          value={form.email}
        />
        {form.email && (
          <button
            type="button"
            onClick={() =>
              setForm((prev) => {
                return { ...prev, email: "" };
              })
            }
          >
            <Image className={styles.ico} src="/x-circle-md.svg" alt="닫기 아이콘" width={24} height={24} />
          </button>
        )}
      </div>
      <div className={styles.input_container}>
        <Input
          className={styles.input}
          onChange={handleChange}
          name="password"
          type="password"
          placeholder="비밀번호"
          value={form.password}
        />
        {form.password && (
          <button
            type="button"
            onClick={() =>
              setForm((prev) => {
                return { ...prev, password: "" };
              })
            }
          >
            <Image className={styles.ico} src="/x-circle-md.svg" alt="닫기 아이콘" width={24} height={24} />
          </button>
        )}
        {errMsg && <p className={styles.err_msg}>아이디(이메일) 또는 비밀번호를 확인해주세요!</p>}
      </div>
      <button
        type="submit"
        disabled={disabledBtn}
        className={`${styles.login_btn} ${!disabledBtn ? styles.active : ""}`}
      >
        로그인
      </button>
      <Link className={styles.link} href={"/join"}>
        이메일로 회원가입
      </Link>
    </form>
  );
}
