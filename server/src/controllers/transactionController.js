import { z } from "zod";

import ApiError from "../utils/ApiError.js";

import {
  createTransaction as createTransactionService,
  getTransactions as getTransactionsService,
  getTransactionById as getTransactionByIdService,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
} from "../services/transactionService.js";

const transactionSchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  transactionDate: z.coerce.date().optional(),
});

const updateTransactionSchema = transactionSchema.partial();

const validate = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError(
      400,
      "Invalid transaction details",
      result.error.issues
    );
  }

  return result.data;
};

export const createTransaction = async (req, res) => {
  const data = validate(transactionSchema, req.body);

  const transaction = await createTransactionService(
    req.user.id,
    data
  );

  res.status(201).json({
    success: true,
    message: "Transaction created successfully",
    data: { transaction },
  });
};

export const getTransactions = async (req, res) => {
  const { type, startDate, endDate, page, limit } = req.query;

  if (type && !["INCOME", "EXPENSE"].includes(type)) {
    throw new ApiError(400, "Invalid transaction type");
  }

  const filters = { type, startDate, endDate, page, limit };

  if (
    (startDate && Number.isNaN(Date.parse(startDate))) ||
    (endDate && Number.isNaN(Date.parse(endDate)))
  ) {
    throw new ApiError(400, "Invalid date filter");
  }

  if (
    startDate &&
    endDate &&
    new Date(startDate) > new Date(endDate)
  ) {
    throw new ApiError(400, "Start date cannot be after end date");
  }

  const result = await getTransactionsService(req.user.id, filters);

  res.status(200).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
};

export const getTransactionById = async (req, res) => {
  const transaction = await getTransactionByIdService(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Transaction fetched successfully",
    data: { transaction },
  });
};

export const updateTransaction = async (req, res) => {
  const data = validate(updateTransactionSchema, req.body);

  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "Provide at least one field to update");
  }

  const transaction = await updateTransactionService(
    req.user.id,
    req.params.id,
    data
  );

  res.status(200).json({
    success: true,
    message: "Transaction updated successfully",
    data: { transaction },
  });
};

export const deleteTransaction = async (req, res) => {
  await deleteTransactionService(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Transaction deleted successfully",
  });
};