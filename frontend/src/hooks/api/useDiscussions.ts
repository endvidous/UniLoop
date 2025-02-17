import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discussionsService } from "@/src/services/api/discussionAPI";
import { queryKeys } from "../../services/api/queryKeys";
import { useAuth } from "@/src/context/AuthContext";

const { user } = useAuth();

export const useDiscussions = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.discussions.list(filters),
    queryFn: () => discussionsService.getDiscussions(filters),
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

export const useUpvoteDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discussionsService.upvoteDiscussion(id),
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches for this discussion.
      await queryClient.cancelQueries({
        queryKey: queryKeys.discussions.detail(id),
      });

      // Snapshot of the previous value.
      const previousDiscussion = queryClient.getQueryData(
        queryKeys.discussions.detail(id)
      );

      // Optimistically update the discussion data.
      queryClient.setQueryData(queryKeys.discussions.detail(id), (old: any) => {
        if (!old) return old;
        const userId = user?.id; // Replace with the actual user id
        let newUpvotes;
        if (old.upvotes.includes(userId)) {
          // Remove the vote
          newUpvotes = old.upvotes.filter((id: string) => id !== userId);
        } else {
          // Add the vote
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
        queryKey: queryKeys.discussions.detail(id),
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

export const useUpvoteComment = () => {
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

      // Optimistically update the comment's upvotes.
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const userId = "optimistic-user-id"; // Replace with actual user id
        const newComments = old.comments.map((comment: any) => {
          if (comment._id === commentId) {
            let newUpvotes;
            if (comment.upvotes.includes(userId)) {
              newUpvotes = comment.upvotes.filter(
                (id: string) => id !== userId
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
