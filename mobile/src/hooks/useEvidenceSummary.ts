import { useQuery } from "@tanstack/react-query";
import { translationService } from "@/services/translationService";

export function useEvidenceSummary() {
  return useQuery({
    queryKey: ["ai-evidence-summary"],
    queryFn: () => translationService.getEvidenceSummary(),
  });
}
