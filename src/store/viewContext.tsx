"use client";

import * as React from "react";

type ViewContextType = {
  view: "for-you" | "following";
  setView: (value: "for-you" | "following") => void;
};

export const ViewContext = React.createContext<ViewContextType>({
  view: "for-you",
  setView: (value) => {},
});

export const ViewContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [view, setView] = React.useState<"for-you" | "following">("for-you");

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
};
