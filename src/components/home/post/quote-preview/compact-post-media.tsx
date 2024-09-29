import { cn } from "@/lib/utils";
import { Media, MediaFormat } from "@/types";

type Props = {
  mediaURL: Media[];
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
        const fileType = media.format as MediaFormat;

        if (
          fileType === "jpeg" ||
          fileType === "jpg" ||
          fileType === "png" ||
          fileType === "gif"
        ) {
          return (
            <div key={index} className="w-full h-full">
              {/* eslint-disable @next/next/no-img-element */}
              <img
                src={`https://wsrv.nl/?url=${media.url}&w=${150}&output=jpeg`}
                alt="image"
                className="object-cover h-full w-full"
              />
            </div>
          );
        }

        if (fileType === "mp4") {
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
