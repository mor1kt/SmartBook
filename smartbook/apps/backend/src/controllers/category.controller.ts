// controllers/category.controller.ts
import { Request, Response } from 'express';
import * as CategoryService from '../services/category.service.js';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const centerId = (req as any).centerId; // Достаем из middleware

    const categories = await CategoryService.getCategories(centerId);

    res.json(categories);
  } catch (error: any) {
    console.error('Category Controller Error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const centerId = (req as any).centerId; // Берем из middleware

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const newCategory = await CategoryService.createCategory(name, centerId);

    res.status(201).json(newCategory);
  } catch (error: any) {
    console.error('Create Category Error:', error);
    res.status(500).json({ error: error.message });
  }
};
