import Header from "@/components/layout/center/header";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header title="Post" backButton={true} />
      {children}
    </div>
  );
}
