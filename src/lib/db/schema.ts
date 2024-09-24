import {
  text,
  date,
  index,
  pgEnum,
  varchar,
  pgTable,
  boolean,
  timestamp,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";

export const notificationTypeEnum = pgEnum("notificationType", [
  "like",
  "follow",
  "reply",
]);

export const notificationTable = pgTable("notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateIdFromEntropySize(10)),
  recipientId: text("recipient_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  issuerId: text("issuer_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  notificationType: notificationTypeEnum("notification_type").notNull(),
  postId: text("post_id").references(() => postTable.id, {
    onDelete: "cascade",
  }),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationTableRelation = relations(
  notificationTable,
  ({ one }) => ({
    recipientId: one(userTable, {
      fields: [notificationTable.recipientId],
      references: [userTable.id],
      relationName: "recipientId",
    }),
    issuerId: one(userTable, {
      fields: [notificationTable.issuerId],
      references: [userTable.id],
      relationName: "issuerId",
    }),
    postId: one(postTable, {
      fields: [notificationTable.postId],
      references: [postTable.id],
    }),
  })
);

export const userTable = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 225 }).notNull().unique(),
    photo: text("photo"),
    headerPhoto: text("header_photo"),
    bio: varchar("bio", { length: 255 }),
    birthDate: date("birth_date"),
    onBoarding: boolean("on_boarding").default(false),
    verified: boolean("verified").default(false),
    googleId: text("google_id").unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      usernameIdx: uniqueIndex("username_idx").on(table.email),
    };
  }
);

export type UserTable = typeof userTable.$inferSelect;

export const userTableRelation = relations(userTable, ({ many }) => ({
  post: many(postTable),
  reply: many(replyTable),
  repost: many(repostTable),
  quote: many(quoteTable),
  follower: many(followerTable, { relationName: "follower" }),
  following: many(followerTable, { relationName: "following" }),
}));

export const followerTable = pgTable(
  "follower",
  {
    followerId: text("follower_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    followingId: text("following_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: "followerTableId",
        columns: [table.followerId, table.followingId],
      }),
      followerIdIdx: index("follower_id_idx").on(table.followerId),
      followingIdIdx: index("following_id_idx").on(table.followingId),
    };
  }
);

export type FollowerTable = typeof followerTable.$inferSelect;

export const followerRelation = relations(followerTable, ({ one }) => ({
  follower: one(userTable, {
    fields: [followerTable.followerId],
    references: [userTable.id],
    relationName: "follower",
  }),
  following: one(userTable, {
    fields: [followerTable.followingId],
    references: [userTable.id],
    relationName: "following",
  }),
}));

export const quoteTable = pgTable(
  "quote",
  {
    id: text("id").primaryKey(),
    quoteTargetId: text("quote_target_id")
      .notNull()
      .references(() => postTable.id, { onDelete: "cascade" }), // The post we quote
    userOriginId: text("user_origin_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }), // Logged in user that quoted
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      quoteTargetIdIdx: index("quote_target_id_idx").on(table.quoteTargetId),
    };
  }
);

export type QuoteTable = typeof quoteTable.$inferSelect;

export const quoteTableRelation = relations(quoteTable, ({ one }) => ({
  post: one(postTable, {
    fields: [quoteTable.quoteTargetId],
    references: [postTable.id],
  }),
  user: one(userTable, {
    fields: [quoteTable.userOriginId],
    references: [userTable.id],
  }),
}));

export const repostTable = pgTable(
  "repost",
  {
    repostTargetId: text("repost_target_id")
      .notNull()
      .references(() => postTable.id, { onDelete: "cascade" }), // The post we repost
    userOriginId: text("user_origin_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }), // Logged in user that reposted
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: "repostTableId",
        columns: [table.repostTargetId, table.userOriginId],
      }),
      repostTargetIdIdx: index("repost_target_id_idx").on(table.repostTargetId),
    };
  }
);

export type RepostTable = typeof replyTable.$inferSelect;

export const repostTableRelation = relations(repostTable, ({ one }) => ({
  post: one(postTable, {
    fields: [repostTable.repostTargetId],
    references: [postTable.id],
  }),
  user: one(userTable, {
    fields: [repostTable.userOriginId],
    references: [userTable.id],
  }),
}));

export const replyTable = pgTable(
  "reply",
  {
    id: text("id").primaryKey(),
    replyTargetId: text("reply_target_id")
      .notNull()
      .references(() => postTable.id, { onDelete: "cascade" }), // The post we replied to
    userOriginId: text("user_origin_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }), // Logged in user that replied
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      replyTargetIdIdx: index("reply_target_id_idx").on(table.replyTargetId),
    };
  }
);

export type ReplyTable = typeof replyTable.$inferSelect;

export const replyTableRelation = relations(replyTable, ({ one }) => ({
  post: one(postTable, {
    fields: [replyTable.replyTargetId],
    references: [postTable.id],
  }),
  user: one(userTable, {
    fields: [replyTable.userOriginId],
    references: [userTable.id],
  }),
}));

export const likeTable = pgTable(
  "like",
  {
    likeTargetId: text("like_target_id")
      .notNull()
      .references(() => postTable.id, { onDelete: "cascade" }),
    userOriginId: text("user_origin_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: "likeTableId",
        columns: [table.likeTargetId, table.userOriginId],
      }),
      likeTargetIdIdx: index("like_target_id_idx").on(table.likeTargetId),
      userOriginIdIdx: index("user_origin_id_idx").on(table.userOriginId),
    };
  }
);

export type LikeTable = typeof likeTable.$inferSelect;

export const likeTableRelation = relations(likeTable, ({ one }) => ({
  post: one(postTable, {
    fields: [likeTable.likeTargetId],
    references: [postTable.id],
  }),
  user: one(userTable, {
    fields: [likeTable.userOriginId],
    references: [userTable.id],
  }),
}));

export const postTypeEnum = pgEnum("postType", [
  "post",
  "repost",
  "reply",
  "quote",
]);

export const postTable = pgTable(
  "post",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    content: text("content"),
    media: text("media"),
    postType: postTypeEnum("post_type").notNull(),
    rootPostId: text("root_post_id").notNull(),
    parentPostId: text("parent_post_id"),
    originalPostId: text("original_post_id"),
    createdAt: timestamp("created_at").notNull().defaultNow().unique(),
  },
  (table) => {
    return {
      userIdIdx: index("user_id_idx").on(table.userId),
      postTypeIdx: index("post_type_idx").on(table.postType),
      createdAtIdx: index("created_at_idx").on(table.createdAt),
      rootPostIdIdx: index("root_post_id_idx").on(table.rootPostId),
      parentPostIdIdx: index("parent_post_id_idx").on(table.parentPostId),
      originalPostIdIdx: index("original_post_id_idx").on(table.originalPostId),
    };
  }
);

export type PostTable = typeof postTable.$inferSelect;

export const postTableRelation = relations(postTable, ({ one, many }) => ({
  parentPost: one(postTable, {
    fields: [postTable.parentPostId],
    references: [postTable.id],
  }),
  rootPost: one(postTable, {
    fields: [postTable.rootPostId],
    references: [postTable.id],
  }),
  user: one(userTable, {
    fields: [postTable.userId],
    references: [userTable.id],
  }),
  originalPost: one(postTable, {
    fields: [postTable.originalPostId],
    references: [postTable.id],
  }),
  like: many(likeTable),
  quote: many(repostTable),
  repost: many(repostTable),
  reply: many(replyTable),
}));

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
