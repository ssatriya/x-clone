import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { FollowValidator } from "@/lib/validator/follow";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const body = await req.json();
    const { currentUserId, viewedUserId } = FollowValidator.parse(body);

    const currUserData = await db.user.findUnique({
      where: {
        id: currentUserId,
      },
      include: {
        following: true,
      },
    });

    const viewUserData = await db.user.findUnique({
      where: {
        id: viewedUserId,
      },
      include: {
        followers: true,
      },
    });

    const isFollowingExist = currUserData?.following.find(
      (user) => user.id === viewedUserId
    );

    const isFollowersExist = viewUserData?.followers.find(
      (user) => user.id === currentUserId
    );

    if (!!isFollowersExist && !!isFollowingExist) {
      await db.user.update({
        where: {
          id: currentUserId,
        },
        data: {
          following: { disconnect: { id: viewedUserId } },
        },
      });

      await db.user.update({
        where: {
          id: viewedUserId,
        },
        data: {
          followers: { disconnect: { id: currentUserId } },
        },
      });
      return new Response("Unfollowed");
    }

    await db.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        following: { connect: { id: viewedUserId } },
      },
    });

    await db.user.update({
      where: {
        id: viewedUserId,
      },
      data: {
        followers: { connect: { id: currentUserId } },
      },
    });

    return new Response("Followed");
  } catch (error) {
    return new Response("Internal error.", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const userId = searchParams.get("userId");
    const followingParams = searchParams.get("following");
    const followersParams = searchParams.get("follow");

    if (!userId) {
      return new Response("User ID is missing.", { status: 400 });
    }

    if (!followersParams && !followingParams) {
      return new Response("Parameter is missing.", { status: 400 });
    }

    if (followersParams === "followers") {
      const followers = await db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          followers: true,
        },
      });
      return new Response(JSON.stringify(followers));
    }

    const following = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        following: true,
      },
    });
    return new Response(JSON.stringify(following));
  } catch (error) {
    return new Response("Internal error.", { status: 500 });
  }
}
