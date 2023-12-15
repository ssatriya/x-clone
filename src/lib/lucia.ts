import { lucia } from "lucia";
import { prisma } from "@lucia-auth/adapter-prisma";
import { nextjs_future } from "lucia/middleware";
import { google } from "@lucia-auth/oauth/providers";
import "lucia/polyfill/node";
import { db } from "./db";

export const auth = lucia({
  adapter: prisma(db, {
    user: "user",
    key: "key",
    session: "session",
  }),
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  sessionCookie: {
    expires: false,
  },
  getUserAttributes: (data) => {
    return {
      name: data.name,
      email: data.email,
    };
  },
  middleware: nextjs_future(),
});

export const googleAuth = google(auth, {
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  redirectUri:
    process.env.NODE_ENV === "development"
      ? `http://localhost:3000/api/login/google/callback`
      : `${process.env.APPLICATION_URL}/api/login/google/callback`,
  scope: ["email"],
});

export type Auth = typeof auth;
