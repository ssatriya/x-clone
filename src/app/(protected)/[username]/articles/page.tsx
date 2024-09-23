import { eq } from "drizzle-orm";

import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import Button from "@/components/ui/button";

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

export default function Page() {
  return (
    <div className="flex flex-col max-w-[400px] px-8 mx-auto my-9">
      <span className="text-[31px] text-secondary-lighter font-extrabold leading-9 mb-2">
        Write Articles on X
      </span>
      <span className="text-[15px] text-gray leading-5 mb-7">
        You must be subscribed to Premium+ to write Articles on X
      </span>
      <Button
        variant="secondary"
        className="w-fit h-[52px] px-8 font-bold text-[19px] leading-5"
      >
        Upgrade to Premium+
      </Button>
    </div>
  );
}
