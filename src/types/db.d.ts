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
    followings: Following[];
  };
  user_two: User & {
    followers: Follower[];
    followings: Following[];
  };
  replys: Reply[];
  reposts: Repost[];
  likes: Like[];
};

export type RepostPost = Post & {
  user: User;
};

export type TooltipUser = User & {
  followers: Follower[];
  followings: Following[];
};

export type UserWithFollowersFollowing = User & {
  followers: Follower[];
  followings: Following[];
};
