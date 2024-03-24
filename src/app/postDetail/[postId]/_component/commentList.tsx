"use client";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";

import ModalContainer from "@/app/_component/ModalContainer";
import ModalPortal from "@/app/_component/ModalPortal";
import DelAlertModal from "@/app/profile/[userId]/_component/DelAlertModal";
import DeleteConfirmModal from "@/app/profile/[userId]/_component/DeleteConfirmModal";
import { useModal } from "@/hook/useModal";
import { constant } from "@/utils/constant";
import { formatDay, formatTime } from "@/utils/foramattime";
import { userImgUrl } from "@/utils/userImgUrl";

import { useGetComments } from "../_hook/useGetComments";
import { IComment } from "../interfaces";
import styles from "../postDetail.module.css";
import MoreCommentsButton from "./moreCommentButton";
import { useSession } from "next-auth/react";

interface CommentListProps {
  postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
  const {
    openModal: openDelAlertModal,
    handleOpenMoal: handleOpenDelAlertMoal,
    handleCloseModal: handleCloseDelAlertModal,
  } = useModal();
  const [mounted, setMounted] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetching } = useGetComments(postId);

  const hanleMoreComment = () => {
    void fetchNextPage();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ul className={styles.commentListContainer}>
      {mounted &&
        data?.pages &&
        data?.pages.map((v, i) => (
          <Fragment key={i}>
            {v.map((comment) => (
              <li className={styles.card_list} key={comment.commentId}>
                <Comment handleOpenDelAlertMoal={handleOpenDelAlertMoal} comment={comment} postId={postId} />
              </li>
            ))}
          </Fragment>
        ))}
      {!isFetching && hasNextPage && (
        <MoreCommentsButton
          onClick={() => {
            hanleMoreComment();
          }}
        />
      )}
      {openDelAlertModal && (
        <ModalPortal>
          <ModalContainer handleCloseModal={handleCloseDelAlertModal}>
            <DelAlertModal handleCloseModal={handleCloseDelAlertModal} title="댓글을 삭제했어요" />
          </ModalContainer>
        </ModalPortal>
      )}
    </ul>
  );
}

interface CommentProps {
  comment: IComment;
  postId: number;
  handleOpenDelAlertMoal: () => void;
}

function Comment({ comment, postId, handleOpenDelAlertMoal }: CommentProps) {
  const {
    openModal: openDelConfirmModal,
    handleOpenMoal: handleOpenDelConfirmMoal,
    handleCloseModal: handleCloseDelConfirmModal,
  } = useModal();
  // const { userInfo } = useUserDataContext();
  const { data: userData } = useSession();
  const userInfo = userData?.user;
  const queryClient = useQueryClient();
  const delComment = useMutation({
    mutationFn: () => {
      return fetch(constant.apiUrl + `api/main/comments/${comment.commentId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.accessToken}`,
        },
        body: JSON.stringify({
          commentId: comment.commentId,
          currentUserId: userInfo?.userId,
        }),
      });
    },
    onSuccess() {
      const queryCache = queryClient.getQueryCache();
      const queryKeys = queryCache.getAll().map((cache) => cache.queryKey);
      const filterQuerys = queryKeys.filter((v) => {
        if (v[0] === "post" && v[1] === postId && v[2] === "comments") {
          return true;
        }
        return false;
      });
      filterQuerys.forEach((queryKey) => {
        const value: IComment | InfiniteData<IComment[]> | undefined = queryClient.getQueryData(queryKey);
        if (value && "pages" in value) {
          const obj = value.pages.flat().find((v) => v.commentId === comment.commentId);
          if (obj) {
            const pageIndex = value.pages.findIndex((page) => {
              const find = page.includes(obj);
              return find;
            });
            if (pageIndex >= 0) {
              const data = produce(value, (draftData) => {
                draftData.pages[pageIndex] = draftData.pages[pageIndex].filter(
                  (v) => v.commentId !== comment.commentId,
                );
              });
              queryClient.setQueryData(queryKey, data);
            }
          }
        }
      });
      handleOpenDelAlertMoal();
    },
  });

  const handleDelComment = () => {
    delComment.mutate();
  };
  return (
    <div className={styles.commentContainer}>
      <div className={styles.commentorInfo}>
        <div className={styles.commentorImageContainer}>
          <Image src={userImgUrl(comment.imageType)} alt="댓글 쓴 사람 이미지" width={24} height={24} />
        </div>
        <div className={styles.commentorName}>{comment.nickname}</div>
        <div className={styles.verticalLine}></div>
        <div className={styles.commentDay}>{formatDay(comment.created)}</div>
        <div className={styles.commentTime}>{formatTime(comment.created)}</div>
        {userInfo?.isLogin === 1 && userInfo?.userId === comment.userId && (
          <button onClick={handleOpenDelConfirmMoal} className={styles.comment_del}>
            삭제
          </button>
        )}
      </div>
      <p className={styles.userComment}>{comment.content}</p>
      <div className={styles.commentSeperator}></div>
      {openDelConfirmModal && (
        <ModalPortal>
          <ModalContainer handleCloseModal={handleCloseDelConfirmModal}>
            <DeleteConfirmModal
              target="댓글"
              handleDel={handleDelComment}
              handleCloseModal={handleCloseDelConfirmModal}
            />
          </ModalContainer>
        </ModalPortal>
      )}
    </div>
  );
}
