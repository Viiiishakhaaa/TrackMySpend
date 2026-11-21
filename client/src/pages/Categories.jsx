import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowDownRight,
  Plus,
  Pencil,
  Trash2,
  Wallet,
  ShoppingBag,
  Utensils,
  Car,
  GraduationCap,
  Heart,
  Home,
  Coffee,
  Briefcase,
  X,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../services/api";

const iconOptions = [
  "Wallet",
  "ShoppingBag",
  "Utensils",
  "Car",
  "GraduationCap",
  "Heart",
  "Home",
  "Coffee",
  "Briefcase",
];

const iconMap = {
  Wallet,
  ShoppingBag,
  Utensils,
  Car,
  GraduationCap,
  Heart,
  Home,
  Coffee,
  Briefcase,
};

const colors = [
  "#8065df",
  "#22b58a",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#ef4444",
  "#14b8a6",
  "#8b5cf6",
];

const initialForm = {
  name: "",
  type: "EXPENSE",
  icon: "Wallet",
  color: "#8065df",
};

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(initialForm);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      setCategories(response.data.data.categories || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);

    setForm({
      name: category.name,
      type: category.type,
      icon: category.icon || "Wallet",
      color: category.color || "#8065df",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        type: form.type,
        icon: form.icon,
        color: form.color,
      };

      if (editingId) {
        await api.patch(`/categories/${editingId}`, {
          name: payload.name,
          icon: payload.icon,
          color: payload.color,
        });

        setSuccess("Category updated successfully.");
      } else {
        await api.post("/categories", payload);
        setSuccess("Category created successfully.");
      }

      closeModal();
      await fetchCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"? Existing transactions will be kept without this category.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/categories/${category.id}`);

      setCategories((previous) =>
        previous.filter((item) => item.id !== category.id)
      );

      setSuccess("Category deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete category."
      );
    }
  };

  const filteredCategories =
    filter === "ALL"
      ? categories
      : categories.filter((item) => item.type === filter);

  const incomeCount = categories.filter(
    (item) => item.type === "INCOME"
  ).length;

  const expenseCount = categories.filter(
    (item) => item.type === "EXPENSE"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7fb",
        padding: "30px",
        color: "#26243a",
      }}
    >
      <div
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              style={secondaryButton}
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>

            <h1 style={{ margin: "20px 0 6px", fontSize: "30px" }}>
              Categories
            </h1>

            <p style={{ color: "#9292a3", margin: 0 }}>
              Organise and manage your income and expenses.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            style={primaryButton}
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* SUMMARY */}
        <div style={summaryGrid}>
          <SummaryCard
            title="Total Categories"
            value={categories.length}
            icon={<Wallet size={21} />}
            color="#8065df"
          />

          <SummaryCard
            title="Income Categories"
            value={incomeCount}
            icon={<ArrowIncome />}
            color="#22b58a"
          />

          <SummaryCard
            title="Expense Categories"
            value={expenseCount}
            icon={<ShoppingBag size={21} />}
            color="#f59e0b"
          />
        </div>

        {/* NOTIFICATIONS */}
        {success && (
          <div style={successBox}>
            {success}
          </div>
        )}

        {error && !modalOpen && (
          <div style={errorBox}>
            {error}
            <button
              onClick={fetchCategories}
              style={{ border: 0, background: "transparent", cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* CATEGORY LIST */}
        <section style={panel}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
              marginBottom: "25px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "19px", margin: 0 }}>
                Your Categories
              </h2>
              <p style={{ color: "#9292a3", margin: "6px 0 0" }}>
                Manage your personal financial categories.
              </p>
            </div>

            <div style={filterContainer}>
              {["ALL", "INCOME", "EXPENSE"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  style={{
                    ...filterButton,
                    background:
                      filter === item ? "#8065df" : "transparent",
                    color:
                      filter === item ? "#fff" : "#77758a",
                  }}
                >
                  {item === "ALL"
                    ? "All"
                    : item === "INCOME"
                      ? "Income"
                      : "Expenses"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={emptyState}>
              <RefreshCw size={25} />
              <p>Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div style={emptyState}>
              <Wallet size={34} color="#9292a3" />
              <h3>No categories found</h3>
              <p>Create your first category to get started.</p>
              <button
                onClick={openCreateModal}
                style={primaryButton}
              >
                <Plus size={17} />
                Create Category
              </button>
            </div>
          ) : (
            <div style={categoryGrid}>
              {filteredCategories.map((category) => {
                const CategoryIcon =
                  iconMap[category.icon] || Wallet;

                const categoryColor =
                  category.color || "#8065df";

                return (
                  <div key={category.id} style={categoryCard}>
                    <div
                      style={{
                        ...categoryIconStyle,
                        background: `${categoryColor}18`,
                        color: categoryColor,
                      }}
                    >
                      <CategoryIcon size={23} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "15px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {category.name}
                      </strong>

                      <span
                        style={{
                          fontSize: "12px",
                          color: "#9292a3",
                          display: "block",
                          marginTop: "5px",
                        }}
                      >
                        {category.type === "INCOME"
                          ? "Income"
                          : "Expense"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        title="Edit category"
                        onClick={() => openEditModal(category)}
                        style={actionButton}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        title="Delete category"
                        onClick={() => handleDelete(category)}
                        style={{
                          ...actionButton,
                          color: "#e05252",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div style={overlay}>
          <form onSubmit={handleSubmit} style={modal}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {editingId ? "Edit Category" : "Create Category"}
                </h2>

                <p style={{ color: "#9292a3", fontSize: "13px" }}>
                  Add details for your category.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                style={actionButton}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={errorBox}>{error}</div>
            )}

            <label style={labelStyle}>Category Name</label>

            <input
              required
              minLength={2}
              maxLength={60}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="e.g. Food & Groceries"
              style={inputStyle}
            />

            <label style={labelStyle}>Category Type</label>

            <select
              value={form.type}
              disabled={Boolean(editingId)}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
              style={inputStyle}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>

            <label style={labelStyle}>Choose Icon</label>

            <div style={iconGrid}>
              {iconOptions.map((name) => {
                const Icon = iconMap[name];

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, icon: name })
                    }
                    style={{
                      ...iconChoice,
                      border:
                        form.icon === name
                          ? "2px solid #8065df"
                          : "1px solid #e8e7ef",
                      color:
                        form.icon === name
                          ? "#8065df"
                          : "#77758a",
                    }}
                  >
                    <Icon size={21} />
                  </button>
                );
              })}
            </div>

            <label style={labelStyle}>Choose Color</label>

            <div style={colorGrid}>
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: color,
                    border:
                      form.color === color
                        ? "3px solid #26243a"
                        : "2px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "30px",
              }}
            >
              <button
                type="button"
                onClick={closeModal}
                style={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={primaryButton}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <div style={summaryCard}>
      <div
        style={{
          ...categoryIconStyle,
          background: `${color}18`,
          color,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={{ color: "#9292a3", margin: "0 0 5px", fontSize: "13px" }}>
          {title}
        </p>
        <h2 style={{ margin: 0, fontSize: "25px" }}>
          {value}
        </h2>
      </div>
    </div>
  );
}

function ArrowIncome() {
  return <ArrowDownRightIcon />;
}

function ArrowDownRightIcon() {
  return <ArrowDownRight size={21} />;
}

const primaryButton = {
  background: "#8065df",
  color: "#fff",
  border: "none",
  padding: "12px 17px",
  borderRadius: "9px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButton = {
  background: "#fff",
  color: "#55536a",
  border: "1px solid #e8e7ef",
  padding: "10px 14px",
  borderRadius: "8px",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "18px",
  marginBottom: "25px",
};

const summaryCard = {
  background: "#fff",
  border: "1px solid #eeedf3",
  borderRadius: "13px",
  padding: "22px",
  display: "flex",
  alignItems: "center",
  gap: "17px",
};

const panel = {
  background: "#fff",
  border: "1px solid #eeedf3",
  borderRadius: "14px",
  padding: "25px",
};

const filterContainer = {
  display: "flex",
  background: "#f4f3f8",
  padding: "4px",
  borderRadius: "9px",
  gap: "3px",
};

const filterButton = {
  border: "none",
  padding: "9px 13px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 600,
};

const categoryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "14px",
};

const categoryCard = {
  border: "1px solid #eeedf3",
  borderRadius: "11px",
  padding: "16px",
  display: "flex",
  alignItems: "center",
  gap: "13px",
  minWidth: 0,
};

const categoryIconStyle = {
  width: "45px",
  height: "45px",
  borderRadius: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const actionButton = {
  border: "none",
  background: "transparent",
  color: "#77758a",
  padding: "8px",
  cursor: "pointer",
};

const emptyState = {
  textAlign: "center",
  padding: "45px 15px",
  color: "#9292a3",
};

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(20, 18, 35, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "15px",
};

const modal = {
  width: "100%",
  maxWidth: "460px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "15px",
  padding: "25px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
};

const labelStyle = {
  display: "block",
  fontWeight: 600,
  fontSize: "13px",
  marginTop: "20px",
  marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #e5e4ed",
  borderRadius: "8px",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: "#26243a",
};

const iconGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "9px",
};

const iconChoice = {
  width: "43px",
  height: "43px",
  borderRadius: "8px",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const colorGrid = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const successBox = {
  background: "#e9f8f0",
  color: "#16804a",
  padding: "13px",
  borderRadius: "8px",
  marginBottom: "18px",
};

const errorBox = {
  background: "#fff0f0",
  color: "#c0392b",
  padding: "13px",
  borderRadius: "8px",
  marginBottom: "18px",
};

export default Categories;