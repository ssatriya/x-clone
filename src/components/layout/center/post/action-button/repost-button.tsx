import { Icons } from "@/components/icons";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { cn } from "@/lib/utils";
import { RepostPayload } from "@/lib/validator/repost";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { RepostType, Repost, User, Post } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { toast } from "sonner";

type RepostButtonProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUser: User;
  reposts: Repost[];
};

export default function RepostButton({
  currentUser,
  post,
  reposts,
}: RepostButtonProps) {
  const [repostsAmount, setRepostsAmount] = React.useState<Repost[]>(reposts);

  const { mutate: mutateInfiniteScroll } = useInfiniteScroll();

  const queryClient = useQueryClient();

  const { data: repostData } = useQuery({
    queryKey: ["repostData", post],
    queryFn: async () => {
      const { data } = await axios.get("/api/post/repost", {
        params: {
          postId: post.id,
        },
      });
      return data as Repost[];
    },
  });

  React.useEffect(() => {
    if (repostData) {
      setRepostsAmount(repostData);
    }
  }, [repostData]);

  const { mutate: repost } = useMutation({
    mutationKey: ["repostButton"],
    mutationFn: async () => {
      const payload: RepostPayload = {
        postId: post.id,
        originalPostOwnerId: post.user_one.id,
        repostType: RepostType.REPOST,
      };

      const { data } = await axios.patch("/api/post/repost", payload);
    },
    onError: (error) => {},
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["repostData"] });

      const repostIndex = repostsAmount.findIndex(
        (repost) =>
          repost.post_id === post.id && repost.user_id === currentUser.id
      );

      if (repostIndex !== -1) {
        setRepostsAmount((prevRepost) => {
          const newRepost = [...prevRepost];
          newRepost.splice(repostIndex, 1);
          return newRepost;
        });
      } else {
        setRepostsAmount((prevRepost) => [
          ...prevRepost,
          { user_id: currentUser.id, post_id: post.id, repost_type: "REPOST" },
        ]);
        toast.success("Reposted");
      }
    },
    onSuccess: () => {
      mutateInfiniteScroll();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["repostData"] });
    },
  });

  const isRepostedByCurrentUser = repostsAmount.some(
    (repost) => repost.user_id === currentUser.id && repost.post_id === post.id
  );

  return (
    <div className="flex items-center group">
      <Dropdown
        className="p-0 rounded-xl"
        classNames={{
          base: "bg-black min-w-[110px] shadow-normal",
        }}
      >
        <DropdownTrigger>
          <Button
            size="sm"
            isIconOnly
            className="rounded-full bg-transparent flex items-center justify-center gap-2 group-hover:bg-green-600/10"
          >
            <Icons.repost
              className={cn(
                isRepostedByCurrentUser
                  ? "fill-green-600"
                  : "fill-gray group-hover:fill-green-600",
                "w-[18px] h-[18px]"
              )}
            />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="repost options" className="p-0">
          {isRepostedByCurrentUser ? (
            <DropdownItem
              onClick={() => repost()}
              startContent={
                <Icons.repost className="w-[18px] h-[18px] fill-white" />
              }
              key="repost"
              className="data-[hover=true]:bg-white/5 rounded-t-lg rounded-b-none px-4 py-3"
              textValue="Repost"
            >
              <p className="font-bold">Undo repost</p>
            </DropdownItem>
          ) : (
            <DropdownItem
              onClick={() => repost()}
              startContent={
                <Icons.repost className="w-[18px] h-[18px] fill-white" />
              }
              key="repost"
              className="data-[hover=true]:bg-white/5 rounded-t-lg rounded-b-none px-4 py-3"
              textValue="Repost"
            >
              <p className="font-bold">Repost</p>
            </DropdownItem>
          )}
          <DropdownItem
            startContent={
              <Icons.quote className="w-[18px] h-[18px] fill-white" />
            }
            key="quote"
            textValue="Quote"
            className="data-[hover=true]:bg-white/5 rounded-b-lg rounded-t-none px-4 py-3"
          >
            <p className="font-bold">Quote</p>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <p
        className={cn(
          isRepostedByCurrentUser ? "text-green-600" : " text-gray ",
          "text-sm group-hover:text-green-600 tabular-nums"
        )}
      >
        {repostsAmount.length}
      </p>
    </div>
  );
}
