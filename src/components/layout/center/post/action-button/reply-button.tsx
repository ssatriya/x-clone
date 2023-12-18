import { Icons } from "@/components/icons";
import ReplyModal from "@/components/modal/reply/reply-modal";
import { cn } from "@/lib/utils";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import { Button, useDisclosure } from "@nextui-org/react";
import { Reply, User } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";

type ReplyButtonProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUser: User;
  customClass?: string;
};

export default function ReplyButton({
  post,
  currentUser,
  customClass,
}: ReplyButtonProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [replysAmount, setReplysAmount] = React.useState<Reply[]>(post.replys);

  const { data: replyData } = useQuery({
    queryKey: ["replyData", post.id],
    queryFn: async () => {
      const { data } = await axios.get("/api/post/reply", {
        params: {
          postId: post.id,
        },
      });
      return data as Reply[];
    },
  });

  React.useEffect(() => {
    if (replyData) {
      setReplysAmount(replyData);
    }
  }, [replyData]);

  let isRepliedByCurrentUser: boolean = false;

  if (currentUser) {
    isRepliedByCurrentUser = replysAmount.some(
      (reply) => reply.user_id === currentUser.id && reply.post_id === post.id
    );
  }

  return (
    <div className="flex relative items-center group right-2">
      <Button
        onPress={onOpen}
        size="sm"
        isIconOnly
        className="rounded-full bg-transparent flex items-center justify-center gap-2 group-hover:bg-blue/10"
      >
        <Icons.reply
          className={cn(
            customClass ? customClass : "fill-gray",
            "w-[18px] h-[18px] group-hover:fill-blue"
          )}
        />
      </Button>
      <p
        className={cn(
          customClass ? customClass : "text-gray",
          "text-sm group-hover:text-blue"
        )}
      >
        {replysAmount.length}
      </p>

      <ReplyModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        post={post}
        onOpen={onOpen}
        currentUser={currentUser}
      />
    </div>
  );
}
