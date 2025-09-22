const API_BASE_URL = "/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("accessToken");
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // Handle token expiration
      if (response.status === 401 && this.token) {
        const data = await response.json();
        if (data.code === "TOKEN_EXPIRED") {
          // Try to refresh token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry original request with new token
            config.headers.Authorization = `Bearer ${this.token}`;
            const retryResponse = await fetch(
              `${API_BASE_URL}${endpoint}`,
              config
            );
            return await this.handleResponse(retryResponse);
          }
        }
        // If refresh failed or other auth error, clear token
        this.setToken(null);
        window.location.href = "/login";
        return { success: false, message: "Unauthorized" };
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        message: "Network error. Please check your connection.",
      };
    }
  }

  async handleResponse(response) {
    const data = response.headers.get("content-length") > 0
        ? await response.json()
        : null;

    if (!response.ok) {
      return  {
        success: false,
        status: response.status,
        message: data?.message || `HTTP error! status: ${response.status}`,
      };
    }

    return { success: true, ...data };
  }

  async refreshToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    const result = await this.request("/auth/logout", { method: "POST" });
    this.setToken(null);
    return result;
  }

  async forgotPassword(email) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // Transaction methods
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const query = params.toString();
    return this.request(`/transactions${query ? `?${query}` : ""}`);
  }

  async getTransaction(id) {
    return this.request(`/transactions/${id}`);
  }

  async createTransaction(transactionData) {
    return this.request("/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(id, transactionData) {
    return this.request(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: "DELETE",
    });
  }

  async getStatistics(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const query = params.toString();
    return this.request(`/transactions/statistics${query ? `?${query}` : ""}`);
  }

  async getCategoryBreakdown(type, filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const query = params.toString();
    return this.request(
      `/transactions/categories/${type}${query ? `?${query}` : ""}`
    );
  }

  // Category methods
  async getCategories(type = null) {
    const params = type ? `?type=${type}` : "";
    return this.request(`/categories${params}`);
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    });
  }
}

export default new ApiService();
