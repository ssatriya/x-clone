import { useState } from "react";
import { generateIdFromEntropySize } from "lucia";

import { FileWithPreview } from "@/types";
import { supabase } from "@/lib/supabase/client";

const bucketName = process.env.NEXT_PUBLIC_BUCKETNAME!;

const uploadFileWithProgress = async (
  file: FileWithPreview,
  fileProgressCallback: (progress: number) => void
) => {
  const fileType = file.file.type.split("/")[1];
  const uploadPath = `${generateIdFromEntropySize(10)}.${fileType}`;

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucketName)
    .createSignedUploadUrl(uploadPath);

  if (signedUrlError) {
    console.error("Error generating signed URL:", signedUrlError.message);
    return null;
  }

  const signedUrl = signedUrlData.signedUrl;

  const formData = new FormData();
  formData.append("file", file.file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", signedUrl, true);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        fileProgressCallback(percentComplete);
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(uploadPath);
      } else {
        console.error(`Failed to upload ${file.file.name}`);
        reject(xhr.responseText);
      }
    };

    xhr.onerror = () => reject("Upload failed");

    xhr.send(file.file);
  });
};

export const useUploadMedia = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const uploadFilesWithProgress = async (files: FileWithPreview[]) => {
    const fileCount = files.length;
    let uploadProgress = Array(fileCount).fill(0);

    const updateOverallProgress = () => {
      const totalProgress =
        uploadProgress.reduce((acc, curr) => acc + curr, 0) / fileCount;
      setOverallProgress(totalProgress);
    };

    setIsUploading(true);

    const uploadPromises = files.map((file, index) =>
      uploadFileWithProgress(file, (fileProgress) => {
        uploadProgress[index] = fileProgress;
        updateOverallProgress();
      })
    );

    try {
      const uploadPaths = await Promise.all(uploadPromises);

      const publicUrls = uploadPaths.map((path) => {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(path as string);
        return publicUrlData.publicUrl;
      });

      setIsUploading(false);
      return publicUrls;
    } catch (error) {
      setIsUploading(false);
    }
  };

  return { uploadFilesWithProgress, isUploading, overallProgress };
};
