"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useSession } from "next-auth/react";
import { userImgUrl } from "@/utils/userImgUrl";

import profileImg from "../../../public/profile-md-test.png";

export default function NavUserProfile() {
  const { data } = useSession();

  const user = data?.user;
  if (user && user.isLogin === 1) {
    return (
      <Link href={`/profile/${user.userId}`}>
        <Image src={userImgUrl(user.imageType)} width={24} height={24} alt="유저 이미지" />
      </Link>
    );
  } else {
    return (
      <Link href={"/login"}>
        <Image src={profileImg} width={24} height={24} alt="유저 이미지" />
      </Link>
    );
  }
}
