import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { LikePayload } from "@/lib/validator/like";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import { Button } from "@nextui-org/react";
import { Like, User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { usePrevious } from "@mantine/hooks";
import { toast } from "sonner";

type LikeButtonProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUser: User;
};

export default function LikeButton({ post, currentUser }: LikeButtonProps) {
  const [likesAmount, setLikesAmount] = React.useState<
    { post_id: string; user_id: string }[]
  >(post.likes);
  const previousLikes =
    usePrevious<{ post_id: string; user_id: string }[]>(likesAmount);

  const queryClient = useQueryClient();

  const { data: likeData } = useQuery({
    queryKey: ["likeData", post],
    queryFn: async () => {
      const { data } = await axios.get("/api/post/like", {
        params: {
          postId: post.id,
        },
      });
      return data as Like[];
    },
  });

  React.useEffect(() => {
    if (likeData && likeData.length > 0) {
      setLikesAmount(likeData);
    }
  }, [likeData]);

  const { mutate: addLike } = useMutation({
    mutationKey: ["addLikes"],
    mutationFn: async () => {
      const payload: LikePayload = {
        postId: post.id,
      };
      const { data } = await axios.patch("/api/post/like", payload);

      return data as Like[];
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["likeData"] });

      const likedIndex = likesAmount.findIndex(
        (like) => like.post_id === post.id && like.user_id === currentUser.id
      );

      if (likedIndex !== -1) {
        setLikesAmount((prevLikes) => {
          const newLikes = [...prevLikes];
          newLikes.splice(likedIndex, 1);
          return newLikes;
        });
      } else {
        setLikesAmount((prevLikes) => [
          ...prevLikes,
          { user_id: currentUser.id, post_id: post.id },
        ]);
        toast.success("Liked");
      }
    },
    onError: (error) => {
      if (error && previousLikes) {
        setLikesAmount(previousLikes);
        toast.error("Failed to like", {
          description: "Something went wrong, please try again later.",
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["likeData"] });
    },
  });

  let isLikedByCurrentUser: boolean = false;

  if (currentUser) {
    isLikedByCurrentUser = likesAmount.some(
      (like) => like.post_id === post.id && like.user_id === currentUser.id
    );
  }

  return (
    <div className="flex items-center group">
      <Button
        onClick={() => addLike()}
        size="sm"
        isIconOnly
        className="rounded-full bg-transparent flex items-center justify-center group-hover:bg-red-500/10"
      >
        <Icons.like
          strokeWidth={2}
          className={cn(
            isLikedByCurrentUser
              ? "fill-red-500"
              : "fill-transparent stroke-gray group-hover:stroke-red-500",
            "w-[18px] h-[18px]"
          )}
        />
      </Button>
      <p
        className={cn(
          isLikedByCurrentUser ? "text-red-500" : " text-gray ",
          "text-sm group-hover:text-red-500 tabular-nums"
        )}
      >
        {likesAmount.length}
      </p>
    </div>
  );
}
