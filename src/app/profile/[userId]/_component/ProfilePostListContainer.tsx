"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import NotContent from "@/app/_component/NotContent";

import { getProfilePostData } from "../_lib/getProfilePostData";
import { IProfilePost } from "../page";
import ProfilePostCard from "./ProfilePostCard";
import styles from "./profilePostListContainer.module.css";
export default function ProfilePostListContainer({ userId }: { userId: number }) {
  const searchParams = useSearchParams();
  const profileTab = Number(searchParams.get("profileTab")) || 0;
  const [mounted, setMounted] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery<IProfilePost[], Error>({
    queryKey: ["profile", "post", userId, Number(profileTab)],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const profilePostData = await getProfilePostData(userId, Number(profileTab), page);
      return profilePostData.profilePosts;
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
    delay: 10,
  });
  useEffect(() => {
    if (inView) {
      if (!isFetching && hasNextPage) {
        void fetchNextPage();
      }
    }
  }, [inView, isFetching, hasNextPage, fetchNextPage]);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div>
      {data?.pages && data?.pages[0].length > 0 ? (
        <>
          <ul className={styles.post_ul}>
            {mounted &&
              data?.pages &&
              data.pages.map((v, i) => (
                <Fragment key={i}>
                  {v.map((post) => (
                    <li key={`${post.postId} - ${i}`} className={styles.post_list}>
                      <ProfilePostCard profilePostData={post} userId={userId} />
                    </li>
                  ))}
                </Fragment>
              ))}
          </ul>
          <div ref={ref} style={{ height: 10, backgroundColor: "#FAFAFA" }} />
        </>
      ) : (
        <NotContent title="활동한 내역이 없어요!" comment1="궁금한 것을 질문하고" comment2="투표에 참여해보세요">
          <Link className={styles.no_content_btn} href={"/"}>
            둘러보기
          </Link>
        </NotContent>
      )}
    </div>
  );
}
