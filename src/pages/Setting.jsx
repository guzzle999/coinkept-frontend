import { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";

const Setting = () => {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    loadCategories,
    clearError,
  } = useData();

  const [activeTab, setActiveTab] = useState("income");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "income",
    color: "#3b82f6",
    icon: "📊",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined colors and icons
  const colorOptions = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#6b7280",
  ];

  const iconOptions = [
    "💼",
    "💻",
    "📈",
    "🏢",
    "💰",
    "🍽️",
    "🚗",
    "🛍️",
    "🎬",
    "⚕️",
    "📚",
    "📱",
    "✈️",
    "🏠",
    "⚡",
    "💡",
    "🎵",
    "🎨",
    "🏋️",
    "🌟",
    "📊",
    "💳",
    "🎯",
    "🔧",
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        type: activeTab,
        color: "#3b82f6",
        icon: "📊",
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "income",
      color: "#3b82f6",
      icon: "📊",
    });
    setFormErrors({});
    clearError();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleColorChange = (color) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }));
  };

  const handleIconChange = (icon) => {
    setFormData((prev) => ({
      ...prev,
      icon,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    }

    if (!formData.color) {
      errors.color = "Please select a color";
    }

    if (!formData.icon) {
      errors.icon = "Please select an icon";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData);
      } else {
        await createCategory(formData);
      }
      closeModal();
    } catch (error) {
      console.error("Category operation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      await deleteCategory(categoryId);
    }
  };

  // Filter categories by type
  const incomeCategories = categories.filter((cat) => cat.type === "income");
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  const CategoryCard = ({ category }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: category.color }}
          >
            {category.icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {category.name}
            </h3>
            <p className="text-xs text-gray-500 capitalize">{category.type}</p>
          </div>
        </div>

        {!category.isDefault && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openModal(category)}
              className="p-1 text-gray-400 hover:text-primary-600 rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(category._id)}
              className="p-1 text-gray-400 hover:text-danger-600 rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {category.isDefault && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Default Category
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Setting</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your income and expense categories
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-danger-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-danger-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("income")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "income"
                  ? "border-success-500 text-success-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
                Income Categories ({incomeCategories.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("expense")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "expense"
                  ? "border-danger-500 text-danger-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                  />
                </svg>
                Expense Categories ({expenseCategories.length})
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading categories...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTab === "income"
                ? incomeCategories.map((category) => (
                    <CategoryCard key={category._id} category={category} />
                  ))
                : expenseCategories.map((category) => (
                    <CategoryCard key={category._id} category={category} />
                  ))}

              {((activeTab === "income" && incomeCategories.length === 0) ||
                (activeTab === "expense" &&
                  expenseCategories.length === 0)) && (
                <div className="col-span-full text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No {activeTab} categories
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first {activeTab} category.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => openModal()}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add {activeTab} category
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-lg bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    formErrors.name ? "border-danger-500" : "border-gray-300"
                  }`}
                  placeholder="Enter category name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-danger-600">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === "income"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-success-600 focus:ring-success-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Income</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === "expense"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-danger-600 focus:ring-danger-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Expense</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        formData.color === color
                          ? "border-gray-900"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {formErrors.color && (
                  <p className="mt-1 text-sm text-danger-600">
                    {formErrors.color}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon *
                </label>
                <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleIconChange(icon)}
                      className={`w-8 h-8 flex items-center justify-center text-lg border rounded ${
                        formData.icon === icon
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                {formErrors.icon && (
                  <p className="mt-1 text-sm text-danger-600">
                    {formErrors.icon}
                  </p>
                )}
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formData.name || "Category Name"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {formData.type}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                  <p className="text-sm text-danger-600">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <div className="spinner w-4 h-4 mr-2"></div>}
                  {isSubmitting
                    ? editingCategory
                      ? "Updating..."
                      : "Creating..."
                    : editingCategory
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;
