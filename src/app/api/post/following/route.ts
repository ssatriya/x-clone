import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getCurrentSession();

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (!page || !limit) {
      return new Response("Params is missing.", { status: 400 });
    }

    // const followingPosts = await db.post.findMany({
    //   where: {
    //     user_one: {
    //       id: {
    //         in: [...following.map((user) => user.user_one_id)],
    //       },
    //     },
    //   },
    // });

    // console.log(followingPosts);
  } catch (error) {}
}
