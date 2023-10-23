"use client";

import { ViewContextProvider } from "@/store/viewContext";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider>
        <ViewContextProvider>{children}</ViewContextProvider>
      </NextUIProvider>
    </QueryClientProvider>
  );
}
