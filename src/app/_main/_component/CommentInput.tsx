import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import Image from "next/image";
import React, { ChangeEventHandler, FormEvent, useState } from "react";

import TextArea from "@/app/_component/TextArea";
import { useSession } from "next-auth/react";
import { IPost } from "@/modal/Post";
import { constant } from "@/utils/constant";
import { userImgUrl } from "@/utils/userImgUrl";

import styles from "./commentInput.module.css";

interface IProps {
  postId: number;
}

export default function CommentInput({ postId }: IProps) {
  const { data: userData } = useSession();
  const userInfo = userData?.user;
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const chat = useMutation({
    mutationFn: () => {
      return fetch(constant.apiUrl + "api/main/new/comment", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.accessToken}`,
        },
        body: JSON.stringify({
          postId,
          userId: userInfo?.userId,
          content: comment,
        }),
      });
    },
    async onSuccess(response) {
      const responseData = await response.json();
      const queryCache = queryClient.getQueryCache();
      const queryKeys = queryCache.getAll().map((cache) => cache.queryKey);
      const filterQuerys = queryKeys.filter((v) => {
        if (v[0] === "posts" && v[1] === "all") {
          return true;
        }
        return false;
      });
      filterQuerys.forEach((queryKey) => {
        const value: IPost | InfiniteData<IPost[]> | undefined = queryClient.getQueryData(queryKey);

        if (value && "pages" in value) {
          const obj = value.pages.flat().find((v) => v.postId === postId);
          if (obj) {
            const pageIndex = value.pages.findIndex((page) => {
              const wow = page.includes(obj);
              return wow;
            });
            const idx = value.pages[pageIndex].findIndex((v) => {
              return v.postId === postId;
            });
            if (idx >= 0) {
              const data = produce(value, (draftData) => {
                const old = draftData.pages[pageIndex][idx].comments[pageIndex];
                if (old) {
                  draftData.pages[pageIndex][idx].comments = [responseData, old];
                } else {
                  draftData.pages[pageIndex][idx].comments = [responseData];
                }
                draftData.pages[pageIndex][idx].commentCount = draftData.pages[pageIndex][idx].commentCount + 1;
              });
              queryClient.setQueryData(queryKey, data);
            }
          }
        }
      });
      setComment("");
    },
  });
  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const { value } = e.target;
    if (comment.length > 500) return;
    setComment(value);
  };

  const handleSumbit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment) return;
    chat.mutate();
  };

  return (
    <form onSubmit={handleSumbit} className={styles.container}>
      {userInfo?.isLogin === 1 ? (
        <Image src={userImgUrl(userInfo?.imageType)} width={24} height={24} alt="유저 이미지" />
      ) : (
        <Image src={"/profile-md-test.png"} width={24} height={24} alt="유저 이미지" />
      )}

      <TextArea placeholder="댓글 달기..." onChange={onChange} value={comment} />
      <button className={`${styles.submit_btn} ${comment.length > 0 ? styles.active : ""}`}>등록</button>
    </form>
  );
}
