DO $$ BEGIN
 CREATE TYPE "public"."postType" AS ENUM('post', 'repost', 'reply', 'quote');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "follower" (
	"follower_id" text,
	"following_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "followerTableId" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "like" (
	"like_target_id" text NOT NULL,
	"user_origin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "likeTableId" PRIMARY KEY("like_target_id","user_origin_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content" text,
	"media" text,
	"post_type" "postType" NOT NULL,
	"root_post_id" text NOT NULL,
	"parent_post_id" text,
	"original_post_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_created_at_unique" UNIQUE("created_at")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quote" (
	"id" text PRIMARY KEY NOT NULL,
	"quote_target_id" text NOT NULL,
	"user_origin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reply" (
	"reply_target_id" text NOT NULL,
	"user_origin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "replyTableId" PRIMARY KEY("reply_target_id","user_origin_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repost" (
	"repost_target_id" text NOT NULL,
	"user_origin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repostTableId" PRIMARY KEY("repost_target_id","user_origin_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(225) NOT NULL,
	"photo" text,
	"header_photo" text,
	"bio" varchar(255),
	"birth_date" date,
	"on_boarding" boolean DEFAULT false,
	"google_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follower" ADD CONSTRAINT "follower_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follower" ADD CONSTRAINT "follower_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "like" ADD CONSTRAINT "like_like_target_id_post_id_fk" FOREIGN KEY ("like_target_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "like" ADD CONSTRAINT "like_user_origin_id_user_id_fk" FOREIGN KEY ("user_origin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post" ADD CONSTRAINT "post_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quote" ADD CONSTRAINT "quote_quote_target_id_post_id_fk" FOREIGN KEY ("quote_target_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quote" ADD CONSTRAINT "quote_user_origin_id_user_id_fk" FOREIGN KEY ("user_origin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reply" ADD CONSTRAINT "reply_reply_target_id_post_id_fk" FOREIGN KEY ("reply_target_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reply" ADD CONSTRAINT "reply_user_origin_id_user_id_fk" FOREIGN KEY ("user_origin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "repost" ADD CONSTRAINT "repost_repost_target_id_post_id_fk" FOREIGN KEY ("repost_target_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "repost" ADD CONSTRAINT "repost_user_origin_id_user_id_fk" FOREIGN KEY ("user_origin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "follower_id_idx" ON "follower" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "following_id_idx" ON "follower" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "like_target_id_idx" ON "like" USING btree ("like_target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_origin_id_idx" ON "like" USING btree ("user_origin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "post" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_type_idx" ON "post" USING btree ("post_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "root_post_id_idx" ON "post" USING btree ("root_post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parent_post_id_idx" ON "post" USING btree ("parent_post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "original_post_id_idx" ON "post" USING btree ("original_post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_idx" ON "post" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quote_target_id_idx" ON "quote" USING btree ("quote_target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reply_target_id_idx" ON "reply" USING btree ("reply_target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "repost_target_id_idx" ON "repost" USING btree ("repost_target_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_idx" ON "user" USING btree ("email");