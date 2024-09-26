CREATE TABLE IF NOT EXISTS "media" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"post_id" text,
	"url" text NOT NULL,
	"path" text NOT NULL,
	"size" integer NOT NULL,
	"order" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"extension" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media" ADD CONSTRAINT "media_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media" ADD CONSTRAINT "media_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_post_id_idx" ON "media" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN IF EXISTS "media";