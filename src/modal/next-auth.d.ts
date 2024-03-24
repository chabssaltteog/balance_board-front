import { DefaultSession } from "next-auth";

import { ILogin } from "@/app/login/_component/LoginForm";

declare module "next-auth" {
  interface Session {
    user: ILogin & DefaultSession["user"];
  }
}
