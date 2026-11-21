import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getCategories = async (userId, type) => {
  return prisma.category.findMany({
    where: {
      userId,
      ...(type && { type }),
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const createCategory = async (userId, data) => {
  try {
    return await prisma.category.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        icon: data.icon || null,
        color: data.color || null,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new ApiError(
        409,
        "A category with this name and type already exists"
      );
    }

    throw error;
  }
};

export const updateCategory = async (userId, categoryId, data) => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  try {
    return await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color !== undefined && { color: data.color }),
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new ApiError(409, "This category name already exists");
    }

    throw error;
  }
};

export const deleteCategory = async (userId, categoryId) => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return true;
};