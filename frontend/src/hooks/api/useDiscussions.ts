import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { discussionsService } from "@/src/services/api/discussionAPI";
import { queryKeys } from "../../services/api/queryKeys";
import { User } from "@/src/utils/interfaces";

export const useDiscussions = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.discussions.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      discussionsService.getDiscussions({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useDiscussion = (id: string) => {
  return useQuery({
    queryKey: queryKeys.discussions.detail(id),
    queryFn: () => discussionsService.getDiscussion(id),
    enabled: !!id,
  });
};

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discussionsService.createDiscussion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions.all });
    },
  });
};

export const useUpdateDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      discussionsService.updateDiscussion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions.all });
    },
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discussionsService.deleteDiscussion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions.all });
      queryClient.removeQueries({ queryKey: queryKeys.discussions.detail(id) });
    },
  });
};

export const useReportDiscussion = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      discussionsService.reportDiscussion(id, reason),
  });
};

export const useUpvoteDiscussion = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discussionsService.upvoteDiscussion(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.discussions.detail(id),
      });

      const previousDiscussion = queryClient.getQueryData(
        queryKeys.discussions.detail(id)
      );

      //OPTIMISTIC UPDATES
      queryClient.setQueryData(queryKeys.discussions.detail(id), (old: any) => {
        if (!old) return old;
        const userId = user?.id;

        // Copy current arrays and counts
        let newUpvotes = [...old.upvotes];
        let newUpvotesCount =
          typeof old.upvotesCount === "number"
            ? old.upvotesCount
            : old.upvotes.length;
        let newDownvotes = [...old.downvotes];
        let newDownvotesCount =
          typeof old.downvotesCount === "number"
            ? old.downvotesCount
            : old.downvotes.length;

        if (old.upvotes.includes(userId)) {
          // Toggle off upvote: remove user and decrement count.
          newUpvotes = old.upvotes.filter((id: string) => id !== userId);
          newUpvotesCount = newUpvotesCount - 1;
        } else {
          // Toggle on upvote: add user and increment count.
          newUpvotes = [...old.upvotes, userId];
          newUpvotesCount = newUpvotesCount + 1;
          // If the user had downvoted, remove that vote and decrement its count.
          if (old.downvotes.includes(userId)) {
            newDownvotes = old.downvotes.filter((id: string) => id !== userId);
            newDownvotesCount = newDownvotesCount - 1;
          }
        }

        return {
          ...old,
          upvotes: newUpvotes,
          upvotesCount: newUpvotesCount,
          downvotes: newDownvotes,
          downvotesCount: newDownvotesCount,
        };
      });

      return { previousDiscussion };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(
        queryKeys.discussions.detail(id),
        context?.previousDiscussion
      );
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.all,
      });
    },
  });
};

export const useDownvoteDiscussion = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discussionsService.downvoteDiscussion(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.discussions.detail(id),
      });
      const previousDiscussion = queryClient.getQueryData(
        queryKeys.discussions.detail(id)
      );
      queryClient.setQueryData(queryKeys.discussions.detail(id), (old: any) => {
        if (!old) return old;
        const userId = user?.id;

        // Copy current arrays and counts
        let newDownvotes = [...old.downvotes];
        let newDownvotesCount =
          typeof old.downvotesCount === "number"
            ? old.downvotesCount
            : old.downvotes.length;
        let newUpvotes = [...old.upvotes];
        let newUpvotesCount =
          typeof old.upvotesCount === "number"
            ? old.upvotesCount
            : old.upvotes.length;

        if (old.downvotes.includes(userId)) {
          // Toggle off downvote: remove user and decrement count.
          newDownvotes = old.downvotes.filter((id: string) => id !== userId);
          newDownvotesCount = newDownvotesCount - 1;
        } else {
          // Toggle on downvote: add user and increment count.
          newDownvotes = [...old.downvotes, userId];
          newDownvotesCount = newDownvotesCount + 1;
          // If the user had upvoted, remove that vote and decrement its count.
          if (old.upvotes.includes(userId)) {
            newUpvotes = old.upvotes.filter((id: string) => id !== userId);
            newUpvotesCount = newUpvotesCount - 1;
          }
        }

        return {
          ...old,
          downvotes: newDownvotes,
          downvotesCount: newDownvotesCount,
          upvotes: newUpvotes,
          upvotesCount: newUpvotesCount,
        };
      });
      return { previousDiscussion };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(
        queryKeys.discussions.detail(id),
        context?.previousDiscussion
      );
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.all,
      });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      content,
    }: {
      discussionId: string;
      content: string;
    }) => discussionsService.addComment(discussionId, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.detail(variables.discussionId),
      });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      commentId,
      content,
    }: {
      discussionId: string;
      commentId: string;
      content: string;
    }) => discussionsService.updateComment(discussionId, commentId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.detail(variables.discussionId),
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      commentId,
    }: {
      discussionId: string;
      commentId: string;
    }) => discussionsService.deleteComment(discussionId, commentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.detail(variables.discussionId),
      });
    },
  });
};

