"use client";

import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import ReplyItem from "./reply-item";

type ReplyProps = {
  currentUser: UserWithFollowersFollowing;
  postId: string;
};

export default function Reply({ postId, currentUser }: ReplyProps) {
  const { data: replyData, isLoading } = useQuery({
    queryKey: ["replyComment"],
    queryFn: async () => {
      const { data } = await axios.get("/api/post/reply/post-reply", {
        params: {
          postId: postId,
        },
      });

      return data as ExtendedPost[];
    },
  });

  if (isLoading || !replyData) {
    return (
      <div className="h-full flex justify-center items-start mt-6">
        <Loader2 className="h-9 w-9 animate-spin stroke-blue" />
      </div>
    );
  }

  return (
    <>
      {replyData.map((reply) => (
        <ReplyItem
          key={reply.id}
          currentUser={currentUser}
          post={reply}
          postUserOwner={reply.user_two}
          userPosted={reply.user_one.avatar}
          disabledNote={true}
        />
      ))}
    </>
  );
}

// const usernameWithoutAt = removeAtSymbol(replyData.user_one.username);
//   const postURL = `/${usernameWithoutAt}/status/${replyData.id}`;

//   const cfg = {};

//   let html = "";
//   // @ts-ignore
//   if (post.content && post.content.ops) {
//     // @ts-ignore
//     const converter = new QuillDeltaToHtmlConverter(post.content.ops, cfg);
//     const converted = converter.convert();
//     if (converted !== "<p><br/></p>") {
//       html = converted;
//     }
//   }

//   return (
//     <div className="relative hover:bg-hover/30 transition-colors cursor-pointer flex justify-between py-3 px-4 gap-4 border-b">
//       <Link href={postURL} className="absolute inset-0" />
//       <div className="h-fit">
//         <UserPostAvatar
//           currentUser={currentUser}
//           user={replyData.user_one}
//           userPosted={replyData.user_one.avatar}
//           usernameWithoutAt={usernameWithoutAt}
//         />
//       </div>

//       <div className="w-full flex flex-col">
//         <div className="flex items-center gap-2">
//           <UserPostName
//             currentUser={currentUser}
//             post={replyData}
//             usernameWithoutAt={usernameWithoutAt}
//           />
//           <span className="text-gray">·</span>
//           <p className="text-gray">
//             {formatTimeToNow(new Date(replyData.createdAt))}
//           </p>
//         </div>
//         <div className="flex flex-col space-y-3">
//           <div>
//             {html.length > 0 && (
//               <div dangerouslySetInnerHTML={{ __html: html }} />
//             )}
//           </div>
//           {replyData.image_url && (
//             <AttachmentPost imageUrl={replyData.image_url} post={replyData} />
//           )}
//         </div>
//         <PostActionButton
//           post={replyData}
//           currentUser={currentUser}
//           reposts={replyData.reposts}
//         />
//       </div>
//     </div>
//   );
