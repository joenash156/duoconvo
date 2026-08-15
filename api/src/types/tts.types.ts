export type TtsRequestInput = {
  text: string;
  language: string;
};

export type TtsResponse = {
  audioUrl: string | null;
  language: string;
  message?: string;
};
