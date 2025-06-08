import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authId: v.string(),
    totalBooks: v.number(),
    totalChapters: v.number(),
    totalReviews: v.number(),
    totalLikes: v.number(),
    totalFollowers: v.number(),
    totalFollowing: v.number(),
    totalComments: v.number(),
    totalWords: v.number(),
  })
    .index("by_auth_id", ["authId"])
    .index("by_total_books", ["totalBooks"])
    .index("by_total_chapters", ["totalChapters"])
    .index("by_total_reviews", ["totalReviews"])
    .index("by_total_likes", ["totalLikes"])
    .index("by_total_followers", ["totalFollowers"])
    .index("by_total_following", ["totalFollowing"])
    .index("by_total_comments", ["totalComments"])
    .index("by_total_words", ["totalWords"]),
  books: defineTable({
    title: v.string(),
    description: v.string(),
    coverImage: v.string(),
    authorId: v.id("users"),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalReviews: v.number(),
    totalChapters: v.number(),
    totalFollows: v.number(),
    totalWords: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_title", ["title"])
    .index("by_total_words", ["totalWords"])
    .index("by_total_chapters", ["totalChapters"])
    .index("by_total_likes", ["totalLikes"])
    .index("by_total_comments", ["totalComments"])
    .index("by_total_reviews", ["totalReviews"])
    .index("by_total_follows", ["totalFollows"])
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_description", { searchField: "description" }),
  reviews: defineTable({
    content: v.string(),
    bookId: v.id("books"),
    authorId: v.id("users"),
    totalLikes: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_author", ["authorId"])
    .index("by_total_likes", ["totalLikes"]),
  chapters: defineTable({
    title: v.string(),
    content: v.string(),
    bookId: v.id("books"),
    authorId: v.id("users"),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalWords: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_author", ["authorId"])
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_content", { searchField: "content" }),
  comments: defineTable({
    content: v.string(),
    bookId: v.id("books"),
    chapterId: v.id("chapters"),
    parentId: v.optional(v.id("comments")),
    authorId: v.id("users"),
    isDeleted: v.boolean(),
  })
    .index("by_book", ["bookId"])
    .index("by_chapter", ["chapterId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentId"]),
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
  reviewLikes: defineTable({
    userId: v.id("users"),
    reviewId: v.id("reviews"),
  })
    .index("by_user_review", ["userId", "reviewId"])
    .index("by_user", ["userId"])
    .index("by_review", ["reviewId"]),
});
