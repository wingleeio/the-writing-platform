/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activities from "../activities.js";
import type * as books from "../books.js";
import type * as chapters from "../chapters.js";
import type * as comments from "../comments.js";
import type * as functions from "../functions.js";
import type * as http from "../http.js";
import type * as reviews from "../reviews.js";
import type * as upload from "../upload.js";
import type * as users from "../users.js";
import type * as workos from "../workos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  books: typeof books;
  chapters: typeof chapters;
  comments: typeof comments;
  functions: typeof functions;
  http: typeof http;
  reviews: typeof reviews;
  upload: typeof upload;
  users: typeof users;
  workos: typeof workos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
