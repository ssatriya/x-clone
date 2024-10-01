import Link from "next/link";

import Icons from "@/components/icons";
import { formatTimeToNow } from "@/lib/utils";
import UserTooltip from "@/components/user-tooltip";
import MoreButton from "./engagement-button/more/more-button";

type Props = {
  post: {
    postId: string;
    createdAt: Date;
  };
  user: {
    name: string;
    userId: string;
    username: string;
  };
  moreButton?: boolean;
};

const PostInfo = ({ post, user, moreButton = true }: Props) => {
  const { postId, createdAt } = post;
  const { userId, name, username } = user;

  return (
    <div className="flex justify-between items-start w-full">
      <div className="flex-1 min-w-0 mr-2">
        <div className="flex items-start overflow-hidden">
          <div className="flex items-center">
            <UserTooltip username={username} userId={userId}>
              <Link
                href={`/${username ? username.slice(1) : ""}`}
                className="hover:underline focus:outline-none focus:underline"
                id="name"
              >
                <span className="text-[15px] font-bold overflow-hidden">
                  {name}
                </span>
              </Link>
            </UserTooltip>
            <span className="flex-shrink-0 w-[18px] h-[18px] ml-[2px]">
              <Icons.verified className="fill-primary" />
            </span>
          </div>
          <div className="flex items-start min-w-0 max-w-[50%] ml-1">
            <div className="min-w-0 max-w-full overflow-hidden">
              <UserTooltip username={username} userId={userId}>
                <Link
                  href={`/${username ? username.slice(1) : ""}`}
                  tabIndex={-1}
                  id="username"
                  className="truncate block"
                >
                  <span className="text-[15px] text-gray truncate">
                    {username}
                  </span>
                </Link>
              </UserTooltip>
            </div>
            <span className="text-gray flex-shrink-0 mx-1">·</span>
            <Link
              href={`/${username}/status/${postId}`}
              aria-label={`${formatTimeToNow(new Date(createdAt))} ago`}
              className="focus:outline-none focus:underline decoration-gray"
              id="posted-at"
            >
              <time
                dateTime={createdAt.toString()}
                className="text-[15px] text-gray"
              >
                {formatTimeToNow(new Date(createdAt))}
              </time>
            </Link>
          </div>
        </div>
      </div>
      {moreButton && (
        <div className="flex-shrink-0">
          <MoreButton />
        </div>
      )}
    </div>
  );
};

export default PostInfo;
