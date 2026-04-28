// controllers/waitlist.controller.ts
import { Request, Response } from 'express';
import * as WaitlistService from '../services/waitlist.service.js';

export const addToWaitlist = async (req: Request, res: Response) => {
  try {
    const { course_id, student_name, student_phone, message } = req.body;
    const centerId = (req as any).centerId;

    // Простая валидация
    if (!course_id || !student_name || !student_phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const entry = await WaitlistService.addToWaitlist({
      centerId,
      course_id,
      student_name,
      student_phone,
      message: message || '' // Сообщение опционально
    });

    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Waitlist Controller Error:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
};

export const getWaitlist = async (req: Request, res: Response) => {
  try {
    const centerId = (req as any).centerId;
    const entries = await WaitlistService.getWaitlist(centerId);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const centerId = (req as any).centerId;
    const { id } = req.params as any;
    const status = req.body?.status;

    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (status !== 'waiting' && status !== 'processed') {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await WaitlistService.updateWaitlistStatus(id, status, centerId);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};
