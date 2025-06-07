import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    workos_id: v.string(),
  }).index("by_workos_id", ["workos_id"]),
  profiles: defineTable({
    name: v.string(),
    bio: v.string(),
    image: v.string(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_name", ["name"]),
  books: defineTable({
    title: v.string(),
    description: v.string(),
    coverImage: v.string(),
    authorId: v.id("users"),
  })
    .index("by_author", ["authorId"])
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_description", { searchField: "description" }),
  reviews: defineTable({
    content: v.string(),
    bookId: v.id("books"),
    authorId: v.id("users"),
  })
    .index("by_book", ["bookId"])
    .index("by_author", ["authorId"]),
  chapters: defineTable({
    title: v.string(),
    content: v.string(),
    bookId: v.id("books"),
    authorId: v.id("users"),
  })
    .index("by_book", ["bookId"])
    .index("by_author", ["authorId"])
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_content", { searchField: "content" }),
  comments: defineTable({
    content: v.string(),
    bookId: v.id("books"),
    chapterId: v.id("chapters"),
    authorId: v.id("users"),
  })
    .index("by_book", ["bookId"])
    .index("by_chapter", ["chapterId"])
    .index("by_author", ["authorId"]),
  authorFollows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_follower_following", ["followerId", "followingId"])
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"]),
  bookFollows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("books"),
  })
    .index("by_follower_following", ["followerId", "followingId"])
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"]),
  bookLikes: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
  })
    .index("by_user_book", ["userId", "bookId"])
    .index("by_user", ["userId"])
    .index("by_book", ["bookId"]),
  chapterLikes: defineTable({
    userId: v.id("users"),
    chapterId: v.id("chapters"),
  })
    .index("by_user_chapter", ["userId", "chapterId"])
    .index("by_user", ["userId"])
    .index("by_chapter", ["chapterId"]),
});
