const useMediaURL = (media: string | null) => {
  if (!media) return { newMedia: null };
  const newMedia = JSON.parse(media);

  return { newMedia };
};

export default useMediaURL;
