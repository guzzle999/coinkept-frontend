import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth }  from "../contexts/AuthContext.jsx";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Password rules realtime
  const rules = {
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasLength: formData.password.length >= 8,
  };

  const RuleItem = ({ condition, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {condition ? (
        <CheckCircleIcon className="w-5 h-5 text-green-500" />
      ) : (
        <XCircleIcon className="w-5 h-5 text-red-700" />
      )}
      <span className={condition ? "text-green-600" : "text-red-700"}>
        {text}
      </span>
    </div>
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter (A-Z)";
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password =
        "Password must contain at least one lowercase letter (a-z)";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain at least one number (0-9)";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const result = await register(formData);

    if (result.success) {
      navigate("/", { replace: true });
    } else  {
      let newErrors = {};
      if (result.message === "Email already registered") {
        newErrors.email = "This email is already registered";
      } else {
        newErrors.global = result.message || "Registration failed";
      }
        setFormErrors(newErrors);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">💰</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-success-600 hover:text-success-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            {formErrors.global && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 text-center">
                <p className="text-sm text-danger-600">
                  {formErrors.global}
                </p>
              </div>
            )}
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-success-500 focus:border-success-500 focus:z-10 sm:text-sm ${
                  formErrors.name ? "border-danger-500" : "border-gray-300"
                }`}
                placeholder="Enter your full name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-danger-600">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-success-500 focus:border-success-500 focus:z-10 sm:text-sm ${
                  formErrors.email ? "border-danger-500" : "border-gray-300"
                }`}
                placeholder="Enter your email"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-danger-600">
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-success-500 focus:border-success-500 focus:z-10 sm:text-sm ${
                  formErrors.password ? "border-danger-500" : "border-gray-300"
                }`}
                placeholder="Create a password"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-danger-600">
                  {formErrors.password}
                </p>
              )}

              {/* Realtime rules */}
              <div className="flex gap-4 py-2 mb-2">
                <div>
                  <RuleItem
                    condition={rules.hasUpper}
                    text="At least one uppercase letter (A-Z)"
                  />
                  <RuleItem
                    condition={rules.hasLower}
                    text="At least one lowercase letter (a-z)"
                  />
                </div>
                <div>
                  <RuleItem
                    condition={rules.hasNumber}
                    text="At least one number (0-9)"
                  />
                  <RuleItem
                    condition={rules.hasLength}
                    text="Minimum length of 8 characters"
                  />
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-success-500 focus:border-success-500 focus:z-10 sm:text-sm ${
                  formErrors.confirmPassword
                    ? "border-danger-500"
                    : "border-gray-300"
                }`}
                placeholder="Confirm your password"
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && <div className="spinner w-4 h-4 mr-2"></div>}
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
