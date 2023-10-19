import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { EditProfileValidator } from "@/lib/validator/editProfile";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: {
      id: string;
    };
  }
) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const id = params.id;
    const body = await req.json();
    const { avatar, backgroundPhoto, bio, name } =
      EditProfileValidator.parse(body);
    console.log(avatar, backgroundPhoto, bio, name);
    const user = await db.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return new Response("User not found.", { status: 404 });
    }

    await db.user.update({
      data: {
        avatar: avatar?.length === 0 ? user.avatar : avatar,
        background_photo:
          backgroundPhoto?.length === 0
            ? user.background_photo
            : backgroundPhoto,
        name: name,
        bio: bio,
      },
      where: {
        id: params.id,
      },
    });

    return new Response("Ok", { status: 200 });
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
