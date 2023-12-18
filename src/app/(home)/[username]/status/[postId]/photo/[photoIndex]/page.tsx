import PhotoModal from "@/components/modal/lightbox/photo-modal";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { removeAtSymbol } from "@/lib/utils";
import { redirect } from "next/navigation";

type LightBoxPageProps = {
  params: {
    photoIndex: string;
    postId: string;
    username: string;
  };
};

export default async function LightBoxPage({ params }: LightBoxPageProps) {
  // const session = await getCurrentSession();

  // const post = await db.post.findUnique({
  //   where: {
  //     id: params.postId,
  //   },
  //   include: {
  //     user_one: {
  //       include: {
  //         followers: true,
  //         following: true,
  //       },
  //     },
  //     replys: true,
  //     reposts: true,
  //     likes: true,
  //     original_repost: true,
  //   },
  // });

  // if (!session?.user) {
  //   return redirect("/");
  // }

  // const user = await db.user.findUnique({
  //   where: {
  //     id: session.user.userId,
  //   },
  //   include: {
  //     followers: true,
  //     following: true,
  //   },
  // });

  // if (!post) {
  //   return redirect("/home");
  // }
  // if (!user) {
  //   return redirect("/");
  // }

  if (params.username && params.photoIndex && params.photoIndex) {
    const url = `/${params.username}/status/${params.postId}`;
    return redirect(url);
  }

  return <></>;
  // return <PhotoModal params={params} post={post} currentUser={user} />;
}
