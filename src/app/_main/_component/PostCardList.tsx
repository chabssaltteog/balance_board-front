"use client";
import React, { Fragment, useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";

import LoginModal from "@/app/_component/LoginModal";
import { useModal } from "@/hook/useModal";
import ModalContainer from "@/app/_component/ModalContainer";
import ModalPortal from "@/app/_component/ModalPortal";
import PostCard from "@/app/_component/PostCard";
import { IPost } from "@/modal/Post";

import { getCategoryPostList, getPostList } from "../_lib/getPosts";
import styles from "./postCartList.module.css";

import WriteFloating from "./WriteFloating";
import { ILogin } from "@/app/login/_component/LoginForm";

export default function PostCardList({ userInfo }: { userInfo: ILogin | undefined }) {
  const { openModal, handleOpenMoal, handleCloseModal } = useModal();

  const openLoginModal = () => {
    if (userInfo?.isLogin !== 1) {
      handleOpenMoal();
    }
  };

  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const { data, fetchNextPage, hasNextPage, isFetching, isPending } = useInfiniteQuery<IPost[], Error>({
    queryKey: ["posts", "all", tab, userInfo?.isLogin],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      if (!tab || tab === "전체") {
        return await getPostList({ pageParam: page, userInfo: userInfo });
      } else {
        return await getCategoryPostList({ pageParam: page, category: tab, userInfo: userInfo });
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (allPages[allPages.length - 1].length / 20 < 1) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });

  const { ref, inView } = useInView({
    threshold: 0,
    delay: 0,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (inView) {
      if (!isFetching && hasNextPage && fetchNextPage) {
        void fetchNextPage();
      }
    }
  }, [inView, isFetching, hasNextPage, fetchNextPage]);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (isPending) {
    <div>loading 중...</div>;
    return;
  }

  return (
    <div>
      <ul className={styles.card_container}>
        {mounted &&
          data?.pages &&
          data?.pages.map((v, i) => (
            <Fragment key={i}>
              {v.map((post) => (
                <li className={styles.card_list} key={post.postId}>
                  <PostCard openLoginModal={openLoginModal} post={post} />
                </li>
              ))}
            </Fragment>
          ))}
      </ul>
      <div ref={ref} style={{ height: 10, backgroundColor: "#FAFAFA" }} />
      <WriteFloating />

      {openModal && (
        <ModalPortal>
          <ModalContainer handleCloseModal={handleCloseModal}>
            <LoginModal handleCloseModal={handleCloseModal} />
          </ModalContainer>
        </ModalPortal>
      )}
    </div>
  );
}
