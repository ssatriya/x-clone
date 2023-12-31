import { z } from "zod";

import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getCurrentSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (!page || !limit) {
      const posts = await db.post.findMany({
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
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      });

      return new Response(JSON.stringify(posts));
    }

    const posts = await db.post.findMany({
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

    return new Response(JSON.stringify(posts));
  } catch (error) {
    return new Response("Could not fetch posts.", {
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    const { content, imageUrl } = await req.json();

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }
    // const { content, imageUrl } = PostValidator.parse(body);

    await db.post.create({
      data: {
        user_one_id: session.user.userId,
        content: content,
        image_url: imageUrl,
      },
    });

    return new Response("Post submitted successfully.", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }

    return new Response("Could not submit post, please try again later.", {
      status: 500,
    });
  }
}
