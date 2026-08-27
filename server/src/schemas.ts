import { z } from 'zod';

export const advisoryRequestSchema = z.object({
  farm_id: z.string().uuid(),
  crop: z.string().min(1),
  crop_variety: z.string().optional().nullable(),
  season: z.string().min(1),
  growth_stage: z.string().min(1),
  farming_objective: z.string().min(1),
  soil_type: z.string().optional().nullable(),
  soil_ph: z.number().min(0).max(14).optional().nullable(),
  irrigation_available: z.boolean().optional(),
  water_source: z.string().optional().nullable(),
  weather_summary: z.string().optional().nullable(),
  observed_symptoms: z.string().optional().nullable(),
  pest_observations: z.string().optional().nullable(),
  disease_observations: z.string().optional().nullable(),
  additional_notes: z.string().optional().nullable(),
});
