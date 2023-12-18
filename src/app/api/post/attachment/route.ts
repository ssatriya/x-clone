import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return new Response("Post ID is missing.", { status: 401 });
    }

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user_one: true,
        user_two: true,
        likes: true,
        replys: true,
        reposts: true,
      },
    });

    return new Response(JSON.stringify(post));
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
