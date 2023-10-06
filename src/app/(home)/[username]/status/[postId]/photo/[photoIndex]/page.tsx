type LightBoxPageProps = {
  params: {
    photoIndex: string;
  };
};

export default function LightBoxPage({ params }: LightBoxPageProps) {
  return <div>{params.photoIndex}</div>;
}
