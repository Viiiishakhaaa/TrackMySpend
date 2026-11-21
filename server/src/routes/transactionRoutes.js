import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

// Every transaction route requires authentication.
router.use(authMiddleware);

router.route("/")
  .get(asyncHandler(getTransactions))
  .post(asyncHandler(createTransaction));

router.route("/:id")
  .get(asyncHandler(getTransactionById))
  .patch(asyncHandler(updateTransaction))
  .delete(asyncHandler(deleteTransaction));

export default router;