import ProfileLikes from "@/components/profile/personal/profile-likes";
import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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
    title: `Posts liked by ${user.name} (@${username}) / X`,
  };
}

export default async function Page({ params: { username } }: Props) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return redirect("/");

  return <ProfileLikes username={username} loggedInUser={loggedInUser} />;
}
