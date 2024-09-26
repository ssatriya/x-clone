ALTER TABLE "media" RENAME COLUMN "path" TO "key";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN IF EXISTS "order";