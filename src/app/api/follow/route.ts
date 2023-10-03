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
    const { userToFollowId } = FollowValidator.parse(body);

    // Following: Check if current logged in user already following other user they currently viewed
    const isAlreadyFollowed = await db.following.findUnique({
      where: {
        user_who_follow_id_user_to_follow_id: {
          user_who_follow_id: userToFollowId,
          user_to_follow_id: session.user.userId,
        },
      },
    });

    // Followers: Check if current logged in user already in the followers list of other user
    const isAlreadyFollowers = await db.follower.findUnique({
      where: {
        user_to_follow_id_user_who_follow_id: {
          user_to_follow_id: session.user.userId,
          user_who_follow_id: userToFollowId,
        },
      },
    });

    if (isAlreadyFollowed && isAlreadyFollowers) {
      await db.following.delete({
        where: {
          user_who_follow_id_user_to_follow_id: {
            user_who_follow_id: userToFollowId,
            user_to_follow_id: session.user.userId,
          },
        },
      });

      await db.follower.delete({
        where: {
          user_to_follow_id_user_who_follow_id: {
            user_to_follow_id: session.user.userId,
            user_who_follow_id: userToFollowId,
          },
        },
      });

      return new Response("Ok");
    }

    // create following
    await db.following.create({
      data: {
        user_who_follow_id: userToFollowId,
        user_to_follow_id: session.user.userId,
      },
    });

    // create followers
    await db.follower.create({
      data: {
        user_to_follow_id: session.user.userId,
        user_who_follow_id: userToFollowId,
      },
    });

    return new Response("Ok");
  } catch (error) {
    return new Response("Internal error.", { status: 500 });
  }
}

// export async function GET(req: Request) {
//   try {
//     const session = await getCurrentSession();
//     const { searchParams } = new URL(req.url);

//     if (!session?.user) {
//       return new Response("Unauthorized.", { status: 401 });
//     }

//     const userId = searchParams.get("userId");

//     if (!userId) {
//       return new Response("User ID is missing.", { status: 400 });
//     }

//     const userData = await db.user.findUnique({
//       where: {
//         id: userId,
//       },
//     });

//     return new Response(JSON.stringify(userData));
//   } catch (error) {
//     return new Response("Internal error.", { status: 500 });
//   }
// }
