import { Intent } from "../db/schema";
import { intentRepository } from "../repositories/intent.repository";
import { CreateIntentInput, IntentDto, UpdateIntentInput } from "../types/intent.types";
import { ApiError } from "../utils/ApiError";

function toDto(intent: Intent): IntentDto {
  return {
    id: intent.id,
    name: intent.name,
    description: intent.description,
    createdAt: intent.createdAt.toISOString(),
    updatedAt: intent.updatedAt.toISOString(),
  };
}

export const intentService = {
  list: async (): Promise<IntentDto[]> => {
    const intents = await intentRepository.findAll();
    return intents.map(toDto);
  },

  getById: async (id: string): Promise<IntentDto> => {
    const intent = await intentRepository.findById(id);
    if (!intent) throw new ApiError(404, `Intent ${id} not found`);
    return toDto(intent);
  },

  create: async (input: CreateIntentInput): Promise<IntentDto> => {
    const existing = await intentRepository.findByName(input.name);
    if (existing) throw new ApiError(409, `Intent "${input.name}" already exists`);

    const created = await intentRepository.create(input);
    if (!created) throw new ApiError(500, "Failed to create intent");
    return toDto(created);
  },

  update: async (id: string, input: UpdateIntentInput): Promise<IntentDto> => {
    await intentService.getById(id);
    const updated = await intentRepository.update(id, input);
    if (!updated) throw new ApiError(500, "Failed to update intent");
    return toDto(updated);
  },

  remove: async (id: string): Promise<void> => {
    await intentService.getById(id);
    await intentRepository.remove(id);
  },
};
