ALTER TABLE "reply" DROP CONSTRAINT "replyTableId";--> statement-breakpoint
ALTER TABLE "reply" ADD COLUMN "id" text PRIMARY KEY NOT NULL;