"use client";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import Button, { IButton } from "@/app/_component/Button";
import { useSession } from "next-auth/react";

import { IPost } from "@/modal/Post";

import { doVote } from "../_lib/doVote";
import styles from "./voteBtnContainer.module.css";

interface IProps {
  btnType: number;
  option1: string;
  option2: string;
  option1Count: number;
  option2Count: number;
  voteCount: number;
  postId: number;
  post: IPost;
  openLoginModal?: () => void;
}

export default function VoteBtnsContainer({
  voteCount,
  option1,
  option2,
  option1Count,
  option2Count,
  postId,
  post,
  openLoginModal,
}: IProps) {
  const option1Percent = ((option1Count / (voteCount || 1)) * 100).toFixed(1);
  const option2Percent = ((option2Count / (voteCount || 1)) * 100).toFixed(1);
  const queryClient = useQueryClient();
  // const { userInfo } = useUserDataContext();
  const { data: userData } = useSession();
  const userInfo = userData?.user;
  const [option1BtnType, setOption1BtnType] = useState(0);
  const [option2BtnType, setOption2BtnType] = useState(0);
  const [disableVoteBtn, setDisableVoteBtnVoteBtn] = useState(false);
  const [selectOption, setSelectOption] = useState("");
  const clickOption = (value: string) => {
    if (userInfo?.isLogin !== 1) {
      openLoginModal && openLoginModal();
      return;
    } else {
      if (post.selectedOption) return;
    }
    setDisableVoteBtnVoteBtn(true);

    if (post.selectedOption) return;
    setSelectOption(value);
    if (value === option1) {
      setOption2BtnType(0);
      setOption1BtnType(1);
    } else {
      setOption1BtnType(0);
      setOption2BtnType(1);
    }
  };

  // const btnType = 1; // 0. 미선택(미투표), 1. 선택(미투표), 2. 더 적음 또는 같음(투표완), 3. 더 많음(투표완)
  const Option1BtnStyle: IButton = {
    bgColor: option1BtnType === 3 ? "primary" : option1BtnType === 2 ? "primary_50" : "body_100",
    border: option1BtnType === 1 || option1BtnType === 2 ? "primary_600" : "gray",
  };
  const Option2BtnStyle: IButton = {
    bgColor: option2BtnType === 3 ? "primary" : option2BtnType === 2 ? "primary_50" : "body_100",
    border: option2BtnType === 1 || option2BtnType === 2 ? "primary_600" : "gray",
  };

  const option1FontColor =
    option1BtnType === 1 || option1BtnType === 2 ? styles.primary : option1BtnType === 3 ? styles.white : "";

  const option2FontColor =
    option2BtnType === 1 || option2BtnType === 2 ? styles.primary : option2BtnType === 3 ? styles.white : "";

  const handleVote = useMutation({
    mutationFn: () => {
      return doVote(postId, userInfo?.userId, selectOption, userInfo?.accessToken);
    },
    onSuccess() {
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
                draftData.pages[pageIndex][idx].selectedOption = selectOption;
                draftData.pages[pageIndex][idx].voteCount = draftData.pages[pageIndex][idx].voteCount + 1;
                if (selectOption === option1) {
                  draftData.pages[pageIndex][idx].option1Count = draftData.pages[pageIndex][idx].option1Count + 1;
                } else {
                  draftData.pages[pageIndex][idx].option2Count = draftData.pages[pageIndex][idx].option2Count + 1;
                }
              });
              queryClient.setQueryData(queryKey, data);
            }
          }
        }
      });
    },
  });

  const onClickVotedBtn = () => {
    if (userInfo?.isLogin !== 1) return;
    if (!disableVoteBtn) return;
    handleVote.mutate();
  };

  useEffect(() => {
    if (!post.selectedOption) {
      return;
    }
    if (post.selectedOption === option1) {
      if (option1Count > option2Count) {
        setOption1BtnType(3);
        setOption2BtnType(2);
      } else if (option2Count === option1Count) {
        setOption1BtnType(2);
        setOption2BtnType(2);
      } else {
        setOption1BtnType(2);
        setOption2BtnType(3);
      }
    } else if (post.selectedOption === option2) {
      if (option2Count > option1Count) {
        setOption1BtnType(2);
        setOption2BtnType(3);
      } else if (option2Count === option1Count) {
        setOption1BtnType(2);
        setOption2BtnType(2);
      } else {
        setOption1BtnType(3);
        setOption2BtnType(2);
      }
    }
  }, [post.selectedOption]);

  return (
    <div className={styles.container}>
      <Button
        onClick={() => clickOption(option1)}
        bgColor={Option1BtnStyle.bgColor}
        border={Option1BtnStyle.border}
        className={`${styles.btn} ${option1FontColor}`}
        rounded={"large"}
      >
        <div className={styles.btn_contents}>
          <div className={styles.btn_left}>
            {(selectOption === option1 || post.selectedOption === option1) &&
              (option1BtnType === 1 || option1BtnType === 2) && (
                <Image className={styles.ico_check} src={"/check-md.svg"} alt="체크 아이콘" width={24} height={24} />
              )}
            {option1BtnType === 3 && post.selectedOption === option1 && (
              <Image
                className={styles.ico_check}
                src={"/check-white-md.svg"}
                alt="체크 아이콘"
                width={24}
                height={24}
              />
            )}
            <span>{option1}</span>
          </div>
          {post.selectedOption && (
            <div>
              {option1Percent}%({option1Count}명)
            </div>
          )}
        </div>
      </Button>
      <Button
        onClick={() => clickOption(option2)}
        bgColor={Option2BtnStyle.bgColor}
        border={Option2BtnStyle.border}
        className={`${styles.btn} ${option2FontColor}`}
        rounded={"large"}
      >
        <div className={styles.btn_contents}>
          <div className={styles.btn_left}>
            {(selectOption === option2 || post.selectedOption === option2) &&
              (option2BtnType === 1 || option2BtnType === 2) && (
                <Image className={styles.ico_check} src={"/check-md.svg"} alt="체크 아이콘" width={24} height={24} />
              )}
            {option2BtnType === 3 && post.selectedOption === option2 && (
              <Image
                className={styles.ico_check}
                src={"/check-white-md.svg"}
                alt="체크 아이콘"
                width={24}
                height={24}
              />
            )}
            <span>{option2}</span>
          </div>
          {post.selectedOption && (
            <div>
              {option2Percent}%({option2Count}명)
            </div>
          )}
        </div>
      </Button>
      {!post.selectedOption && (
        <Button
          onClick={onClickVotedBtn}
          className={styles.vote_btn}
          border={"gray"}
          bgColor={!disableVoteBtn ? "body_200" : "title_400"}
        >
          투표하기
        </Button>
      )}
    </div>
  );
}
