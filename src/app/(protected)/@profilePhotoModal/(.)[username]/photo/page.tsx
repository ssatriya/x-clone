import ProfilePhotoModal from "@/components/home/modal/profile-photo-modal";
import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: {
    username: string;
  };
};

export default async function Page({ params: { username } }: Props) {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, `@${username}`));

  return <ProfilePhotoModal photo={user.photo} />;
}
