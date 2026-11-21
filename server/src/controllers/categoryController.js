import { z } from "zod";
import ApiError from "../utils/ApiError.js";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService.js";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().max(30).nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().max(30).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one field to update",
});

export const listCategories = async (req, res) => {
  const type = req.query.type;

  if (type && !["INCOME", "EXPENSE"].includes(type)) {
    throw new ApiError(400, "Invalid category type");
  }

  const categories = await getCategories(req.user.id, type);

  res.status(200).json({
    success: true,
    data: { categories },
  });
};

export const addCategory = async (req, res) => {
  const result = categorySchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      "Invalid category details",
      result.error.issues
    );
  }

  const category = await createCategory(req.user.id, result.data);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category },
  });
};

export const editCategory = async (req, res) => {
  const result = updateSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      "Invalid category details",
      result.error.issues
    );
  }

  const category = await updateCategory(
    req.user.id,
    req.params.id,
    result.data
  );

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: { category },
  });
};

export const removeCategory = async (req, res) => {
  await deleteCategory(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
};