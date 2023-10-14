import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const originalRepliedPostId = searchParams.get("originalRepliedPostId");

    if (!originalRepliedPostId) {
      return new Response("Original post ID is missing.", { status: 401 });
    }

    const originalPost = await db.post.findUnique({
      where: {
        id: originalRepliedPostId,
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

    return new Response(JSON.stringify(originalPost));
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
