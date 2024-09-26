import Compressor from "compressorjs";
import locale from "date-fns/locale/id";
import { twMerge } from "tailwind-merge";
import { MotionProps } from "framer-motion";
import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function updateProgress(characters: any) {
  const maxCharacters = 280;
  const progress = Math.min(characters / maxCharacters, 1);

  const circumference = 2 * Math.PI * 10;
  const strokeOffset = circumference * (1 - progress);
  const progressCircle = document.getElementById("progressCircle");

  if (progressCircle) {
    progressCircle.style.strokeDashoffset = `${strokeOffset}px`;
  }

  const clipRect = document.querySelector("#progressClip rect");
  clipRect?.setAttribute("width", `${progress * 100}%`);
}

const removeExtension = (fileName: string) =>
  fileName.substring(0, fileName.lastIndexOf(".")) || fileName;

export async function compress(
  file: File,
  quality: number,
  maxHeight: number,
  maxWidth: number
) {
  return await new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      maxHeight,
      maxWidth,
      retainExif: true,
      convertTypes: ["image/png", "image/jpeg", "image/gif", "image/jpg"],
      success: (compressedFile) => {
        if (compressedFile instanceof File) return resolve(compressedFile);
        else {
          const compressedFileFromBlob = new File(
            [compressedFile],
            removeExtension(file.name),
            {
              type: compressedFile.type,
            }
          );
          return resolve(compressedFileFromBlob);
        }
      },
      error: reject,
    });
  });
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const formatDistanceLocale = {
  lessThanXSeconds: "just now",
  xSeconds: "just now",
  halfAMinute: "just now",
  lessThanXMinutes: "{{count}}m",
  xMinutes: "{{count}}m",
  aboutXHours: "{{count}}h",
  xHours: "{{count}}h",
  xDays: "{{count}}d",
  aboutXWeeks: "{{count}}w",
  xWeeks: "{{count}}w",
  aboutXMonths: "{{count}}m",
  xMonths: "{{count}}m",
  aboutXYears: "{{count}}y",
  xYears: "{{count}}y",
  overXYears: "{{count}}y",
  almostXYears: "{{count}}y",
};

function formatDistance(token: string, count: number, options?: any): string {
  options = options || {};

  const result = formatDistanceLocale[
    token as keyof typeof formatDistanceLocale
  ].replace("{{count}}", count.toString());

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return "in " + result;
    } else {
      if (result === "just now") return result;
      return result;
    }
  }

  return result;
}

export function formatTimeToNow(date: Date): string {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  });
}

export function getStatsMove(movePixels: number): MotionProps {
  return {
    initial: {
      opacity: 0,
      y: movePixels,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: movePixels,
    },
    transition: {
      type: "tween",
      duration: 0.15,
    },
  };
}

export function getImageDimension(
  url: string
): Promise<{ width: number; height: number }> {
  const img = document.createElement("img");

  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      resolve({ width, height });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image at ${url}`));
    };

    img.src = url;
  });
}
export function getVideoDimension(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");

    video.addEventListener(
      "loadedmetadata",
      function () {
        const height = this.videoHeight;
        const width = this.videoWidth;

        resolve({ height, width });
      },
      false
    );

    video.src = url;
  });
}

export const getBasePath = (path: string): string | undefined => {
  return path.match(/^\/[^\/]+/)?.[0];
};

export function formatTimestamp(timestamp: string | number | Date): string {
  const date = new Date(timestamp);

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const formattedTime = timeFormatter.format(date);

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedDate = dateFormatter.format(date);

  return `${formattedTime} · ${formattedDate}`;
}

// export const formatDuration = (seconds: number): string => {
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = Math.floor(seconds % 60);

//   const formattedSeconds =
//     remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

//   return `${minutes}:${formattedSeconds}`;
// };
export const formatDuration = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const getInitialIndex = ({
  pathname,
  routeIndexMap,
  defaultTab,
}: {
  pathname: string;
  routeIndexMap: Record<string, number>;
  defaultTab: string;
}) => {
  const currentRoute = pathname.split("/").pop();
  return routeIndexMap[currentRoute || defaultTab];
};
