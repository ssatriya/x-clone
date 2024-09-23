import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { Button } from "@nextui-org/react";
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
    title: `${user.name} (@${username}) / X`,
  };
}

export default function Page() {
  return (
    <div className="flex flex-col max-w-[400px] px-8 mx-auto my-9">
      <span className="text-[31px] text-secondary-lighter font-extrabold leading-9 mb-2">
        Highlight on your profile
      </span>
      <span className="text-[15px] text-gray leading-5 mb-7">
        You must be subscribed to Premium to highlight posts on your profile.
      </span>
      <Button className="bg-secondary-lighter min-w-0 w-fit text-black data-[hover=true]:bg-secondary-lighter/90 h-[52px] px-8 rounded-full font-bold text-[19px] leading-5">
        Subscribe to Premium
      </Button>
    </div>
  );
}
