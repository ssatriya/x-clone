DO $$ BEGIN
 CREATE TYPE "public"."notificationType" AS ENUM('like', 'follow', 'reply');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "notification_type" SET DATA TYPE notificationType;