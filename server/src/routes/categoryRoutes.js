import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  listCategories,
  addCategory,
  editCategory,
  removeCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/")
  .get(asyncHandler(listCategories))
  .post(asyncHandler(addCategory));

router.route("/:id")
  .patch(asyncHandler(editCategory))
  .delete(asyncHandler(removeCategory));

export default router;