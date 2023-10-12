import { db } from "@/lib/db";
import { PostType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response("User ID is missing.", { status: 401 });
    }

    const allUserReplies = await db.post.findMany({
      where: {
        AND: {
          user_one_id: userId,
          post_type: PostType.REPLY,
        },
      },
    });

    return new Response(JSON.stringify(allUserReplies));
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
