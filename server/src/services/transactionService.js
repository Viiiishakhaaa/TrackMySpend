import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

const validateCategory = async (categoryId, userId, type) => {
  if (!categoryId) return;

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      type,
    },
  });

  if (!category) {
    throw new ApiError(
      400,
      "Invalid category or category does not match transaction type"
    );
  }
};

export const createTransaction = async (userId, data) => {
  await validateCategory(data.categoryId, userId, data.type);

  return prisma.transaction.create({
    data: {
      userId,
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId || null,
      description: data.description || null,
      transactionDate: data.transactionDate || new Date(),
      source: "MANUAL",
    },
    include: {
      category: true,
    },
  });
};

export const getTransactions = async (userId, filters = {}) => {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));

  const where = {
    userId,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.startDate || filters.endDate) {
    where.transactionDate = {};

    if (filters.startDate) {
      where.transactionDate.gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      where.transactionDate.lte = new Date(filters.endDate);
    }
  }

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTransactionById = async (userId, transactionId) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: {
      category: true,
    },
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return transaction;
};

export const updateTransaction = async (
  userId,
  transactionId,
  data
) => {
  const existing = await getTransactionById(userId, transactionId);

  const updatedType = data.type || existing.type;
  const updatedCategoryId =
    data.categoryId === undefined
      ? existing.categoryId
      : data.categoryId;

  await validateCategory(updatedCategoryId, userId, updatedType);

  return prisma.transaction.update({
    where: {
      id: transactionId,
    },
    data: {
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.categoryId !== undefined && {
        categoryId: data.categoryId,
      }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.transactionDate !== undefined && {
        transactionDate: data.transactionDate,
      }),
    },
    include: {
      category: true,
    },
  });
};

export const deleteTransaction = async (userId, transactionId) => {
  await getTransactionById(userId, transactionId);

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  return true;
};