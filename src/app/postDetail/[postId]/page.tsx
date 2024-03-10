import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { Metadata } from "next";

import PostDetailNav from "../../_component/postDetailNav";
import PostDetailContainer from "./_component/PostDetailContainer";
import { getPostDetailData } from "./_lib/getPostDetailData";
import { IPostData } from "./interfaces";
import styles from "./postDetail.module.css";

export async function generateMetadata({ params }: { params: { postId: number } }): Promise<Metadata> {
  const data: IPostData = await getPostDetailData(params.postId, null);
  return {
    title: `${data.title} | 밸런스 보드`,
    description: data.content,
    openGraph: {
      title: `${data.title} | 밸런스 보드`,
      description: `${data.content} | 밸런스 보드`,
      images: [
        {
          url: "https://github.com/chabssaltteog/balance_board-front/assets/84954439/ce020331-b423-415e-869f-1ac4e50c0d58",
          width: 1900,
          height: 600,
        },
      ],
      siteName: "밸런스 보드",
      type: "website",
    },
  };
}

export default async function PostDetail({ params }: { params: { postId: number } }) {
  const { postId } = params;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["post", "detail", Number(postId), 0],
    queryFn: () => {
      return getPostDetailData(postId, null);
    },
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <div className={styles.postDetailBox}>
      <PostDetailNav />
      <HydrationBoundary state={dehydratedState}>
        <PostDetailContainer postId={Number(postId)} />
      </HydrationBoundary>
    </div>
  );
}
