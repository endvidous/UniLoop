/* eslint-disable */
import * as Router from "expo-router";

declare module "expo-router" {
  type ValidRole = "admin" | "teacher" | "student";
  type AuthenticatedRoute = `/(authenticated)/(${ValidRole})/(tabs)`;

  export interface Router {
    push: (href: AuthenticatedRoute | Router.RelativePathString) => void;
    replace: (href: AuthenticatedRoute | Router.RelativePathString) => void;
  }

  // Add other custom route types here
  export interface LinkProps<T> {
    href: T | AuthenticatedRoute;
  }
}
