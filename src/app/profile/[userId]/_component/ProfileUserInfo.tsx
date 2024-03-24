"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { userImgUrl } from "@/utils/userImgUrl";

import { useQueryGetProfileData } from "../_hook/useQueryGetProfileData";
import styles from "./profileUserInfo.module.css";
import { useSession } from "next-auth/react";

export default function ProfileUserInfo({ userId }: { userId: number }) {
  const { data: userData } = useSession();
  const userInfo = userData?.user;
  const { data } = useQueryGetProfileData(userId);

  if (!data) return <>데이터 없음</>;

  return (
    <div className={styles.info_container}>
      <Image src={userImgUrl(data.imageType)} alt="프로필 이미지" width={70} height={70} />
      <div className={styles.user_name_container}>
        <span className={styles.name_position}>{data.nickname}</span>
        {userInfo?.userId === userId && (
          <Link href={"/edit"} className={styles.change_nickname_btn}>
            <Image src={"/pencil-gray-md.svg"} width={24} height={24} alt="닉네임 편집하기" />
          </Link>
        )}
      </div>
      <div className={styles.user_email_area}>{data.email}</div>
    </div>
  );
}
