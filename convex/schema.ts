import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    profile: v.optional(
      v.object({
        username: v.string(),
        profilePicture: v.optional(v.string()),
        bio: v.string(),
      })
    ),
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
    .index("by_profile_username", ["profile.username"])
    .index("by_auth_id", ["authId"])
    .index("by_total_books", ["totalBooks"])
    .index("by_total_chapters", ["totalChapters"])
    .index("by_total_reviews", ["totalReviews"])
    .index("by_total_likes", ["totalLikes"])
    .index("by_total_followers", ["totalFollowers"])
    .index("by_total_following", ["totalFollowing"])
    .index("by_total_comments", ["totalComments"])
    .index("by_total_words", ["totalWords"]),
  activities: defineTable({
    type: v.union(
      v.literal("PublishBook"),
      v.literal("PublishChapter"),
      v.literal("PublishComment"),
      v.literal("PublishReview")
    ),
    bookId: v.id("books"),
    authorId: v.id("users"),
    chapterId: v.optional(v.id("chapters")),
    commentId: v.optional(v.id("comments")),
    reviewId: v.optional(v.id("reviews")),
  })
    .index("by_author", ["authorId"])
    .index("by_book", ["bookId"])
    .index("by_chapter", ["chapterId"])
    .index("by_comment", ["commentId"])
    .index("by_review", ["reviewId"]),
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
    totalLikes: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_chapter", ["chapterId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentId"])
    .index("by_chapter_parent", ["chapterId", "parentId"]),
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
  commentLikes: defineTable({
    userId: v.id("users"),
    commentId: v.id("comments"),
  })
    .index("by_user_comment", ["userId", "commentId"])
    .index("by_user", ["userId"])
    .index("by_comment", ["commentId"]),
});
