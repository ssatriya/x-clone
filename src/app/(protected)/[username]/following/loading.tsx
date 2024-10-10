import LoadingSpinner from "@/components/loading-spinner";

export default function Loading() {
  return (
    <div className="w-full h-full flex items-start justify-center mt-10">
      <LoadingSpinner />
    </div>
  );
}
