export type AttachmentType = {
  type: string;
  url: string;
  mime: string;
  name: string;
  extension: string;
  size: string;
  file: File;
};

export type UserPhotoFile = {
  type: string;
  url: string;
  mime: string;
  name: string;
  extension: string;
  size: string;
  file: File;
};

type LeftSidebarLinks = {
  label: string;
  icon: string;
  href: string;
  disabled: boolean;
}[];
