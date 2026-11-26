import React, { useState, useEffect, useRef } from 'react';
import { User, Store, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import ForgotPasswordModal from './ForgotPasswordModal';
import { getAssignedStores, loginAuditor, getSavedCredentials } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPassword, setRememberPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic store assignment states
  const [assignedStores, setAssignedStores] = useState([]);
  const [isCheckingStores, setIsCheckingStores] = useState(false);
  const [storeStatusMessage, setStoreStatusMessage] = useState('');
  const [storeStatusType, setStoreStatusType] = useState('info'); // 'info' | 'success' | 'warning'

  // Form submission & validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);

  const debounceTimeout = useRef(null);

  // Initialize with saved credentials if Remember Password was checked
  useEffect(() => {
    const saved = getSavedCredentials();
    if (saved?.username) {
      setUsername(saved.username);
      setRememberPassword(true);
      fetchStoresForUser(saved.username, saved.store);
    }
  }, []);

  const fetchStoresForUser = async (uname, preselectedStore = null) => {
    if (!uname || !uname.trim()) {
      setAssignedStores([]);
      setSelectedStore('');
      setStoreStatusMessage('');
      setIsCheckingStores(false);
      return;
    }

    setIsCheckingStores(true);
    setGeneralError('');

    try {
      const result = await getAssignedStores(uname);
      if (result.success && result.stores.length > 0) {
        setAssignedStores(result.stores);
        setStoreStatusType('success');
        setStoreStatusMessage(`${result.stores.length} assigned store(s) ready`);

        const matchingStore = preselectedStore
          ? result.stores.find(
              (s) =>
                s.shortName.toLowerCase() === preselectedStore.toLowerCase() ||
                s.name.toLowerCase() === preselectedStore.toLowerCase()
            )
          : null;

        const chosen = matchingStore || result.stores[0];
        setSelectedStore(chosen.shortName);
      } else {
        setAssignedStores([]);
        setSelectedStore('');
        setStoreStatusType('warning');
        setStoreStatusMessage(result.message || 'No active audit assignment found');
      }
    } catch {
      setAssignedStores([]);
      setSelectedStore('');
      setStoreStatusType('warning');
      setStoreStatusMessage('Could not connect to audit assignment server');
    } finally {
      setIsCheckingStores(false);
    }
  };

  // Handle username changes with debounce
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);

    if (errors.username) {
      setErrors((prev) => ({ ...prev, username: null }));
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchStoresForUser(val);
    }, 350);
  };

  // Validate all 3 required fields
  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Auditor username is required';
    }

    if (!selectedStore) {
      newErrors.store = assignedStores.length === 0
        ? 'No assigned store available. Please enter a valid auditor username.'
        : 'Please select an assigned store to proceed';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginAuditor({
        username,
        store: selectedStore,
        password,
        rememberPassword
      });

      if (result.success) {
        toast.success(`Welcome back, ${result.user.username}!`, 'Login Successful');
        login(result.user);
      } else {
        const errMsg = result.message || 'Authentication failed. Please verify your details.';
        setGeneralError(errMsg);
        toast.error(errMsg, 'Login Failed');
      }
    } catch {
      const netErr = 'A network error occurred while logging in. Please check your connection.';
      setGeneralError(netErr);
      toast.error(netErr, 'Connection Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[420px] mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-emerald-950/5 overflow-hidden relative transition-all">
        {/* Top Emerald Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#064e2b] via-emerald-600 to-[#0b663a]" />

        <div className="p-6 sm:p-8">
          {/* Top Logo - Halal Food Authority */}
          <div className="flex flex-col items-center justify-center pb-5">
            <img
              src="/hfa-logo.png"
              alt="Halal Food Authority - HFA Approved"
              className="h-20 sm:h-22 w-auto object-contain select-none"
              loading="eager"
            />
          </div>

          {/* Subtle Horizontal Divider */}
          <div className="border-t border-slate-100 w-full mb-5" />

          {/* Headings */}
          <div className="text-center mb-6 space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Auditor Sign In
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your credentials to access today&apos;s assigned store audit
            </p>
          </div>

          {/* Global Error Banner if any */}
          {generalError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Field 1: Username */}
            <div>
              <label htmlFor="auditor-username" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Auditor Username
              </label>
              <InputField
                id="auditor-username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter username"
                required
                autoComplete="username"
                icon={<User className="w-4 h-4 text-slate-500" />}
                error={errors.username}
                rightElement={
                  isCheckingStores ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  ) : assignedStores.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : null
                }
              />
            </div>

            {/* Field 2: Store (Automatically populated when username has assigned audit) */}
            <div>
              <label htmlFor="auditor-store" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Assigned Store
              </label>
              <SelectField
                id="auditor-store"
                value={selectedStore}
                onChange={(e) => {
                  setSelectedStore(e.target.value);
                  if (errors.store) {
                    setErrors((prev) => ({ ...prev, store: null }));
                  }
                }}
                options={assignedStores}
                placeholder={
                  !username.trim()
                    ? 'Enter username to load stores'
                    : assignedStores.length === 0
                    ? 'No store assigned for today'
                    : 'Select assigned store'
                }
                required
                disabled={isCheckingStores || assignedStores.length === 0}
                isLoading={isCheckingStores}
                icon={<Store className="w-4 h-4 text-slate-500" />}
                error={errors.store}
              />

              {/* Helper status text for assigned audit stores */}
              {storeStatusMessage && (
                <div className="flex items-center gap-1.5 mt-1.5 px-1 text-[11px]">
                  {storeStatusType === 'success' ? (
                    <span className="text-emerald-700 flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      {storeStatusMessage}
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      {storeStatusMessage}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Field 3: Password */}
            <div>
              <label htmlFor="auditor-password" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Password
              </label>
              <InputField
                id="auditor-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: null }));
                  }
                }}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                icon={<Lock className="w-4 h-4 text-slate-500" />}
                error={errors.password}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer rounded-lg"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Row: Remember Password & Forget Password Link */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#064e2b] focus:ring-emerald-500 cursor-pointer accent-[#064e2b]"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-[#064e2b] hover:text-emerald-800 hover:underline font-semibold transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#064e2b] to-[#0b663a] hover:from-[#053e22] hover:to-[#08532f] active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-md shadow-emerald-950/15 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In to Portal'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialUsername={username}
      />
    </>
  );
}

