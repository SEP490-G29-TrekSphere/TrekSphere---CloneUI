import * as z from 'zod';

export const systemSettingsSchema = z
  .object({
    maxRainfall: z.number({
      error: 'Threshold values out of acceptable range',
    }),
    maxWindSpeed: z.number({
      error: 'Threshold values out of acceptable range',
    }),
    minTemperature: z.number({
      error: 'Threshold values out of acceptable range',
    }),
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    backupInterval: z.string(),
    require2fa: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.maxRainfall < 0 || data.maxRainfall > 500) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Threshold values out of acceptable range',
        path: ['maxRainfall'],
      });
    }
    if (data.maxWindSpeed < 0 || data.maxWindSpeed > 200) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Threshold values out of acceptable range',
        path: ['maxWindSpeed'],
      });
    }
    if (data.minTemperature < -50 || data.minTemperature > 60) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Threshold values out of acceptable range',
        path: ['minTemperature'],
      });
    }
  });

export type SystemSettingsFormValues = z.infer<typeof systemSettingsSchema>;
