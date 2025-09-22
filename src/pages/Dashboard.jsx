import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useData } from "../contexts/DataContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const {
    transactions,
    statistics,
    loading,
    error,
    loadTransactions,
    loadStatistics,
    getCategoryBreakdown,
  } = useData();

  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [incomeBreakdown, setIncomeBreakdown] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case "week":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 6
        );
        endDate = now;
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
    }

    const filters = {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };

    // Load data
    await Promise.all([loadTransactions(filters), loadStatistics(filters)]);

    // Load breakdown data
    const [incomeData, expenseData] = await Promise.all([
      getCategoryBreakdown("income", filters),
      getCategoryBreakdown("expense", filters),
    ]);

    setIncomeBreakdown(incomeData);
    setExpenseBreakdown(expenseData);

    // Generate monthly trends for the year
    await generateMonthlyTrends();
  };

  const generateMonthlyTrends = async () => {
    const now = new Date();
    const months = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthName = date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      months.push(monthName);

      try {
        const stats = await loadStatistics({
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        });

        const income = stats?.income?.total || 0;
        const expense = stats?.expense?.total || 0;

        incomeData.push(income);
        expenseData.push(expense);
      } catch (error) {
        console.error("Failed to load monthly data:", error);
        incomeData.push(0);
        expenseData.push(0);
      }
    }

    setMonthlyTrends({ months, incomeData, expenseData });
  };

  // Chart configurations
  const balanceChartData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [statistics.income.total, statistics.expense.total],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 2,
      },
    ],
  };

  const trendChartData = {
    labels: monthlyTrends.months || [],
    datasets: [
      {
        label: "Income",
        data: monthlyTrends.incomeData || [],
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
      {
        label: "Expenses",
        data: monthlyTrends.expenseData || [],
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: $${context.parsed.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "฿" + value.toLocaleString();
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          _label: function (context) {
            return `${context.label}: $${context.parsed.toLocaleString()}`;
          },
          get label() {
            return this._label;
          },
          set label(value) {
            this._label = value;
          },
        },
      },
    },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Overview of your financial activity
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <p className="text-danger-600">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-success-600"
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
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Total Income
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(statistics.income.total)}
              </p>
              <p className="text-xs text-gray-600">
                {statistics.income.count} transactions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-danger-600"
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
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Total Expenses
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(statistics.expense.total)}
              </p>
              <p className="text-xs text-gray-600">
                {statistics.expense.count} transactions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  statistics.balance >= 0 ? "bg-primary-100" : "bg-yellow-100"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${
                    statistics.balance >= 0
                      ? "text-primary-600"
                      : "text-yellow-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Net Balance</h3>
              <p
                className={`text-2xl font-bold ${
                  statistics.balance >= 0
                    ? "text-success-600"
                    : "text-yellow-600"
                }`}
              >
                {formatCurrency(statistics.balance)}
              </p>
              <p className="text-xs text-gray-600">
                {statistics.balance >= 0 ? "Surplus" : "Deficit"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Income vs Expenses
          </h3>
          {statistics.income.total > 0 || statistics.expense.total > 0 ? (
            <div className="chart-container h-64">
              <Doughnut data={balanceChartData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p>No data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Trends
          </h3>
          {monthlyTrends.months && monthlyTrends.months.length > 0 ? (
            <div className="chart-container h-64">
              <Line data={trendChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="spinner w-8 h-8 mx-auto mb-2"></div>
                <p>Loading trends...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h3>
            <Link
              to="/transactions"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-3 ${
                        transaction.type === "income"
                          ? "bg-success-500"
                          : "bg-danger-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.category}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      transaction.type === "income"
                        ? "text-success-600"
                        : "text-danger-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              <p className="text-gray-600 mb-4">No transactions yet</p>
              <Link
                to="/transactions"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
              >
                Add your first transaction
              </Link>
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Expense Categories
          </h3>

          {expenseBreakdown.length > 0 ? (
            <div className="space-y-3">
              {expenseBreakdown.slice(0, 5).map((category, index) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 bg-danger-500 rounded-full mr-3"
                      style={{ opacity: 1 - index * 0.15 }}
                    ></div>
                    <span className="text-sm text-gray-900">
                      {category._id}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {formatCurrency(category.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No expense categories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
