import { PropsWithChildren } from "react";

import Header from "@/components/header";

export default function PostLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative border-x min-h-screen">
      <Header title="Post" backButton={true} />
      {children}
    </div>
  );
}
