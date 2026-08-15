import { z } from "zod";

export const createModelVersionSchema = z.object({
  modelName: z.string().trim().min(1).max(150),
  datasetVersion: z.string().trim().optional(),
  trainingDate: z.iso.datetime().optional(),
  accuracy: z.number().min(0).max(1).optional(),
  notes: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});
