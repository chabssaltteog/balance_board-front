import cookie from "cookie";
import { cookies } from "next/headers";
import NextAuth, { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { constant } from "@/utils/constant";

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/login",
    signOut: "/setting",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // credentials
        const res = await fetch(constant.apiUrl + "api/user/login", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials?.username,
            password: credentials?.password,
          }),
        });
        const setCookie = res.headers.get("Set-Cookie");
        if (setCookie) {
          const parsed = cookie.parse(setCookie);
          cookies().set("connect.sid", parsed["connect.sid"], parsed); // 브라우저에 쿠키를 심어주는 것
        }

        const user = await res.json();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (user?.message) return null;
        const resultUser = {
          ...user,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ...user?.jwtToken,
          isLogin: 1,
        };
        if (res.ok && user) {
          return resultUser;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    signIn({ user }: { user: User }) {
      if (user) return true;
      return false;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.user = {
          ...user,
        };
      }
      if (trigger === "update" && session !== null) {
        token.user = {
          ...(token.user as object),
          ...session,
        };
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session = {
          ...session,
          ...token,
        };
      }
      return session;
    },
  },
};

export const handler = NextAuth(authOptions);
