import { Avatar } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { formatTimeToNow, removeAtSymbol } from "@/lib/utils";
import PostActionButton from "./action-button/post-action-button";
import Link from "next/link";
import UserTooltip from "../user-tooltip";
import * as React from "react";
import AttachmentPost from "./attachment-post";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import UserPostAvatar from "./user-post-avatar";
import { Icons } from "@/components/icons";
import { Post } from "@prisma/client";

type RepostProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
  postUserOwner: UserWithFollowersFollowing;
};

export default function Repost({
  post,
  userPosted,
  currentUser,
  postUserOwner,
}: RepostProps) {
  const usernameWithoutAt = removeAtSymbol(postUserOwner.username);
  const originalPostURL = `/${usernameWithoutAt}/status/${post.originalPostId}`;

  // const { data: originalPost } = useQuery({
  //   queryKey: ["originalPost"],
  //   queryFn: async () => {
  //     const { data } = await axios.get("/api/post/repost", {
  //       params: {
  //         postId: post.originalPostId,
  //       },
  //     });
  //     return data as ExtendedPost | ExtendedPostWithoutUserTwo;
  //   },
  // });
  // console.log(post);

  const cfg = {};
  let html = "";
  // @ts-ignore
  if (post.content && post.content.ops) {
    // @ts-ignore
    const converter = new QuillDeltaToHtmlConverter(post.content.ops, cfg);
    const converted = converter.convert();
    if (converted !== "<p><br/></p>") {
      html = converted;
    }
  }

  return (
    <div className="relative hover:bg-hover/30 transition-colors cursor-pointer flex justify-between pt-3 px-4 gap-4 border-b">
      <Link href={originalPostURL} className="absolute inset-0" />
      <div className="h-fit flex flex-col items-end">
        <div className="mb-1">
          <Icons.repost className="w-4 h-4 fill-gray" />
        </div>
        <UserPostAvatar
          currentUser={currentUser}
          user={postUserOwner}
          userPosted={postUserOwner.avatar}
          usernameWithoutAt={usernameWithoutAt}
        />
      </div>
      <div className="w-full flex flex-col">
        <div className="font-bold text-gray text-[13px] leading-4 mb-1 z-20">
          <UserTooltip currentUser={currentUser} user={postUserOwner}>
            <p className="hover:underline">{post.user_one.name} Reposted</p>
          </UserTooltip>
        </div>
        <div className="flex items-center gap-2">
          <>
            <UserTooltip user={postUserOwner} currentUser={currentUser}>
              <Link
                href={`/${usernameWithoutAt}`}
                className="font-bold z-10 hover:underline focus-visible:ring-0"
              >
                {postUserOwner.name}
              </Link>
            </UserTooltip>
            <UserTooltip user={post.user_one} currentUser={currentUser}>
              <Link
                href={`/${usernameWithoutAt}`}
                className="text-gray focus-visible:ring-0 z-10"
              >
                {postUserOwner.username}
              </Link>
            </UserTooltip>
          </>
          <span className="text-gray">·</span>
          <p className="text-gray">
            {formatTimeToNow(new Date(post.createdAt))}
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <div>
            {html.length > 0 && (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </div>
          {post.image_url && (
            <AttachmentPost imageUrl={post.image_url} post={post} />
          )}
        </div>
        <PostActionButton
          post={post}
          currentUser={currentUser}
          reposts={post.reposts}
        />
      </div>
    </div>
  );

  // Quote
  // return (
  //   <div className="hover:bg-hover/30 transition-colors cursor-pointer flex justify-between py-2 px-4 gap-4 border-b relative">
  //     <Link href={postURL} className="absolute inset-0" />
  //     <div className="h-fit">
  //       <UserTooltip user={post.user_one} currentUser={currentUser}>
  //         <Link href={`/${usernameWithoutAt}`}>
  //           <Avatar showFallback src={userPosted} />
  //         </Link>
  //       </UserTooltip>
  //     </div>

  //     <div className="w-full flex flex-col">
  //       <div className="flex items-center gap-2">
  //         <UserTooltip user={post.user_one} currentUser={currentUser}>
  //           <Link
  //             href={`/${usernameWithoutAt}`}
  //             className="font-bold hover:underline focus-visible:ring-0"
  //           >
  //             {post.user_one.name}
  //           </Link>
  //         </UserTooltip>
  //         <UserTooltip user={post.user_one} currentUser={currentUser}>
  //           <Link
  //             href={`/${usernameWithoutAt}`}
  //             className="text-gray focus-visible:ring-0"
  //           >
  //             {post.user_one.username}
  //           </Link>
  //         </UserTooltip>
  //         <span className="text-gray">·</span>
  //         <p className="text-gray">
  //           {formatTimeToNow(new Date(post.createdAt))}
  //         </p>
  //       </div>
  //       <div className="flex flex-col space-y-3">
  //         <div className="hover:bg-[#0e0e0e] transition-colors cursor-pointer flex h-fit overflow-hidden flex-col justify-between pt-4 px-4 mt-2 border rounded-3xl border-[#2f3336]z-10 relative">
  //           <Link href={originalPostURL} className="absolute inset-0" />
  //           <div className="flex gap-2 items-center mb-1">
  //             <UserTooltip user={postUserOwner} currentUser={currentUser}>
  //               <Avatar
  //                 className="w-5 h-5"
  //                 showFallback
  //                 src={postUserOwner.avatar}
  //                 size="sm"
  //               />
  //             </UserTooltip>
  //             <div className="flex items-center gap-2">
  //               <UserTooltip user={postUserOwner} currentUser={currentUser}>
  //                 <p className="font-bold">{postUserOwner.name}</p>
  //               </UserTooltip>
  //               <UserTooltip user={postUserOwner} currentUser={currentUser}>
  //                 <p className="text-[#555b61]">{postUserOwner.username}</p>
  //               </UserTooltip>
  //               <span className="text-gray">·</span>
  //               <p className="text-[#555b61]">
  //                 {post.createdAt && formatTimeToNow(new Date(post.createdAt))}
  //               </p>
  //             </div>
  //           </div>
  //           <div className="flex flex-col space-y-3">
  //             <div>
  //               {html.length > 0 && (
  //                 <div
  //                   className="pb-4"
  //                   dangerouslySetInnerHTML={{ __html: html }}
  //                 />
  //               )}
  //             </div>
  //             {post?.image_url && (
  //               <div className="flex justify-center">
  //                 {post.image_url && (
  //                   <AttachmentPost imageUrl={post.image_url} post={post} />
  //                 )}
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //       <PostActionButton
  //         post={post}
  //         currentUser={currentUser}
  //         reposts={post.reposts}
  //       />
  //     </div>
  //   </div>
  // );
}
