import React from "react";

import Topnav from "../_component/MainNavbar";
import { getServerSession } from "next-auth";
import { Maintab } from "../_component/Tabs";
import { authOptions } from "@/auth";
import PostCardList from "./_component/PostCardList";
import WriteFloating from "./_component/WriteFloating";
import styles from "./mainLayout.module.css";

export default async function MainLayout() {
  const session = await getServerSession(authOptions);
  const userInfo = session?.user;
  return (
    <div className={styles.container}>
      <div className={styles.top_container}>
        <Topnav />
        <Maintab />
      </div>
      <PostCardList userInfo={userInfo} />
      <WriteFloating />
    </div>
  );
}
