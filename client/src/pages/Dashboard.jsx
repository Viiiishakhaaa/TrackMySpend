import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  BrainCircuit,
  Settings,
  Bell,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Coffee,
  ShoppingBag,
  Car,
  Utensils,
  MoreHorizontal,
  LogOut,
  RefreshCw,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const menu = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Transactions", icon: ArrowLeftRight },
  { label: "Budgets", icon: Wallet },
  { label: "Savings Goals", icon: Target },
  { label: "Athena AI", icon: BrainCircuit },
  {label: "Categories",icon:Wallet},
];

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName = user?.name || "My Account";
  const firstName = userName.split(" ")[0];
  const initial = userName.charAt(0).toUpperCase();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Format amounts using the user's currency.
  const formatMoney = (amount) => {
    const currency = dashboardData?.currency || "INR";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  // Fetch real dashboard data from the backend.
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard");

      setDashboardData(response.data.data);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your financial data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleNavigation = (label) => {
  if (label === "Dashboard") {
    navigate("/dashboard");
  } else if (label === "Transactions") {
    navigate("/transactions");
  } else if (label === "Categories") {
    navigate("/categories");
  } else if (label === "Budgets") {
    navigate("/budgets");
  } else if (label === "Savings Goals") {
    navigate("/savings-goals");
  } else if (label === "Athena AI") {
    navigate("/athena");
  }
};

  const overview = dashboardData?.overview || {};

  const balance = Number(overview.balance || 0);
  const income = Number(overview.totalIncome || 0);
  const expenses = Number(overview.totalExpenses || 0);
  const savings = Number(overview.savings || 0);

  const thisMonthIncome = Number(overview.thisMonthIncome || 0);
  const thisMonthExpenses = Number(overview.thisMonthExpenses || 0);

  const savingsRate =
    thisMonthIncome > 0
      ? (savings / thisMonthIncome) * 100
      : 0;

  const cashFlow = dashboardData?.cashFlow || [];

  const recentTransactions =
    dashboardData?.recentTransactions || [];

  const getTransactionIcon = (categoryName, type) => {
    if (type === "INCOME") return Wallet;

    const category = (categoryName || "").toLowerCase();

    if (
      category.includes("food") ||
      category.includes("grocery")
    ) {
      return ShoppingBag;
    }

    if (
      category.includes("transport") ||
      category.includes("travel")
    ) {
      return Car;
    }

    if (
      category.includes("coffee") ||
      category.includes("restaurant")
    ) {
      return Coffee;
    }

    if (category.includes("dining")) {
      return Utensils;
    }

    return Wallet;
  };

  const formatTransactionDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Wallet size={23} />
          </div>

          <div>
            <h2>TrackMySpend</h2>
            <span>THE WISDOM OF ATHENA</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {menu.map((item, index) => (
            <div
              key={item.label}
              className={`nav-item ${
                index === 0 ? "active" : ""
              }`}
              onClick={() => handleNavigation(item.label)}
              style={{ cursor: "pointer" }}
            >
              <item.icon size={19} />

              <span>{item.label}</span>

              {item.label === "Athena AI" && (
                <span className="new-tag">AI</span>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </div>

          <div className="profile">
            <div className="avatar">{initial}</div>

            <div className="profile-info">
              <strong>{userName}</strong>
              <span>Personal Workspace</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                padding: "8px",
              }}
            >
              <LogOut size={19} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Pages / <strong>Dashboard</strong>
          </div>

          <div className="top-actions">
            <div className="search-box">
              <Search size={17} />
              <span>Search anything...</span>
              <kbd>⌘ K</kbd>
            </div>

            <button className="icon-button">
              <Bell size={19} />
            </button>

            <div className="top-avatar">{initial}</div>
          </div>
        </header>

        <section className="dashboard">
          {/* WELCOME */}
          <div className="welcome-row">
            <div>
              <p className="eyebrow">
                {today.toUpperCase()}
              </p>

              <h1>
                Good evening, {firstName}! <span>✦</span>
              </h1>

              <p className="subtitle">
                Here's what's happening with your finances today.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="icon-button"
                onClick={fetchDashboard}
                title="Refresh dashboard"
                disabled={loading}
              >
                <RefreshCw
                  size={18}
                  className={loading ? "spin" : ""}
                />
              </button>

              <button
                className="primary-button"
                onClick={() => navigate("/transactions")}
              >
                <Plus size={18} />
                Add Transaction
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div
              style={{
                padding: "14px 18px",
                marginBottom: "20px",
                borderRadius: "10px",
                background: "#fff0f0",
                color: "#c0392b",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span>{error}</span>

              <button
                onClick={fetchDashboard}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* FINANCIAL OVERVIEW */}
          <div className="section-heading">
            <div>
              <h3>Financial Overview</h3>
              <p>Your financial snapshot at a glance</p>
            </div>

            <button className="period-button">
              This Month⌄
            </button>
          </div>

          <div className="stats-grid">
            {/* BALANCE */}
            <div className="stat-card balance-card">
              <div className="stat-top">
                <span>Total Balance</span>

                <div className="stat-icon violet">
                  <Wallet size={19} />
                </div>
              </div>

              <h2>
                {loading ? "Loading..." : formatMoney(balance)}
              </h2>

              <div className="stat-footer">
                <TrendingUp size={15} />
                Your available balance
              </div>
            </div>

            {/* INCOME */}
            <div className="stat-card">
              <div className="stat-top">
                <span>Total Income</span>

                <div className="stat-icon green">
                  <ArrowDownRight size={19} />
                </div>
              </div>

              <h2>
                {loading ? "Loading..." : formatMoney(income)}
              </h2>

              <div className="stat-footer positive">
                <TrendingUp size={15} />
                All-time income
              </div>
            </div>

            {/* EXPENSES */}
            <div className="stat-card">
              <div className="stat-top">
                <span>Total Expenses</span>

                <div className="stat-icon orange">
                  <ArrowUpRight size={19} />
                </div>
              </div>

              <h2>
                {loading ? "Loading..." : formatMoney(expenses)}
              </h2>

              <div className="stat-footer negative">
                <TrendingDown size={15} />
                All-time expenses
              </div>
            </div>

            {/* SAVINGS */}
            <div className="stat-card">
              <div className="stat-top">
                <span>This Month's Savings</span>

                <div className="stat-icon blue">
                  <Target size={19} />
                </div>
              </div>

              <h2>
                {loading ? "Loading..." : formatMoney(savings)}
              </h2>

              <div
                className={`stat-footer ${
                  savings >= 0 ? "positive" : "negative"
                }`}
              >
                {savings >= 0 ? (
                  <TrendingUp size={15} />
                ) : (
                  <TrendingDown size={15} />
                )}

                {loading
                  ? "Calculating..."
                  : `${savingsRate.toFixed(1)}% of monthly income`}
              </div>
            </div>
          </div>

          {/* MONTHLY DETAILS */}
          <div className="section-heading" style={{ marginTop: "28px" }}>
            <div>
              <h3>Monthly Performance</h3>
              <p>Your income and expenses this month</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>This Month's Income</span>
                <div className="stat-icon green">
                  <TrendingUp size={19} />
                </div>
              </div>

              <h2>
                {loading
                  ? "Loading..."
                  : formatMoney(thisMonthIncome)}
              </h2>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>This Month's Expenses</span>
                <div className="stat-icon orange">
                  <TrendingDown size={19} />
                </div>
              </div>

              <h2>
                {loading
                  ? "Loading..."
                  : formatMoney(thisMonthExpenses)}
              </h2>
            </div>
          </div>

          {/* CHART AND ATHENA */}
          <div className="content-grid">
            <section className="panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h3>Cash Flow</h3>
                  <p>Income vs expenses over the last six months</p>
                </div>

                <button className="dots-button">
                  <MoreHorizontal size={21} />
                </button>
              </div>

              <div className="chart-legend">
                <span>
                  <i className="legend-dot income-dot" />
                  Income
                </span>

                <span>
                  <i className="legend-dot expense-dot" />
                  Expenses
                </span>
              </div>

              <div className="chart-container">
                {loading ? (
                  <p style={{ textAlign: "center", padding: "50px" }}>
                    Loading cash flow...
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlow}>
                      <defs>
                        <linearGradient
                          id="incomeGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#8065df"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8065df"
                            stopOpacity={0}
                          />
                        </linearGradient>

                        <linearGradient
                          id="expenseGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#22b58a"
                            stopOpacity={0.16}
                          />
                          <stop
                            offset="95%"
                            stopColor="#22b58a"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#ececf2"
                      />

                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9292a3", fontSize: 12 }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9292a3", fontSize: 11 }}
                        tickFormatter={(v) => `₹${v / 1000}k`}
                      />

                      <Tooltip
                        formatter={(value) => formatMoney(value)}
                      />

                      <Area
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#8065df"
                        strokeWidth={2.5}
                        fill="url(#incomeGradient)"
                      />

                      <Area
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#22b58a"
                        strokeWidth={2.5}
                        fill="url(#expenseGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            {/* ATHENA INTELLIGENCE */}
            <section className="panel insight-panel">
              <div className="athena-heading">
                <div className="athena-icon">
                  <BrainCircuit size={22} />
                </div>

                <span>ATHENA INTELLIGENCE</span>
              </div>

              <h3>Your financial pulse</h3>

              <p className="insight-description">
                {loading
                  ? "Analysing your financial activity..."
                  : savings >= 0
                    ? "You're keeping your monthly expenses within your income. Keep building your savings!"
                    : "Your expenses currently exceed your income this month. Review your spending to get back on track."}
              </p>

              <div className="insight-metric">
                <div>
                  <span>Saving rate</span>

                  <strong>
                    {loading ? "--" : `${savingsRate.toFixed(1)}%`}
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        Math.max(savingsRate, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="insight-tip">
                <span>✦</span>

                <p>
                  {savings >= 0
                    ? "Consistency is key. Keep tracking your spending and working towards your financial goals."
                    : "Try reviewing your largest expense categories to identify potential savings."}
                </p>
              </div>

              <button
                className="insight-button"
                onClick={() => navigate("/transactions")}
              >
                Explore Transactions <ArrowUpRight size={16} />
              </button>
            </section>
          </div>

          {/* RECENT TRANSACTIONS */}
          <section className="panel transactions-panel">
            <div className="panel-heading">
              <div>
                <h3>Recent Transactions</h3>
                <p>Your latest financial activity</p>
              </div>

              <button
                className="view-all"
                onClick={() => navigate("/transactions")}
              >
                View all <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="transaction-list">
              {loading ? (
                <p style={{ padding: "20px" }}>
                  Loading transactions...
                </p>
              ) : recentTransactions.length === 0 ? (
                <div style={{ padding: "25px", textAlign: "center" }}>
                  <Wallet size={30} />
                 <p>No transactions yet.</p>
                  <button
                    className="primary-button"
                    onClick={() => navigate("/transactions")}
                  >
                    <Plus size={16} />
                    Add your first transaction
                  </button>
                </div>
              ) : (
                recentTransactions.map((transaction) => {
                  const isIncome = transaction.type === "INCOME";

                  const categoryName =
                    transaction.category?.name ||
                    (isIncome ? "Income" : "Uncategorized");

                  const TransactionIcon = getTransactionIcon(
                    categoryName,
                    transaction.type
                  );

                  return (
                    <div
                      className="transaction-row"
                      key={transaction.id}
                    >
                      <div
                        className={`transaction-icon ${
                          isIncome ? "green" : "orange"
                        }`}
                      >
                        <TransactionIcon size={19} />
                      </div>

                      <div className="transaction-details">
                        <strong>
                          {transaction.description ||
                            categoryName}
                        </strong>

                        <span>{categoryName}</span>
                      </div>

                      <span className="transaction-date">
                        {formatTransactionDate(
                          transaction.transactionDate
                        )}
                      </span>

                      <strong
                        className={`transaction-amount ${
                          isIncome ? "positive" : ""
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatMoney(transaction.amount)}
                      </strong>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <p className="demo-note">
            TrackMySpend · Live financial data from your account
          </p>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;