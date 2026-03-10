import { z } from "zod";

const stepStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]);

export const updateStepStatusSchema = z.object({
  status: stepStatusEnum,
});

export type UpdateStepStatusInput = z.infer<typeof updateStepStatusSchema>;
