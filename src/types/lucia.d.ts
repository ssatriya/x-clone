// <reference type="lucia" />
declare namespace Lucia {
  type Auth = import("../lib/lucia.ts").Auth;
  type DatabaseUserAttributes = {
    name: string;
    username: string;
    email: string;
    avatar: string;
  };
  type DatabaseSessionAttributes = {};
}
