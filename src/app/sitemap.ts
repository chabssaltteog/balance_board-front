import { MetadataRoute } from "next";

import { IPost } from "@/modal/Post";

import { getPostList } from "./_main/_lib/getPosts";
import { ILogin } from "./login/_component/LoginForm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const user: ILogin = {
    email: "",
    jwtToken: {
      accessToken: "",
      refreshToken: "",
    },
    accessToken: "",
    refreshToken: "",
    nickname: "",
    userId: 1,
    isLogin: 0,
    imageType: 1,
  };
  const postList: IPost[] = await getPostList({ pageParam: 0, userInfo: user, size: 100 });

  const postEntries: MetadataRoute.Sitemap = postList.map((v) => ({
    // https://balanceboard.swygbro.com
    url: `http://localhost:3000/postDetail/${v.postId}`,
    lastModified: new Date(),
    changeFrequency: "daily",
  }));
  return [
    {
      // https://balanceboard.swygbro.com
      url: `http://localhost:3000`,
      lastModified: new Date(),
    },
    ...postEntries,
  ];
}
