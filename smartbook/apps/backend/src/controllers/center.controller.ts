import { Request, Response } from 'express';
import { z } from 'zod';

import * as CenterService from '../services/center.service.js';

const CreateCenterSchema = z.object({
  center: z.object({
    name: z.string().min(1),
    address: z.string().min(1).optional().nullable(),
    phone: z.string().min(1).optional().nullable(),
    description: z.string().min(1).optional().nullable(),
    logoDataUrl: z.string().min(1).optional().nullable(),
  }),
  owner: z.object({
    fullName: z.string().min(1).optional().nullable(),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  services: z
    .array(
      z.object({
        categoryName: z.string().min(1),
        courseName: z.string().min(1),
        bookingType: z.enum(['group', 'individual']),
        price: z.number().int().nonnegative(),
        groupCapacity: z.number().int().positive().optional().nullable(),
        description: z.string().optional().nullable(),
        teacherName: z.string().optional().nullable(),
      })
    )
    .min(1),
  schedule: z
    .object({
      workStart: z.string().min(1).optional().nullable(),
      workEnd: z.string().min(1).optional().nullable(),
      consultationIntervalMinutes: z.number().int().positive().optional().nullable(),
      consultationPrice: z.number().int().nonnegative().optional().nullable(),
      defaultGroupLimit: z.number().int().positive().optional().nullable(),
      bookingWindowWeeks: z.number().int().positive().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export const create = async (req: Request, res: Response) => {
  try {
    const parsed = CreateCenterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const result = await CenterService.createCenter(parsed.data as CenterService.CreateCenterInput);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};
