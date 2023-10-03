import { auth } from "@/lib/lucia";
import * as context from "next/headers";

export default async function getCurrentSession() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  return session;
}
