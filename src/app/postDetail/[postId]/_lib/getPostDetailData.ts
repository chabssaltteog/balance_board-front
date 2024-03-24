import { constant } from "@/utils/constant";

export const getPostDetailData = async (postId: number, token: string | undefined) => {
  try {
    const headers: { [key: string]: string } = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(constant.apiUrl + `api/main/posts/${postId}`, {
      headers: headers,
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
