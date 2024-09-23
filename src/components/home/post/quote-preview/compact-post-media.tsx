import { cn } from "@/lib/utils";
import { MediaType } from "@/types";

type Props = {
  mediaURL: MediaType[];
};

const CompactQuoteMedia = ({ mediaURL }: Props) => {
  const classNames = cn(
    "h-[95px] w-[95px] rounded-2xl border grid overflow-clip gap-0.5",
    {
      "grid-rows-1": mediaURL.length <= 2,
      "grid-rows-2": mediaURL.length > 2,
      "grid-cols-1": mediaURL.length === 1,
      "grid-cols-2": mediaURL.length > 1,
    }
  );

  return (
    <div className={classNames}>
      {mediaURL.map((media, index) => {
        const fileType = media.type.split("/")[0] as "image" | "video";

        if (fileType === "image") {
          return (
            <div key={index} className="w-full h-full">
              <img
                src={`https://wsrv.nl/?url=${media.url}&w=${150}&output=jpeg`}
                alt="image"
                className="object-cover h-full w-full"
              />
            </div>
          );
        }

        if (fileType === "video") {
          return (
            <video
              key={index}
              preload="metadata"
              className="w-auto h-full object-cover"
              src={media.url}
            />
          );
        }
      })}
    </div>
  );
};

export default CompactQuoteMedia;
