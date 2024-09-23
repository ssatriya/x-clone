import db from "@/lib/db";
import { postTable } from "@/lib/db/schema";
import { and, eq, gt, or, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const lastPostId = req.nextUrl.searchParams.get("postId");

    if (!lastPostId) {
      return new Response("invalid searchparams", { status: 404 });
    }

    const [timestamp] = await db.execute(
      sql`SELECT id, created_at FROM "post" WHERE post.id = ${lastPostId}`
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
