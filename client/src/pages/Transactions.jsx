import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  X,
  Receipt,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

import api from "../services/api";

const emptyForm = {
  amount: "",
  type: "EXPENSE",
  categoryId: "",
  description: "",
  transactionDate: new Date().toISOString().slice(0, 10),
};

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/transactions?limit=100");

      const fetchedTransactions =
        response.data?.data?.transactions;

      setTransactions(
        Array.isArray(fetchedTransactions)
          ? fetchedTransactions
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load transactions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      const fetchedCategories =
        response.data?.data?.categories;

      setCategories(
        Array.isArray(fetchedCategories)
          ? fetchedCategories
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load categories."
      );
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const availableCategories = useMemo(() => {
    return categories.filter(
      (category) => category.type === form.type
    );
  }, [categories, form.type]);

  const dateFilteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(
        transaction.transactionDate
      )
        .toISOString()
        .slice(0, 10);

      const matchesStartDate =
        !startDate || transactionDate >= startDate;

      const matchesEndDate =
        !endDate || transactionDate <= endDate;

      return matchesStartDate && matchesEndDate;
    });
  }, [transactions, startDate, endDate]);

  const filteredTransactions = useMemo(() => {
    return dateFilteredTransactions.filter((transaction) => {
      const matchesType =
        filter === "ALL" || transaction.type === filter;

      const searchText = search.toLowerCase();

      const matchesSearch =
        (transaction.description || "")
          .toLowerCase()
          .includes(searchText) ||
        (transaction.category?.name || "")
          .toLowerCase()
          .includes(searchText);

      return matchesType && matchesSearch;
    });
  }, [dateFilteredTransactions, filter, search]);

  const totalIncome = dateFilteredTransactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpense = dateFilteredTransactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      transactionDate: new Date().toISOString().slice(0, 10),
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setEditingId(transaction.id);

    setForm({
      amount: String(transaction.amount),
      type: transaction.type,
      categoryId: transaction.categoryId || "",
      description: transaction.description || "",
      transactionDate: new Date(transaction.transactionDate)
        .toISOString()
        .slice(0, 10),
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleTypeChange = (type) => {
    setForm((previous) => ({
      ...previous,
      type,
      categoryId: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!form.transactionDate) {
      setError("Please select a transaction date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        amount: Number(form.amount),
        type: form.type,
        categoryId: form.categoryId || null,
        description: form.description.trim() || null,
        transactionDate: new Date(
          `${form.transactionDate}T12:00:00`
        ).toISOString(),
      };

      if (editingId) {
        await api.patch(
          `/transactions/${editingId}`,
          payload
        );

        setSuccess("Transaction updated successfully!");
      } else {
        await api.post("/transactions", payload);

        setSuccess("Transaction added successfully!");
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await fetchTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await api.delete(`/transactions/${id}`);

      setSuccess("Transaction deleted successfully!");

      await fetchTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete transaction."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f7f7fb",
      padding: "28px",
      color: "#25243a",
      fontFamily: "inherit",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "28px",
    },
    button: {
      border: "none",
      borderRadius: "10px",
      padding: "12px 17px",
      background: "#7658d5",
      color: "white",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: 600,
    },
    card: {
      background: "white",
      border: "1px solid #ecebf2",
      borderRadius: "15px",
      padding: "20px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #e5e4ed",
      borderRadius: "9px",
      padding: "12px",
      fontSize: "14px",
      background: "white",
      color: "#25243a",
      outlineColor: "#8065df",
    },
    label: {
      display: "block",
      marginBottom: "7px",
      fontSize: "13px",
      fontWeight: 600,
      color: "#666579",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              border: "none",
              background: "transparent",
              color: "#77758a",
              cursor: "pointer",
              display: "flex",
              gap: "7px",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <ArrowLeft size={17} /> Dashboard
          </button>

          <h1 style={{ margin: 0, fontSize: "28px" }}>
            Transactions
          </h1>

          <p style={{ color: "#89879a", marginTop: "7px" }}>
            Manage your income and expenses.
          </p>
        </div>

        <button style={styles.button} onClick={openAddModal}>
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "13px",
            background: "#fff0f0",
            color: "#c03939",
            borderRadius: "9px",
            marginBottom: "18px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "13px",
            background: "#eafaf2",
            color: "#168456",
            borderRadius: "9px",
            marginBottom: "18px",
          }}
        >
          {success}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "17px",
          marginBottom: "24px",
        }}
      >
        <div style={styles.card}>
          <div style={{ color: "#89879a", fontSize: "14px" }}>
            Total Income
          </div>
          <h2 style={{ color: "#159b70", marginBottom: 0 }}>
            {currency(totalIncome)}
          </h2>
          <ArrowDownRight color="#159b70" size={20} />
        </div>

        <div style={styles.card}>
          <div style={{ color: "#89879a", fontSize: "14px" }}>
            Total Expenses
          </div>
          <h2 style={{ color: "#e17b52", marginBottom: 0 }}>
            {currency(totalExpense)}
          </h2>
          <ArrowUpRight color="#e17b52" size={20} />
        </div>

        <div style={styles.card}>
          <div style={{ color: "#89879a", fontSize: "14px" }}>
            Net Cash Flow
          </div>
          <h2
            style={{
              color:
                totalIncome - totalExpense >= 0
                  ? "#159b70"
                  : "#e17b52",
              marginBottom: 0,
            }}
          >
            {currency(totalIncome - totalExpense)}
          </h2>
          <Receipt color="#8065df" size={20} />
        </div>
      </div>

      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "22px",
          }}
        >
          <h3 style={{ margin: 0 }}>All Transactions</h3>

          <button
            onClick={fetchTransactions}
            disabled={loading}
            style={{
              border: "1px solid #e5e4ed",
              background: "white",
              borderRadius: "9px",
              padding: "10px",
              cursor: "pointer",
            }}
            title="Refresh transactions"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              ...styles.input,
              display: "flex",
              alignItems: "center",
              gap: "9px",
              flex: "1 1 220px",
            }}
          >
            <Search size={17} color="#9290a3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                minWidth: 0,
                background: "transparent",
              }}
            />
          </div>

          {["ALL", "INCOME", "EXPENSE"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                border: "1px solid",
                borderColor:
                  filter === type ? "#8065df" : "#e5e4ed",
                background:
                  filter === type ? "#f0edff" : "white",
                color:
                  filter === type ? "#7658d5" : "#77758a",
                borderRadius: "9px",
                padding: "10px 16px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {type === "ALL"
                ? "All"
                : type === "INCOME"
                  ? "Income"
                  : "Expenses"}
            </button>
          ))}
        </div>
        {/* DATE FILTER SECTION */}
        <div
          style={{
            background: "#faf9ff",
            border: "1px solid #ece8fa",
            borderRadius: "12px",
            padding: "17px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
              color: "#7658d5",
              fontWeight: 700,
            }}
          >
            <CalendarDays size={18} />
            Filter by Date
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "end",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 180px" }}>
              <label style={styles.label}>From Date</label>
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ flex: "1 1 180px" }}>
              <label style={styles.label}>To Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <button
              onClick={clearDateFilters}
              disabled={!startDate && !endDate}
              style={{
                ...styles.button,
                background: "#f0edff",
                color: "#7658d5",
                border: "1px solid #e2dcfa",
                opacity: !startDate && !endDate ? 0.5 : 1,
              }}
            >
              <X size={16} />
              Clear Dates
            </button>
          </div>

          <p
            style={{
              color: "#89879a",
              fontSize: "12px",
              marginBottom: 0,
              marginTop: "12px",
            }}
          >
            {startDate || endDate
              ? `Showing transactions ${
                  startDate ? `from ${startDate}` : "from beginning"
                } ${
                  endDate ? `to ${endDate}` : "onwards"
                }.`
              : "Select a date range to view transactions from a specific period."}
          </p>
        </div>

        {loading ? (
          <p
            style={{
              textAlign: "center",
              padding: "35px",
              color: "#89879a",
            }}
          >
            Loading transactions...
          </p>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "45px 15px" }}>
            <Receipt size={38} color="#aaa6bd" />
            <h3>No transactions found</h3>
            <p style={{ color: "#89879a" }}>
              Try changing your search or date filters.
            </p>
            <button style={styles.button} onClick={openAddModal}>
              <Plus size={17} /> Add Transaction
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                minWidth: "600px",
              }}
            >
              <thead>
                <tr
                  style={{
                    color: "#9290a3",
                    fontSize: "12px",
                    borderBottom: "1px solid #eeeef3",
                  }}
                >
                  <th style={{ padding: "13px 8px" }}>
                    DESCRIPTION
                  </th>
                  <th style={{ padding: "13px 8px" }}>DATE</th>
                  <th style={{ padding: "13px 8px" }}>TYPE</th>
                  <th style={{ padding: "13px 8px" }}>AMOUNT</th>
                  <th style={{ padding: "13px 8px" }}>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    style={{
                      borderBottom: "1px solid #f0eff5",
                    }}
                  >
                    <td style={{ padding: "16px 8px" }}>
                      <strong>
                        {transaction.description ||
                          "Untitled transaction"}
                      </strong>

                      <div
                        style={{
                          color: "#9290a3",
                          fontSize: "12px",
                          marginTop: "5px",
                        }}
                      >
                        {transaction.category?.name ||
                          "Uncategorized"}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "16px 8px",
                        color: "#77758a",
                      }}
                    >
                      {new Date(
                        transaction.transactionDate
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td style={{ padding: "16px 8px" }}>
                      <span
                        style={{
                          background:
                            transaction.type === "INCOME"
                              ? "#eafaf2"
                              : "#fff1eb",
                          color:
                            transaction.type === "INCOME"
                              ? "#159b70"
                              : "#dc7952",
                          borderRadius: "20px",
                          padding: "6px 10px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {transaction.type}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "16px 8px",
                        fontWeight: 700,
                        color:
                          transaction.type === "INCOME"
                            ? "#159b70"
                            : "#dc7952",
                      }}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {currency(transaction.amount)}
                    </td>

                    <td style={{ padding: "16px 8px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          title="Edit"
                          onClick={() =>
                            openEditModal(transaction)
                          }
                          style={{
                            border: "1px solid #e5e4ed",
                            background: "white",
                            borderRadius: "7px",
                            padding: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          title="Delete"
                          disabled={deletingId === transaction.id}
                          onClick={() =>
                            handleDelete(transaction.id)
                          }
                          style={{
                            border: "1px solid #f4dada",
                            background: "#fff5f5",
                            color: "#d34d4d",
                            borderRadius: "7px",
                            padding: "8px",
                            cursor: "pointer",
                            opacity:
                              deletingId === transaction.id
                                ? 0.5
                                : 1,
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeModal();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(20, 18, 38, 0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "18px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "17px",
              width: "100%",
              maxWidth: "470px",
              padding: "25px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "22px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {editingId
                  ? "Edit Transaction"
                  : "Add Transaction"}
              </h2>

              <button
                onClick={closeModal}
                disabled={saving}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "17px" }}>
                <label style={styles.label}>Transaction Type</label>
                <select
                  style={styles.input}
                  value={form.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div style={{ marginBottom: "17px" }}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.input}
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                >
                  <option value="">No category</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "17px" }}>
                <label style={styles.label}>Amount (₹)</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                />
              </div>

              <div style={{ marginBottom: "17px" }}>
                <label style={styles.label}>Description</label>
                <input
                  style={styles.input}
                  type="text"
                  maxLength={500}
                  placeholder="e.g. Grocery shopping"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label style={styles.label}>Transaction Date</label>
                <input
                  style={styles.input}
                  type="date"
                  required
                  value={form.transactionDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      transactionDate: e.target.value,
                    })
                  }
                />
              </div>

              {error && (
                <p style={{ color: "#c03939", fontSize: "13px" }}>
                  {error}
                </p>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  style={{
                    ...styles.button,
                    background: "#f0eff5",
                    color: "#55536a",
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.button,
                    flex: 1,
                    justifyContent: "center",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update"
                      : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;