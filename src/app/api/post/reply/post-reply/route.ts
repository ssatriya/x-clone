import { db } from "@/lib/db";
import { PostType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return new Response("Post ID is missing.", { status: 401 });
    }

    const reply = await db.post.findMany({
      where: {
        AND: {
          post_type: PostType.REPLY,
          original_replied_post_id: postId,
        },
      },
      include: {
        user_one: {
          include: {
            followers: true,
            following: true,
          },
        },
        user_two: {
          include: {
            followers: true,
            following: true,
          },
        },
        likes: true,
        replys: true,
        reposts: true,
      },
    });

    return new Response(JSON.stringify(reply));
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
