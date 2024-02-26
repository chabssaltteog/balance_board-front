"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { constant } from "@/utils/constant";

import Button from "../_component/Button";
import PostDetailNav from "../_component/postDetailNav";
import styles from "./postDetail.module.css";

interface Comment {
  commentId: number;
  userId: number;
  content: string;
  created: string;
  nickname: string;
  imageUrl: string;
}

interface postData {
  postId: number;
  imageUrl: string;
  nickname: string;
  title: string;
  created: string;
  category: string;
  content: string;
  voteCount: number;
  option1: string;
  option1Count: number;
  option2: string;
  option2Count: number;
  tags: string[];
  commentCount: number;
  comments: Comment[];
  isUpVoted?: boolean;
  isDownVoted?: boolean;
}

function formatDay(dateString: Date | string | number) {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}/${day}`;
}

function formatTime(dateString: Date | string | number) {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatRelativeTime(dateString: Date | string | number) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / (1000 * 60));

  if (diffMin < 1) {
    return "방금 전";
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffMin < 24 * 60) {
    const diffHours = Math.floor(diffMin / 60);
    const remainingMins = diffMin % 60;
    return `${diffHours}시간 ${remainingMins}분 전`;
  } else {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  }
}

export default function PostDetail({ postId }: { postId: number }) {
  const [postData, setPostData] = useState<postData>("");
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    async function fetchData(postId: number) {
      try {
        const res = await fetch(constant.apiUrl + `api/main/posts/${postId}`);
        const data = await res.json();
        setPostData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData(postId);
  }, [postId]);

  const handleCommentSubmit = () => {
    if (newComment.trim() === "") return;
    console.log(newComment);
    setNewComment("");
  };

  const UpVoted = postData.option1Count > postData.option2Count;
  const DownVoted = postData.option2Count > postData.option1Count;
  const SumVoted = postData.option2Count + postData.option1Count;
  const UpPercent =
    postData.option1Count === 0
      ? "0%"
      : ((postData.option1Count / SumVoted) * 100) % 1 === 0
        ? (postData.option1Count / SumVoted) * 100
        : ((postData.option1Count / SumVoted) * 100).toFixed(1);
  const DownPercent =
    postData.option2Count === 0
      ? "0%"
      : ((postData.option2Count / SumVoted) * 100) % 1 === 0
        ? (postData.option2Count / SumVoted) * 100
        : ((postData.option2Count / SumVoted) * 100).toFixed(1);

  return (
    <div>
      <PostDetailNav />

      <div className={styles.postDetailContainer}>
        {postData ? (
          <>
            <div className={styles.userInfoContainer}>
              <div className={styles.usermageContainer}>
                <Image src="/participate-sm.png" alt="유저 이미지" width={24} height={24} />
              </div>
              <div className={styles.userInfoContainer}>
                <span className={styles.userName}>{postData.nickname}</span>
                <span className={styles.userPostTime}>{formatRelativeTime(postData.created)}</span>
              </div>
              <div className={styles.topicContainer}>
                <span className={styles.userTopic}>{postData.category}</span>
              </div>
            </div>
            <div className={styles.postContainer}>
              <div className={styles.postTitle}>{postData.title}</div>
              <div className={styles.postContent}>{postData.content}</div>
              <div className={styles.tagContainer}>
                {postData.tags &&
                  postData.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
            <div className={styles.voteContainer}>
              <Button rounded="large" className={`${styles.upButton} ${UpVoted ? styles.upVoted : ""}`}>
                <div className={styles.voteButtonContainer}>
                  {postData.isUpVoted ? (
                    UpVoted ? (
                      <div className={styles.voteButtonImageContainer}>
                        <Image src="/white-check-md.png" alt="하얀색 체크버튼 이미지" width={24} height={24} />
                        {postData.option1}
                      </div>
                    ) : (
                      <div className={styles.voteButtonImageContainer}>
                        <Image src="/check-md.png" alt="초록색 체크버튼 이미지" width={24} height={24} />
                        {postData.option1}
                      </div>
                    )
                  ) : (
                    <div className={styles.buttonContentContainer}>{postData.option1}</div>
                  )}
                  {`${UpPercent}%(${postData.option1Count}명)`}
                </div>
              </Button>
              <Button rounded="large" className={`${styles.downButton} ${DownVoted ? styles.downVoted : ""}`}>
                <div className={styles.voteButtonContainer}>
                  {postData.isDownVoted ? (
                    DownVoted ? (
                      <div className={styles.voteButtonImageContainer}>
                        <Image src="/white-check-md.png" alt="하얀색 체크버튼 이미지" width={24} height={24} />
                        {postData.option2}
                      </div>
                    ) : (
                      <div className={styles.voteButtonImageContainer}>
                        <Image src="/check-md.png" alt="초록색 체크버튼 이미지" width={24} height={24} />
                        {postData.option2}
                      </div>
                    )
                  ) : (
                    <div className={styles.buttonContentContainer}>{postData.option2}</div>
                  )}
                  {`${DownPercent}%(${postData.option2Count}명)`}
                </div>
              </Button>
              <div className={styles.sumVoterContainer}>
                <div className={styles.sumVoterImageContainer}>
                  <Image src="/participate-sm.png" alt="참여자 이미지" width={18} height={18} />
                </div>
                <div className={styles.sumVoter}>
                  <span>참여 {SumVoted}</span>
                </div>
              </div>
            </div>
            <div className={styles.seperator}></div>
            <div className={styles.commentContainer}>
              <div className={styles.commentCount}>
                <span>댓글</span>
                <span>{postData.commentCount}</span>
              </div>
              <div className={styles.commentRegContainer}>
                <div className={styles.voteButtonImageContainer}>
                  <Image src="/profile-md.png" alt="유저 이미지" width={20} height={20} />
                </div>
                <input
                  placeholder="댓글 달기..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)} // 입력 필드의 변경을 감지하여 상태 업데이트
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCommentSubmit(); // Enter 키를 누르면 댓글 등록 함수 호출
                  }}
                />
                <button className={styles.commentReg} onClick={handleCommentSubmit}>
                  등록
                </button>
              </div>
              <div className={styles.commentListContainer}>
                {postData.comments.map((comment, index) => (
                  <div key={index} className={styles.commentContainer}>
                    <div className={styles.commentorInfo}>
                      <div className={styles.commentorImageContainer}>
                        <Image src="/profile-md.png" alt="댓글 쓴 사람 이미지" width={24} height={24} />
                      </div>
                      <div className={styles.commentorName}>{comment.nickname}</div>
                      <div className={styles.verticalLine}></div>
                      <div className={styles.commentDay}>{formatDay(comment.created)}</div>
                      <div className={styles.commentTime}>{formatTime(comment.created)}</div>
                    </div>
                    <div className={styles.userComment}>{comment.content}</div>
                    <div className={styles.commentSeperator}></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}