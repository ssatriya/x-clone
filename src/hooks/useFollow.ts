import { FollowPayload } from "@/lib/validator/follow";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useFollow = (userByUsernameId: string, currentUserId: string) => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: ["followButton", userByUsernameId],
    mutationFn: async () => {
      const payload: FollowPayload = {
        currentUserId: currentUserId,
        viewedUserId: userByUsernameId,
      };

      const { data } = await axios.post("/api/follow", payload);
      return data as string;
    },
    onError: () => {
      toast.error("Failed to follow, try again later.");
    },
    onSuccess: (data: any) => {
      if (data === "Followed") {
        toast.success("Followed");
      } else if (data === "Unfollowed") {
        toast.error("Unfollowed");
      }
      queryClient.invalidateQueries({ queryKey: ["followersData"] });
      queryClient.invalidateQueries({ queryKey: ["followingData"] });
      queryClient.invalidateQueries({ queryKey: ["currUFollowing"] });
    },
  });

  return { mutate };
};
