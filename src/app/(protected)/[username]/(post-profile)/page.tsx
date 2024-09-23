import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ProfilePosts from "@/components/profile/profile-posts";
import { Suspense } from "react";

type Props = {
  params: {
    username: string;
  };
};

export async function generateMetadata({ params: { username } }: Props) {
  const [user] = await db
    .select({
      name: userTable.name,
    })
    .from(userTable)
    .where(eq(userTable.username, `@${username}`));

  return {
    title: `${user.name} (@${username}) / X`,
  };
}

export default async function Page({ params: { username } }: Props) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return redirect("/");

  return (
    // <Suspense fallback={<p className="bg-red-500 w-full">Loading</p>}>
    <ProfilePosts username={username} loggedInUser={loggedInUser} />
    // </Suspense>
  );
}
