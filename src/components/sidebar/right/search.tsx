"use client";

import Icons from "@/components/icons";

const Search = () => {
  return (
    <div className="bg-black h-[53px] pt-1">
      <div className="flex focus-within:border-primary items-center border border-transparent rounded-full group bg-muted focus-within:border-blue focus-within:bg-inherit">
        <Icons.search className="w-[44px] h-[19px] fill-gray group-focus-within:fill-primary pl-3" />
        <input
          autoCapitalize="sentences"
          placeholder="Search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          type="text"
          aria-label="Search query"
          className="focus:bg-black h-[42px] bg-none w-full rounded-r-full bg-inherit focus-visible:outline-none p-3 placeholder:text-[15px] placeholder:text-gray text-[15px]"
        />
      </div>
    </div>
  );
};
export default Search;
