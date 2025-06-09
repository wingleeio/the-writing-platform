import { Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { match } from "ts-pattern";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateUsername } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Fragment, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import type { Id } from "convex/_generated/dataModel";
import { BookOpen, MessageSquare, Heart, FileText } from "lucide-react";

function StatsDisplay({
  stats,
}: {
  stats: { icon: React.ReactNode; label: string; value: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <span className="text-primary">{stat.icon}</span>
          <span className="font-medium">{formatNumber(stat.value)}</span>
          <span className="text-muted-foreground/80">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

function ImageWithLoading({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative">
      {isLoading && <Skeleton className={className} />}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "hidden" : ""}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
      />
      {error && (
        <div
          className={`${className} bg-muted flex items-center justify-center text-muted-foreground`}
        >
          <BookOpen className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="px-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col md:flex-row gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-16 h-24 rounded" />
            <div className="flex flex-col gap-2 flex-1">
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
                      <div className="flex flex-col md:flex-row gap-2">
                        <Link
                          to="/author/$id"
                          params={{ id: author._id }}
                          className="text-sm underline cursor-pointer"
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
                        <ImageWithLoading
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex flex-col gap-2">
                          <Link
                            to="/book/$id"
                            params={{ id: book._id }}
                            className="font-medium hover:underline cursor-pointer"
                          >
                            {book.title}
                          </Link>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {book.description}
                          </p>
                          <StatsDisplay
                            stats={[
                              {
                                icon: <FileText className="h-4 w-4" />,
                                label: "chapters",
                                value: book.totalChapters,
                              },
                              {
                                icon: <FileText className="h-4 w-4" />,
                                label: "words",
                                value: book.totalWords,
                              },
                              {
                                icon: <Heart className="h-4 w-4" />,
                                label: "likes",
                                value: book.totalLikes,
                              },
                              {
                                icon: <MessageSquare className="h-4 w-4" />,
                                label: "comments",
                                value: book.totalComments,
                              },
                            ]}
                          />
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
                      <div className="flex flex-col md:flex-row gap-2">
                        <Link
                          to="/author/$id"
                          params={{ id: author._id }}
                          className="text-sm underline cursor-pointer"
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
                        <ImageWithLoading
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex flex-col gap-2">
                          <Link
                            to="/book/$id/chapter/$chapterId"
                            params={{ id: book._id, chapterId: chapter._id }}
                            className="font-medium hover:underline cursor-pointer"
                          >
                            {chapter.title}
                          </Link>
                          <Link
                            to="/book/$id"
                            params={{ id: book._id }}
                            className="text-sm text-muted-foreground hover:underline cursor-pointer"
                          >
                            {book.title}
                          </Link>
                          <StatsDisplay
                            stats={[
                              {
                                icon: <FileText className="h-4 w-4" />,
                                label: "words",
                                value: chapter.totalWords,
                              },
                              {
                                icon: <Heart className="h-4 w-4" />,
                                label: "likes",
                                value: chapter.totalLikes,
                              },
                              {
                                icon: <MessageSquare className="h-4 w-4" />,
                                label: "comments",
                                value: chapter.totalComments,
                              },
                            ]}
                          />
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
                      <div className="flex flex-col md:flex-row gap-2">
                        <Link
                          to="/author/$id"
                          params={{ id: author._id }}
                          className="text-sm underline cursor-pointer"
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
                        <ImageWithLoading
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex flex-col gap-2">
                          <Link
                            to="/book/$id/chapter/$chapterId"
                            params={{ id: book._id, chapterId: chapter._id }}
                            className="text-sm text-muted-foreground hover:underline cursor-pointer"
                          >
                            {chapter.title}
                          </Link>
                          <p
                            className="prose-sm"
                            dangerouslySetInnerHTML={{
                              __html: comment.content,
                            }}
                          />
                          <StatsDisplay
                            stats={[
                              {
                                icon: <Heart className="h-4 w-4" />,
                                label: "likes",
                                value: comment.totalLikes,
                              },
                            ]}
                          />
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
                      <div className="flex flex-col md:flex-row gap-2">
                        <Link
                          to="/author/$id"
                          params={{ id: author._id }}
                          className="text-sm underline cursor-pointer"
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
                        <ImageWithLoading
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex flex-col gap-2">
                          <Link
                            to="/book/$id"
                            params={{ id: book._id }}
                            className="font-medium hover:underline cursor-pointer"
                          >
                            {book.title}
                          </Link>
                          <p
                            className="prose-sm"
                            dangerouslySetInnerHTML={{ __html: review.content }}
                          />
                          <StatsDisplay
                            stats={[
                              {
                                icon: <Heart className="h-4 w-4" />,
                                label: "likes",
                                value: review.totalLikes,
                              },
                            ]}
                          />
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
