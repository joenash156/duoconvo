import { useInfiniteQuery } from "@tanstack/react-query";
import { translationService } from "@/services/translationService";

export function useAiEvidence() {
  return useInfiniteQuery({
    queryKey: ["ai-evidence"],
    queryFn: ({ pageParam }) => translationService.getAiEvidence(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}
