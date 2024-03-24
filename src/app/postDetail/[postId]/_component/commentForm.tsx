"use client";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import Image from "next/image";
import { ChangeEventHandler, FormEvent, useState } from "react";

import LoginModal from "@/app/_component/LoginModal";
import ModalContainer from "@/app/_component/ModalContainer";
import ModalPortal from "@/app/_component/ModalPortal";
import TextArea from "@/app/_component/TextArea";
import { useModal } from "@/hook/useModal";
import { constant } from "@/utils/constant";
import { userImgUrl } from "@/utils/userImgUrl";

import { IComment, IPostData } from "../interfaces";
import styles from "../postDetail.module.css";
import { useSession } from "next-auth/react";

interface ICommentFormProps {
  userImage: number | undefined;
  postData: IPostData;
}

export default function CommentForm({ userImage, postData }: ICommentFormProps) {
  const queryClient = useQueryClient();
  const { data: userData } = useSession();
  const userInfo = userData?.user;
  const [newComment, setNewComment] = useState<string>("");
  const [isComment, setIsComment] = useState<boolean>(false);
  const { openModal, handleOpenMoal, handleCloseModal } = useModal();

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setNewComment(e.target.value); // 입력 필드의 변경을 감지하여 상태 업데이트
    setIsComment(!!e.target.value); // 댓글이 들어오는지 확인
  };

  const commentSubmit = useMutation({
    mutationFn: async () => {
      const res = await fetch(constant.apiUrl + `api/main/new/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userInfo?.userId,
          postId: postData?.postId,
          content: newComment,
        }),
      });
      const data: IComment = await res.json();
      return data;
    },
    onSuccess(response) {
      const userToken = localStorage.getItem("token");
      const headers: { [key: string]: string } = {};

      if (userToken) {
        headers.Authorization = userToken;
      }
      const queryCache = queryClient.getQueryCache();
      const queryKeys = queryCache.getAll().map((cache) => cache.queryKey);
      const filterQuerys = queryKeys.filter((v) => {
        if (v[0] === "post" && v[1] === postData.postId && v[2] === "comments") {
          return true;
        }
        return false;
      });
      filterQuerys.forEach((queryKey) => {
        const value: IComment | InfiniteData<IComment[]> | undefined = queryClient.getQueryData(queryKey);
        if (value && "pages" in value) {
          const data = produce(value, (draftData) => {
            draftData.pages[0].unshift(response);
          });
          queryClient.setQueryData(["post", postData.postId, "comments"], data);
        }
      });

      setNewComment("");
      setIsComment(false);
    },
  });

  const handleCommentSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newComment.trim() === "") return;
    commentSubmit.mutate();
  };

  return (
    <form
      onSubmit={handleCommentSubmit}
      className={styles.commentRegContainer}
      onClick={userInfo?.isLogin !== 1 ? handleOpenMoal : undefined}
    >
      <div className={styles.voteButtonImageContainer}>
        {userImage ? (
          <Image src={userImgUrl(userImage)} alt="로그인 유저 이미지" width={24} height={24} />
        ) : (
          <Image src="/profile-md-test.png" alt="비로그인 유저 이미지" width={24} height={24} />
        )}
      </div>

      <TextArea placeholder="댓글 달기..." onChange={onChange} value={newComment} />
      <button className={`${styles.commentReg} ${isComment ? styles.isComment : ""}`}>등록</button>
      {openModal && (
        <ModalPortal>
          <ModalContainer handleCloseModal={handleCloseModal}>
            <LoginModal handleCloseModal={handleCloseModal} />
          </ModalContainer>
        </ModalPortal>
      )}
    </form>
  );
}
