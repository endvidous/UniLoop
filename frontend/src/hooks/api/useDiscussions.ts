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
      // Cancel any outgoing refetches for this discussion.
      await queryClient.cancelQueries({
        queryKey: queryKeys.discussions.detail(id),
      });

      // Snapshot the previous discussion data.
      const previousDiscussion = queryClient.getQueryData(
        queryKeys.discussions.detail(id)
      );

      // Optimistically update the upvotes.
      queryClient.setQueryData(queryKeys.discussions.detail(id), (old: any) => {
        if (!old) return old;
        const userId = user?.id;
        let newUpvotes;
        if (old.upvotes.includes(userId)) {
          // Toggle off: remove the upvote.
          newUpvotes = old.upvotes.filter((id: string) => id !== userId);
        } else {
          // Toggle on: add the upvote.
          newUpvotes = [...old.upvotes, userId];
        }
        return { ...old, upvotes: newUpvotes };
      });

      return { previousDiscussion };
    },
    onError: (err, id, context) => {
      // Roll back on error.
      queryClient.setQueryData(
        queryKeys.discussions.detail(id),
        context?.previousDiscussion
      );
    },
    onSettled: (data, error, id) => {
      // Invalidate to ensure fresh data.
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
      // Optimistically update the downvotes.
      queryClient.setQueryData(queryKeys.discussions.detail(id), (old: any) => {
        if (!old) return old;
        const userId = user?.id;
        let newDownvotes;
        if (old.downvotes.includes(userId)) {
          // Toggle off: remove the downvote.
          newDownvotes = old.downvotes.filter((id: string) => id !== userId);
        } else {
          // Toggle on: add the downvote.
          newDownvotes = [...old.downvotes, userId];
        }
        return { ...old, downvotes: newDownvotes };
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

export const useUpvoteComment = (user: User) => {
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

      // Optimistically update the comment upvotes.
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const userId = user?.id;
        const newComments = old.comments.map((comment: any) => {
          if (comment._id === commentId) {
            let newUpvotes;
            if (comment.upvotes.includes(userId)) {
              newUpvotes = comment.upvotes.filter(
                (uid: string) => uid !== userId
              );
            } else {
              newUpvotes = [...comment.upvotes, userId];
            }
            return { ...comment, upvotes: newUpvotes };
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

export const useDownvoteComment = (user: User) => {
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

      // Optimistically update the comment downvotes.
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const userId = user?.id;
        const newComments = old.comments.map((comment: any) => {
          if (comment._id === commentId) {
            let newDownvotes;
            if (comment.downvotes.includes(userId)) {
              newDownvotes = comment.downvotes.filter(
                (uid: string) => uid !== userId
              );
            } else {
              newDownvotes = [...comment.downvotes, userId];
            }
            return { ...comment, downvotes: newDownvotes };
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
