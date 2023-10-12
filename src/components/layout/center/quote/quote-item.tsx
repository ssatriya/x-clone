import { ExtendedPost, UserWithFollowersFollowing } from "@/types/db";

type QuoteItemProps = {
  post: ExtendedPost;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
  postUserOwner: UserWithFollowersFollowing;
};

export default function QuoteItem({
  post,
  userPosted,
  currentUser,
  postUserOwner,
}: QuoteItemProps) {
  return <div>quote-item</div>;
}
