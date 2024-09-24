import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const lastPostId = req.nextUrl.searchParams.get("postId");

    if (!lastPostId) {
      return new Response("invalid searchparams", { status: 404 });
    }

    const [timestamp] = await db.execute(
      sql`SELECT id, created_at FROM "post" WHERE (post.post_type = 'post' OR post.post_type = 'quote') AND post.id = ${lastPostId}`
    );

    const count = await db.execute(
      sql`SELECT id, created_at 
        FROM "post" 
        WHERE post_type = 'post' 
        AND created_at > ${timestamp.created_at}`
    );

    return Response.json({ count: count.length });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
