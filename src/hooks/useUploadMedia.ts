import { useState } from "react";
import { generateIdFromEntropySize } from "lucia";

import kyInstance from "@/lib/ky";
import { FileWithPreview } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { CreateMediaSchema } from "@/lib/zod-schema";

const bucketName = process.env.NEXT_PUBLIC_BUCKETNAME!;

const uploadFile = async (file: File) => {
  const fileType = file.type.split("/")[1];
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
  formData.append("file", file);

  try {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);

    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(uploadPath);
        } else {
          console.error(`Failed to upload ${file.name}`);
          reject(xhr.responseText);
        }
      };

      xhr.onerror = () => reject("Upload failed");
      xhr.send(file);
    });
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

const blobToFile = (theBlob: Blob, fileName: string): File => {
  const b: any = theBlob;
  b.lastModifiedDate = new Date();
  b.name = fileName;

  return theBlob as File;
};

export const useUploadMedia = () => {
  const [uploadingFiles, setUploadingFiles] = useState<{
    [id: string]: boolean;
  }>({});

  const startUpload = async (file: FileWithPreview) => {
    const fileId = file.meta.id;
    setUploadingFiles((prev) => ({ ...prev, [fileId]: true }));

    try {
      if (file.meta.format === "gif") {
        const formData = new FormData();
        formData.append("file", file.file);

        try {
          const response = await fetch(
            "https://express-ffmpeg.fly.dev/api/upload",
            {
              method: "POST",
              body: formData,
              headers: {
                "x-api-key": process.env.NEXT_PUBLIC_CONVERT_GIF_API!,
              },
            }
          );

          if (!response.ok) {
            throw new Error("failed to convert");
          }

          const blob = await response.blob();
          const mp4File = blobToFile(blob, "convertedGIF");

          const uploadPath = await uploadFile(mp4File);

          if (uploadPath) {
            const { data: publicUrlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(uploadPath as string);

            const payload: CreateMediaSchema = {
              id: file.meta.id,
              format: file.meta.format,
              height: file.meta.dimension.height,
              width: file.meta.dimension.width,
              size: mp4File.size,
              key: uploadPath as string,
              url: publicUrlData.publicUrl,
            };

            await kyInstance
              .post("/api/post/media", {
                body: JSON.stringify(payload),
              })
              .json<{ id: string }>();

            setUploadingFiles((prev) => ({ ...prev, [fileId]: false }));
          }
        } catch (error) {
          setUploadingFiles((prev) => ({ ...prev, [fileId]: false }));
          console.error("Error uploading or converting GIF:", error);
          throw error;
        }
        // const uploadPath = await uploadFile(file.file);
        // if (uploadPath) {
        //   const { data: publicUrlData } = supabase.storage
        //     .from(bucketName)
        //     .getPublicUrl(uploadPath as string);
        //   const url = `https://wsrv.nl/?url=${publicUrlData.publicUrl}&output=gif&n=-1`;

        //   fetch(url)
        //     .then((res) => res.blob())
        //     .then(async (blob) => {
        //       const gifFile = new File([blob], "image.gif", {
        //         type: "image/gif",
        //       });

        //       const uploadNewGif = await uploadFile(gifFile);
        //       const { data: newData } = supabase.storage
        //         .from(bucketName)
        //         .getPublicUrl(uploadNewGif as string);

        //       const payload: CreateMediaSchema = {
        //         format: file.meta.format,
        //         height: file.meta.dimension?.height || 0,
        //         width: file.meta.dimension?.width || 0,
        //         size: gifFile.size,
        //         key: uploadNewGif as string,
        //         url: newData.publicUrl,
        //       };

        //       const returningId = await kyInstance
        //         .post("/api/post/media", {
        //           body: JSON.stringify(payload),
        //         })
        //         .json<{ id: string }>();

        //       setInsertedMediaId((prev) => [returningId.id, ...prev]);
        //       setUploadingFiles((prev) => ({ ...prev, [fileId]: false }));
        //     })
        //     .catch((error) => {
        //       console.error("Error fetching or creating file:", error);
        //       setUploadingFiles((prev) => ({ ...prev, [fileId]: false }));
        //     });
        // }
      } else {
        const uploadPath = await uploadFile(file.file);
        if (uploadPath) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uploadPath as string);

          const payload: CreateMediaSchema = {
            id: file.meta.id,
            format: file.meta.format,
            height: file.meta.dimension?.height || 0,
            width: file.meta.dimension?.width || 0,
            size: file.file.size,
            key: uploadPath as string,
            url: publicUrlData.publicUrl,
          };

          await kyInstance
            .post("/api/post/media", {
              body: JSON.stringify(payload),
            })
            .json<{ id: string }>();

          setUploadingFiles((prev) => ({ ...prev, [fileId]: false }));
        }
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      setUploadingFiles((prev) => ({ ...prev, [fileId]: false }));
      throw error;
    }
  };

  return { startUpload, uploadingFiles };
};
