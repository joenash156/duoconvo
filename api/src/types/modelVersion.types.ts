export type ModelVersionDto = {
  id: string;
  modelName: string;
  datasetVersion: string | null;
  trainingDate: string | null;
  accuracy: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CreateModelVersionInput = {
  modelName: string;
  datasetVersion?: string;
  trainingDate?: string;
  accuracy?: number;
  notes?: string;
  isActive?: boolean;
};
