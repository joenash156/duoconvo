export type IntentDto = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateIntentInput = {
  name: string;
  description?: string;
};

export type UpdateIntentInput = Partial<CreateIntentInput>;
