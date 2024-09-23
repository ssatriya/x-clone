import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    title: `Verified account following ${user.name} (@${username}) / X`,
  };
}

export default function Page() {
  return (
    <div className="flex flex-col my-8 max-w-[400px] mx-auto px-8">
      <span className="font-extrabold text-[31px] leading-9 text-secondary-lighter mb-2">
        You don’t have any verified followers yet
      </span>
      <span className="text-[15px] leading-5 text-gray">
        When a verified account follows you, you’ll see them here.
      </span>
    </div>
  );
}
