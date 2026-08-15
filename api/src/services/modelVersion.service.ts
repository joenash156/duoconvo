import { ModelVersion } from "../db/schema";
import { modelVersionRepository } from "../repositories/modelVersion.repository";
import { CreateModelVersionInput, ModelVersionDto } from "../types/modelVersion.types";
import { ApiError } from "../utils/ApiError";

function toDto(version: ModelVersion): ModelVersionDto {
  return {
    id: version.id,
    modelName: version.modelName,
    datasetVersion: version.datasetVersion,
    trainingDate: version.trainingDate ? version.trainingDate.toISOString() : null,
    accuracy: version.accuracy,
    notes: version.notes,
    isActive: version.isActive,
    createdAt: version.createdAt.toISOString(),
  };
}

export const modelVersionService = {
  list: async (): Promise<ModelVersionDto[]> => {
    const versions = await modelVersionRepository.findAll();
    return versions.map(toDto);
  },

  getActive: async (): Promise<ModelVersionDto | null> => {
    const active = await modelVersionRepository.findActive();
    return active ? toDto(active) : null;
  },

  create: async (input: CreateModelVersionInput): Promise<ModelVersionDto> => {
    const created = await modelVersionRepository.create({
      ...input,
      trainingDate: input.trainingDate ? new Date(input.trainingDate) : undefined,
    });
    if (!created) throw new ApiError(500, "Failed to create model version");
    return toDto(created);
  },
};
