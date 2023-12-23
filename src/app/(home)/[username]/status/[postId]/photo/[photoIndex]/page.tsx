import { redirect } from "next/navigation";

type LightBoxPageProps = {
  params: {
    photoIndex: string;
    postId: string;
    username: string;
  };
};

export default async function LightBoxPage({ params }: LightBoxPageProps) {
  if (params.username && params.photoIndex && params.photoIndex) {
    const url = `/${params.username}/status/${params.postId}/photo/${params.photoIndex}`;
    return redirect(url);
  }

  return null;
}
