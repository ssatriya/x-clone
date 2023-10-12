import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return new Response("Post ID is missing.", { status: 401 });
    }

    const repostCount = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        reposts: true,
      },
    });

    return new Response(JSON.stringify(repostCount));
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
