"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import NotContent from "@/app/_component/NotContent";

import { useGetComments } from "../_hook/useGetComments";
import { getPostDetailData } from "../_lib/getPostDetailData";
import { IPostData } from "../interfaces";
import styles from "../postDetail.module.css";
import CommentForm from "./commentForm";
import CommentList from "./commentList";
import ContentVote from "./contentVote";
import PostContent from "./postContent";
import UserInfo from "./userInfo";
import { ILogin } from "@/app/login/_component/LoginForm";
export default function PostDetailContainer({ postId, userInfo }: { postId: number; userInfo: ILogin | undefined }) {
  let token: undefined | string = undefined;
  if (userInfo?.isLogin === 1) {
    token = userInfo?.accessToken;
  }
  const { data: postData } = useQuery<IPostData>({
    queryKey: ["post", "detail", postId, Number(userInfo?.isLogin)],
    queryFn: () => {
      return getPostDetailData(postId, token);
    },
  });
  const { commentTotalCnt } = useGetComments(postId);
  return (
    <div className={styles.postDetailContainer}>
      {postData ? (
        <>
          <div className={styles.topPadding}>
            <UserInfo postData={postData} />
            <PostContent postData={postData} />
            <ContentVote postData={postData} postId={postId} />
          </div>
          <div className={styles.seperator}></div>
          <div className={styles.commentContainer}>
            <div className={styles.commentCount}>
              <span>댓글</span>
              <span>{commentTotalCnt}</span>
            </div>
            <CommentForm postData={postData} userImage={userInfo?.imageType} />
            {commentTotalCnt && commentTotalCnt > 0 ? (
              <CommentList postId={postData.postId} />
            ) : (
              <div className={styles.no_comment_container}>
                <NotContent
                  title="아직 댓글이 없어요!"
                  comment1="투표에 대한 의견을"
                  comment2="댓글로 공유해보세요."
                ></NotContent>
              </div>
            )}
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
