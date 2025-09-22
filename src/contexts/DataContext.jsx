import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({
    income: { total: 0, count: 0, categories: [] },
    expense: { total: 0, count: 0, categories: [] },
    balance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    } else {
      // Clear data when user logs out
      setTransactions([]);
      setCategories([]);
      setStatistics({
        income: { total: 0, count: 0, categories: [] },
        expense: { total: 0, count: 0, categories: [] },
        balance: 0,
      });
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadStatistics(),
      ]);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (filters = {}) => {
    try {
      const response = await apiService.getTransactions(filters);
      setTransactions(response.transactions);
      return response.transactions;
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setError(error.message);
      return [];
    }
  };

  const loadCategories = async (type = null) => {
    try {
      const response = await apiService.getCategories(type);
      setCategories(response.categories);
      return response.categories;
    } catch (error) {
      console.error("Failed to load categories:", error);
      setError(error.message);
      return [];
    }
  };

  const loadStatistics = async (filters = {}) => {
    try {
      const response = await apiService.getStatistics(filters);
      setStatistics(response.statistics);
      return response.statistics;
    } catch (error) {
      console.error("Failed to load statistics:", error);
      setError(error.message);
      return null;
    }
  };

  const createTransaction = async (transactionData) => {
    try {
      const response = await apiService.createTransaction(transactionData);

      // Refresh data
      await Promise.all([loadTransactions(), loadStatistics()]);

      return { success: true, transaction: response.transaction };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      await apiService.updateTransaction(id, transactionData);

      // Refresh data
      await Promise.all([loadTransactions(), loadStatistics()]);

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await apiService.deleteTransaction(id);

      // Refresh data
      await Promise.all([loadTransactions(), loadStatistics()]);

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const response = await apiService.createCategory(categoryData);

      // Refresh categories
      await loadCategories();

      return { success: true, category: response.category };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      await apiService.updateCategory(id, categoryData);

      // Refresh categories
      await loadCategories();

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteCategory = async (id) => {
    try {
      await apiService.deleteCategory(id);

      // Refresh categories
      await loadCategories();

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const getCategoryBreakdown = async (type, filters = {}) => {
    try {
      const response = await apiService.getCategoryBreakdown(type, filters);
      return response.breakdown;
    } catch (error) {
      console.error("Failed to load category breakdown:", error);
      setError(error.message);
      return [];
    }
  };

  const clearError = () => setError(null);

  const refreshData = () => {
    if (isAuthenticated) {
      loadInitialData();
    }
  };

  const value = {
    // Data
    transactions,
    categories,
    statistics,

    // State
    loading,
    error,

    // Transaction methods
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // Category methods
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Statistics methods
    loadStatistics,
    getCategoryBreakdown,

    // Utilities
    clearError,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
