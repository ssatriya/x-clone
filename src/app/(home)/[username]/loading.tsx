import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-full flex justify-center items-start mt-6">
      <Loader2 className="h-9 w-9 animate-spin stroke-blue" />
    </div>
  );
}
