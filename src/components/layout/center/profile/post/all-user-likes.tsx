import { useProfilePost } from "@/hooks/useProfilePost";
import { UserWithFollowersFollowing } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { User } from "@prisma/client";
import * as React from "react";

type AllUserLikesProps = {
  userByUsername: User;
  currentUser?: UserWithFollowersFollowing;
};

export default function AllUserLikes({
  userByUsername,
  currentUser,
}: AllUserLikesProps) {
  const lastPostRef = React.useRef();
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 0.3,
  });

  const { data, isLoading, size, isValidating, setSize } = useProfilePost(
    userByUsername.id,
    "/api/profile/post-by-id/all-likes"
  );

  return <div>all-user-likes</div>;
}
