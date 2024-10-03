import { and, inArray, isNull, lte } from "drizzle-orm";

import db from "@/lib/db";
import { mediaTable } from "@/lib/db/schema";
import { supabase } from "@/lib/supabase/client";

const bucketName = process.env.NEXT_PUBLIC_BUCKETNAME!;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        { message: "Invalid authorization header" },
        { status: 401 }
      );
    }

    const unusedMedia = await db
      .select()
      .from(mediaTable)
      .where(
        and(
          isNull(mediaTable.postId),
          lte(mediaTable.createdAt, new Date(Date.now() - 1000 * 60 * 60 * 24))
        )
      );

    const keys = unusedMedia.map((media) => media.key);
    const ids = unusedMedia.map((media) => media.id);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove(keys);

    await db.delete(mediaTable).where(inArray(mediaTable.id, ids));

    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
