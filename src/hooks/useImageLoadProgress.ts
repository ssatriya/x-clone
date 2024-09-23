import { useState, useEffect } from "react";

const useImageLoadProgress = (src: string) => {
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);
    xhr.responseType = "blob";

    xhr.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setProgress(100);
      }
      setIsLoading(false);
    };

    xhr.onerror = () => {
      console.error("Error loading image");
      setProgress(0);
    };

    xhr.send();

    return () => {
      xhr.abort();
    };
  }, [src]);

  return { progress, isLoading };
};

export default useImageLoadProgress;
