import { z } from "zod";

export const alertsInputSchema = z.object({
  state: z
    .string()
    .regex(/^[A-Za-z]{2}$/)
    .describe("Two-letter state code (e.g. CA, NY)"),
});

export const forecastInputSchema = z.object({
  latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .describe("Longitude of the location"),
});

export type AlertsInput = z.infer<typeof alertsInputSchema>;
export type ForecastInput = z.infer<typeof forecastInputSchema>;
