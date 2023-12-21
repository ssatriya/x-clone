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
          original_repost: {
            select: {
              content: true,
              createdAt: true,
              id: true,
              image_url: true,
              is_deleted: true,
              likes: true,
              original_replied_post_id: true,
              original_repost: true,
              post_type: true,
              replys: true,
              reposts: true,
              user_one: {
                include: {
                  followers: true,
                  following: true,
                },
              },
              user_one_id: true,
              user_two: {
                include: {
                  followers: true,
                  following: true,
                },
              },
              user_two_id: true,
              userId: true,
              views: true,
            },
          },
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
        original_repost: {
          select: {
            content: true,
            createdAt: true,
            id: true,
            image_url: true,
            is_deleted: true,
            likes: true,
            original_replied_post_id: true,
            original_repost: true,
            post_type: true,
            replys: true,
            reposts: true,
            user_one: {
              include: {
                followers: true,
                following: true,
              },
            },
            user_one_id: true,
            user_two: {
              include: {
                followers: true,
                following: true,
              },
            },
            user_two_id: true,
            userId: true,
            views: true,
          },
        },
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
