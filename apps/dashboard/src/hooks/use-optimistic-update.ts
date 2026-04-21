"use client";

import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook for optimistic updates that immediately update the UI
 * and rollback on error
 */
export function useOptimisticUpdate<TData, TVariables, TError = Error>(
  queryKey: QueryKey,
  mutationFn: (variables: TVariables) => Promise<TData>,
  optimisticUpdate: (
    oldData: TData | undefined,
    variables: TVariables,
  ) => TData,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
  },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update
      queryClient.setQueryData<TData>(queryKey, (old) =>
        optimisticUpdate(old, variables),
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      options?.onError?.(err as TError, variables);
    },
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
