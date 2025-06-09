import { Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { match } from "ts-pattern";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateUsername } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Fragment, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import type { Id } from "convex/_generated/dataModel";

function ActivitySkeleton() {
  return (
    <div className="px-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-16 h-24 rounded" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function useInfiniteScroll(callback: () => void) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [callback]);

  return observerTarget;
}

export function ActivityFeed({ authorId }: { authorId?: Id<"users"> }) {
  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.activities.getActivities,
    { authorId },
    { initialNumItems: 10 }
  );

  const handleLoadMore = () => {
    if (status === "CanLoadMore") {
      loadMore(10);
    }
  };

  const observerTarget = useInfiniteScroll(handleLoadMore);

  if (isLoading && results.length === 0) {
    return (
      <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto flex-1">
        {!authorId ? (
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Activity</h2>
          </div>
        ) : (
          <div />
        )}
        {Array.from({ length: 3 }).map((_, i) => (
          <Fragment key={i}>
            <ActivitySkeleton />
            <Separator />
          </Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl mx-auto flex-1">
      {!authorId ? (
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Activity</h2>
        </div>
      ) : (
        <div />
      )}
      {results.map((activity) => (
        <Fragment key={activity._id}>
          {match(activity)
            .with({ type: "PublishBook" }, (activity) => {
              const { book, author } = activity;
              return (
                <div className="px-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={author.profile?.profilePicture} />
                      <AvatarFallback className="text-xs uppercase">
                        {(
                          author.profile?.username ??
                          generateUsername(author._id)
                        ).slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/author/$id"
                          params={{ id: author._id }}
                          className="text-sm underline"
                        >
                          {author.profile?.username ??
                            generateUsername(author._id)}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          published a book{" "}
                          {formatDistanceToNow(activity._creationTime, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex flex-col gap-1">
                          <Link
                            to="/book/$id"
                            params={{ id: book._id }}
                            className="font-medium hover:underline"
                          >
                            {book.title}
                          </Link>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {book.description}
                          </p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>
                              {formatNumber(book.totalChapters)} chapters
                            </span>
                            <span>{formatNumber(book.totalLikes)} likes</span>
                            <span>
                              {formatNumber(book.totalComments)} comments
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
            .with({ type: "PublishChapter" }, (activity) => {
              const { book, author, chapter } = activity;
              return (
                <div className="px-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={author.profile?.profilePicture} />
                      <AvatarFallback className="text-xs uppercase">
                        {(
                          author.profile?.username ??
                          generateUsername(author._id)
                        ).slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/author/$id"
                          params={{ id: author._id }}
                          className="text-sm underline"
                        >
                          {author.profile?.username ??
                            generateUsername(author._id)}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          published a chapter{" "}
                          {formatDistanceToNow(activity._creationTime, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex flex-col gap-1">
                          <Link
                            to="/book/$id/chapter/$chapterId"
                            params={{ id: book._id, chapterId: chapter._id }}
                            className="font-medium hover:underline"
                          >
                            {chapter.title}
                          </Link>
                          <Link
                            to="/book/$id"
                            params={{ id: book._id }}
                            className="text-sm text-muted-foreground"
                          >
                            {book.title}
                          </Link>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>
                              {formatNumber(chapter.totalWords)} words
                            </span>
                            <span>
                              {formatNumber(chapter.totalLikes)} likes
                            </span>
                            <span>
                              {formatNumber(chapter.totalComments)} comments
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
            .with({ type: "PublishComment" }, (activity) => {
              const { book, author, chapter, comment } = activity;
              return (
                <div className="px-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={author.profile?.profilePicture} />
                      <AvatarFallback className="text-xs uppercase">
                        {(
                          author.profile?.username ??
                          generateUsername(author._id)
                        ).slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/author/$id"
                          params={{ id: author._id }}
                          className="text-sm underline"
                        >
                          {author.profile?.username ??
                            generateUsername(author._id)}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          commented{" "}
                          {formatDistanceToNow(activity._creationTime, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex flex-col gap-1">
                          <Link
                            to="/book/$id/chapter/$chapterId"
                            params={{ id: book._id, chapterId: chapter._id }}
                            className="text-sm text-muted-foreground"
                          >
                            {chapter.title}
                          </Link>
                          <p
                            className="prose-sm"
                            dangerouslySetInnerHTML={{
                              __html: comment.content,
                            }}
                          />
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>
                              {formatNumber(comment.totalLikes)} likes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
            .with({ type: "PublishReview" }, (activity) => {
              const { book, author, review } = activity;
              return (
                <div className="px-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={author.profile?.profilePicture} />
                      <AvatarFallback className="text-xs uppercase">
                        {(
                          author.profile?.username ??
                          generateUsername(author._id)
                        ).slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/author/$id"
                          params={{ id: author._id }}
                          className="text-sm underline"
                        >
                          {author.profile?.username ??
                            generateUsername(author._id)}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          reviewed{" "}
                          {formatDistanceToNow(activity._creationTime, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex flex-col gap-1">
                          <Link
                            to="/book/$id"
                            params={{ id: book._id }}
                            className="font-medium hover:underline"
                          >
                            {book.title}
                          </Link>
                          <p
                            className="prose-sm"
                            dangerouslySetInnerHTML={{ __html: review.content }}
                          />
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{formatNumber(review.totalLikes)} likes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
            .exhaustive()}
          <Separator />
        </Fragment>
      ))}
      {status === "CanLoadMore" && <div ref={observerTarget} className="h-4" />}
      {status === "Exhausted" && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          You've reached the end of the activity feed
        </div>
      )}
    </div>
  );
}
