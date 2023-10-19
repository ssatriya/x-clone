import { db } from "@/lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "../../../../../../config/config";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (!userId) {
      return new Response("User ID is missing.", { status: 401 });
    }

    if (!page || !limit) {
      const allUserPosts = await db.post.findMany({
        where: {
          user_one_id: userId,
          post_type: {
            not: "QUOTE",
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
          replys: true,
          reposts: true,
          likes: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
        orderBy: {
          createdAt: "desc",
        },
      });
      return new Response(JSON.stringify(allUserPosts));
    }

    const allUserPosts = await db.post.findMany({
      where: {
        user_one_id: userId,
        post_type: {
          not: "QUOTE",
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
        replys: true,
        reposts: true,
        likes: true,
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
    });
    return new Response(JSON.stringify(allUserPosts));
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
