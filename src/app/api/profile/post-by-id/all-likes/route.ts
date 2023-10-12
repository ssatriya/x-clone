import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response("User ID is missing.", { status: 401 });
    }

    const allLikesByUser = await db.like.findMany({
      where: {
        user_id: userId,
      },
    });

    if (!allLikesByUser) {
      return new Response("No like found.", { status: 404 });
    }

    const likedPostId = allLikesByUser.map((like) => like.post_id);

    const likedPost = await db.post.findMany({
      where: {
        id: { in: likedPostId },
      },
      include: {
        likes: true,
      },
    });

    return new Response(JSON.stringify(likedPost));

    // return new Response(JSON.stringify(allUserPosts));
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
