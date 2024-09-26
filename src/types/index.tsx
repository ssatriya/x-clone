import { MediaTable } from "@/lib/db/schema";
import { Session, User } from "lucia";
import { FileWithPath } from "react-dropzone";

export type MediaFormat = "png" | "gif" | "jpeg" | "jpg" | "mp4";

export type FileWithPreview = {
  file: FileWithPath;
  meta: {
    preview: string;
    id: string;
    dimension: { height: number; width: number } | null;
    format: MediaFormat;
  };
};

export type PostType = "post" | "quote" | "reply" | "repost";

export type MediaType = {
  url: string;
  dimension: { height: number; width: number };
  type: MediaFormat;
};

export interface RepostInfo {
  repostCount: number;
  isRepostedByUser: boolean;
}

export interface QuoteInfo {
  quoteCount: number;
  isQuotedByUser: boolean;
}

export interface LikeInfo {
  likeCount: number;
  isLikedByUser: boolean;
}

export interface ReplyCountInfo {
  replyCount: number;
}

export interface Repost {
  repostTargetId: string;
  userOriginId: string;
}

export interface Like {
  likeTargetId: string;
  userOriginId: string;
}

export interface Quote {
  quoteTargetId: string;
  userOriginId: string;
}

export type Media = Omit<MediaTable, "key">;

export interface ForYouFeedPost {
  post: {
    postId: string;
    postContent: string;
    postCreatedAt: Date;
    postParentPostId: string | null;
    postRootPostId: string;
    postType: string;
    postOriginalPostId: string | null;
    userId: string;
    username: string;
    name: string;
    photo: string;
  };
  quoted: {
    originalPostId: string;
    originalPostContent: string;
    originalPostCreatedAt: Date;
    originalUserId: string;
    originalUsername: string;
    originalName: string;
    originalPhoto: string;
  };
  media: Media[];
  ogMedia: Media[];
  replyCount: number;
  repost: Repost[] | null;
  quote: Quote[] | null;
  like: Like[] | null;
}

export interface ProfilePost {
  post: {
    postId: string;
    postContent: string;
    postCreatedAt: Date;
    postMedia: string | null;
    postParentPostId: string | null;
    postRootPostId: string;
    postType: string;
    postOriginalPostId: string | null;
    userId: string;
    username: string;
    name: string;
    photo: string;
  };
  quoted: {
    originalPostId: string;
    originalPostContent: string;
    originalPostCreatedAt: Date;
    originalPostMedia: string | null;
    originalRootPostId: string;
    originalUserId: string;
    originalUsername: string;
    originalName: string;
    originalPhoto: string;
    originalReplyCount: number;
    originalRepost: Repost[];
    originalQuote: Quote[];
    originalLike: Like[];
  };
  replyCount: number;
  repost: Repost[];
  quote: Quote[];
  like: Like[];
}

export interface ReplyContext {
  postId: string;
  content: string;
  createdAt: Date;
  media: Media[];
  name: string;
  parentPostId: string | null;
  photo: string | null;
  postType: string;
  rootPostId: string;
  userId: string;
  username: string;
  replyCount: number;
  showLine: boolean;
  like: Like[];
  repost: Repost[];
  quote: Quote[];
  originalUserId: string;
  originalName: string;
  originalPhoto: string;
  originalPostContent: string;
  originalPostMedia: string | null;
  originalPostCreatedAt: Date;
  originalPostId: string;
  originalUsername: string;
}

export interface UserInfo {
  id: string;
  name: string;
  username: string;
  photo: string | null;
  bio: string | null;
  headerPhoto: string | null;
  isFollowing: boolean;
  followingCount: number;
  followersCount: number;
  postCount: number;
}

export interface CustomPost {
  postId: string;
  postContent: string;
  parentPostId: string | null;
  rootPostId: string;
  createdAt: Date;
  postMedia: string | null;
  postType: string;
  username: string;
  userId: string;
  name: string;
  photo: string | null;
  depth: number;
  showLine: boolean;
  thread_start_time: Date;
  originalPostId: string;
  originalPostContent: string;
  originalPostCreatedAt: Date;
  originalPostMedia: string | null;
  originalUserId: string;
  originalUsername: string;
  originalName: string;
  originalPhoto: string | null;
  originalRootPostId: string;
  originalLike: Like[];
  originalRepost: Repost[];
  originalQuote: Quote[];
  repost: Repost[];
  quote: Quote[];
  like: Like[];
  replyCount: number;
  originalReplyCount: number;
}

export type UserSession =
  | {
      user: User;
      session: Session;
    }
  | {
      user: null;
      session: null;
    };

export type ProfilePostMedia = {
  id: string;
  media: string;
  postCreatedAt: Date;
};

export type ProfilePostLikes = {
  likeCreatedAt: Date;
  like: Like[] | null;
  quote: Quote[] | null;
  repost: Repost[] | null;
  replyCount: number;
  post: {
    name: string;
    photo: string;
    postContent: string;
    postCreatedAt: Date;
    postId: string;
    postMedia: string;
    postRootPostId: string;
    postOriginalPostId: string | null;
    parentPostId: string;
    postType: string;
    userId: string;
    username: string;
  };
  quoted: {
    originalName: string;
    originalPhoto: string | null;
    originalPostContent: string;
    originalPostCreatedAt: Date;
    originalPostId: string;
    originalPostMedia: string;
    originalUserId: string;
    originalUsername: string;
    originalReplyCount: number;
    originalRootPostId: string;
    originalLike: Like[];
    originalRepost: Repost[];
    originalQuote: Quote[];
  };
};

export type Following = {
  id: string;
  name: string;
  username: string;
  photo: string | null;
  bio: string | null;
  isFollowing: boolean;
};

export type OptionButtonConfig = {
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel: "Media" | "GIF" | "Poll" | "Emoji" | "Schedule" | "Tag Location";
};

export type NotificationType = "reply" | "like" | "follow";

export interface Notification {
  id: string;
  read: boolean;
  notificationType: NotificationType;
  userId: string | null;
  postId: string | null;
  postType: "reply" | "post" | "repost" | "quote" | null;
  content: string | null;
  verified: boolean | null;
  name: string | null;
  username: string | null;
  photo: string | null;
  createdAt: Date;
  recipientUsername: string | null;
}
