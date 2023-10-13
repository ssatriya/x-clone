import {
  Follower,
  Following,
  Like,
  Post,
  Reply,
  Repost,
  User,
} from "@prisma/client";

export type ExtendedPost = Post & {
  user_one: User & {
    followers: Follower[];
    following: Following[];
  };
  user_two: User & {
    followers: Follower[];
    following: Following[];
  };
  original_repost: Post | null;
  replys: Reply[];
  reposts: Repost[];
  likes: Like[];
};

export type ExtendedPostWithoutUserTwo = Omit<ExtendedPost, "user_two">;

export type ExtendedPostWithoutOriginalPostUserTwo = Omit<
  ExtendedPost,
  "original_repost"
>;

export type RepostPost = Post & {
  user: User;
};

export type UserWithFollowersFollowing = User & {
  followers: Follower[];
  following: Following[];
};

export type Followers = User & {
  followers: User[];
};

export type Following = User & {
  following: User[];
};