export const useReportComment = () => {
  return useMutation({
    mutationFn: ({
      discussionId,
      commentId,
      reason,
    }: {
      discussionId: string;
      commentId: string;
      reason: string;
    }) => discussionsService.reportComment(discussionId, commentId, reason),
  });
};

export const useUpvoteComment = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      commentId,
    }: {
      discussionId: string;
      commentId: string;
    }) => discussionsService.upvoteComment(discussionId, commentId),
    onMutate: async ({ discussionId, commentId }) => {
      const queryKey = queryKeys.discussions.detail(discussionId);
      await queryClient.cancelQueries({ queryKey });
      const previousDiscussion = queryClient.getQueryData(queryKey);

      // Optimistically update the comment upvotes and counts.
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const userId = user?.id;
        const newComments = old.comments.map((comment: any) => {
          if (comment._id === commentId) {
            // Get current vote arrays and counts.
            let newUpvotes = [...comment.upvotes];
            let newDownvotes = [...comment.downvotes];
            let newUpvotesCount =
              typeof comment.upvotesCount === "number"
                ? comment.upvotesCount
                : comment.upvotes.length;
            let newDownvotesCount =
              typeof comment.downvotesCount === "number"
                ? comment.downvotesCount
                : comment.downvotes.length;

            if (comment.upvotes.includes(userId)) {
              // Toggle off: remove upvote and decrement count.
              newUpvotes = comment.upvotes.filter(
                (uid: string) => uid !== userId
              );
              newUpvotesCount = newUpvotesCount - 1;
            } else {
              // Toggle on: add upvote and increment count.
              newUpvotes = [...comment.upvotes, userId];
              newUpvotesCount = newUpvotesCount + 1;
              // Remove conflicting downvote if present.
              if (comment.downvotes.includes(userId)) {
                newDownvotes = comment.downvotes.filter(
                  (uid: string) => uid !== userId
                );
                newDownvotesCount = newDownvotesCount - 1;
              }
            }
            return {
              ...comment,
              upvotes: newUpvotes,
              upvotesCount: newUpvotesCount,
              downvotes: newDownvotes,
              downvotesCount: newDownvotesCount,
            };
          }
          return comment;
        });
        return { ...old, comments: newComments };
      });

      return { previousDiscussion };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        queryKeys.discussions.detail(variables.discussionId),
        context?.previousDiscussion
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.detail(variables.discussionId),
      });
    },
  });
};

export const useDownvoteComment = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      commentId,
    }: {
      discussionId: string;
      commentId: string;
    }) => discussionsService.downvoteComment(discussionId, commentId),
    onMutate: async ({ discussionId, commentId }) => {
      const queryKey = queryKeys.discussions.detail(discussionId);
      await queryClient.cancelQueries({ queryKey });
      const previousDiscussion = queryClient.getQueryData(queryKey);

      // Optimistically update the comment downvotes and counts.
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const userId = user?.id;
        const newComments = old.comments.map((comment: any) => {
          if (comment._id === commentId) {
            let newDownvotes = [...comment.downvotes];
            let newUpvotes = [...comment.upvotes];
            let newDownvotesCount =
              typeof comment.downvotesCount === "number"
                ? comment.downvotesCount
                : comment.downvotes.length;
            let newUpvotesCount =
              typeof comment.upvotesCount === "number"
                ? comment.upvotesCount
                : comment.upvotes.length;

            if (comment.downvotes.includes(userId)) {
              // Toggle off: remove downvote and decrement count.
              newDownvotes = comment.downvotes.filter(
                (uid: string) => uid !== userId
              );
              newDownvotesCount = newDownvotesCount - 1;
            } else {
              // Toggle on: add downvote and increment count.
              newDownvotes = [...comment.downvotes, userId];
              newDownvotesCount = newDownvotesCount + 1;
              // Remove conflicting upvote if present.
              if (comment.upvotes.includes(userId)) {
                newUpvotes = comment.upvotes.filter(
                  (uid: string) => uid !== userId
                );
                newUpvotesCount = newUpvotesCount - 1;
              }
            }
            return {
              ...comment,
              downvotes: newDownvotes,
              downvotesCount: newDownvotesCount,
              upvotes: newUpvotes,
              upvotesCount: newUpvotesCount,
            };
          }
          return comment;
        });
        return { ...old, comments: newComments };
      });

      return { previousDiscussion };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        queryKeys.discussions.detail(variables.discussionId),
        context?.previousDiscussion
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.detail(variables.discussionId),
      });
    },
  });
};

export const useMarkAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      commentId,
    }: {
      discussionId: string;
      commentId: string;
    }) => discussionsService.markAnswer(discussionId, commentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.detail(variables.discussionId),
      });
    },
  });
};

export const useUnmarkAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      commentId,
    }: {
      discussionId: string;
      commentId: string;
    }) => discussionsService.unmarkAnswer(discussionId, commentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.discussions.detail(variables.discussionId),
      });
    },
  });
};
