import { Lucia } from "lucia";
import { Google } from "arctic";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import db from "@/lib/db";
import { userTable, sessionTable } from "@/lib/db/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(attributes) {
    return {
      id: attributes.id,
      name: attributes.name,
      username: attributes.username,
      photo: attributes.photo,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  name: string;
  username: string;
  bio: string;
  photo: string;
}

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);
