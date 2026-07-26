import { useInfiniteQuery } from "@tanstack/react-query";
import { translationService } from "@/services/translationService";

export function useConversationHistory() {
  return useInfiniteQuery({
    queryKey: ["conversation-history"],
    queryFn: ({ pageParam }) => translationService.getHistory(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}
