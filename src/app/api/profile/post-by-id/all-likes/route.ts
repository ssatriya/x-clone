import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response("User ID is missing.", { status: 401 });
    }

    const likedPost = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        likes: {
          include: { post: true },
        },
      },
    });

    // if (!likedPost) {
    //   return new Response("No post liked.", { status: 401 });
    // }

    // const likedPostId = likedPost.likes.map((like) => like.post_id);

    // const postDetail = await db.post.findMany({
    //   where: {
    //     id: {
    //       in: likedPostId,
    //     },
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // });

    return new Response(JSON.stringify(likedPost));
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
