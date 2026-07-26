import { useMutation } from "@tanstack/react-query";
import { translationService } from "@/services/translationService";

export function useTranslateText() {
  return useMutation({
    mutationFn: translationService.translateText,
  });
}

export function useTranslateAudio() {
  return useMutation({
    mutationFn: translationService.translateAudio,
  });
}
