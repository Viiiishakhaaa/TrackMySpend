import prisma from "../config/prisma.js";

export const getDashboardSummary = async (userId) => {
  const now = new Date();

  const currentMonthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const nextMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  // Start of the month six months ago.
  const chartStart = new Date(
    now.getFullYear(),
    now.getMonth() - 5,
    1
  );

  // Fetch the user's account and financial data.
  const [
    user,
    allIncome,
    allExpenses,
    monthlyIncome,
    monthlyExpenses,
    chartTransactions,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        initialBalance: true,
        currency: true,
      },
    }),

    prisma.transaction.aggregate({
      where: {
        userId,
        type: "INCOME",
      },
      _sum: { amount: true },
    }),

    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
      },
      _sum: { amount: true },
    }),

    prisma.transaction.aggregate({
      where: {
        userId,
        type: "INCOME",
        transactionDate: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
      _sum: { amount: true },
    }),

    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        transactionDate: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
      _sum: { amount: true },
    }),

    prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: chartStart,
          lt: nextMonthStart,
        },
      },
      select: {
        amount: true,
        type: true,
        transactionDate: true,
      },
      orderBy: {
        transactionDate: "asc",
      },
    }),

    prisma.transaction.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: "desc",
      },
      take: 5,
    }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  const initialBalance = Number(user.initialBalance);
  const totalIncome = Number(allIncome._sum.amount || 0);
  const totalExpenses = Number(allExpenses._sum.amount || 0);

  const thisMonthIncome = Number(monthlyIncome._sum.amount || 0);
  const thisMonthExpenses = Number(monthlyExpenses._sum.amount || 0);

  const balance = initialBalance + totalIncome - totalExpenses;
  const savings = thisMonthIncome - thisMonthExpenses;

  // Prepare six months of chart data.
  const monthlyData = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    monthlyData.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: date.toLocaleString("en-IN", {
        month: "short",
      }),
      income: 0,
      expenses: 0,
    });
  }

  for (const transaction of chartTransactions) {
    const date = new Date(transaction.transactionDate);

    const key = `${date.getFullYear()}-${date.getMonth()}`;

    const month = monthlyData.find((item) => item.key === key);

    if (!month) continue;

    const amount = Number(transaction.amount);

    if (transaction.type === "INCOME") {
      month.income += amount;
    } else {
      month.expenses += amount;
    }
  }

  const cashFlow = monthlyData.map((month) => ({
    month: month.month,
    income: month.income,
    expenses: month.expenses,
  }));

  return {
    currency: user.currency,

    overview: {
      balance,
      totalIncome,
      totalExpenses,
      savings,

      thisMonthIncome,
      thisMonthExpenses,
    },

    cashFlow,

    recentTransactions,
  };
};