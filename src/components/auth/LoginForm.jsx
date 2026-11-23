import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Store, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import ForgotPasswordModal from './ForgotPasswordModal';
import AuditorQuickSelect from './AuditorQuickSelect';
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

  // Initialize with saved credentials or default demo
  useEffect(() => {
    const saved = getSavedCredentials();
    if (saved?.username) {
      setUsername(saved.username);
      setRememberPassword(true);
      fetchStoresForUser(saved.username, saved.store);
    } else {
      // Pre-fill "Taoheed" as depicted in the reference screenshot for instant visual match
      setUsername('Taoheed');
      fetchStoresForUser('Taoheed', 'Ibadan');
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

        // Check if preselectedStore exists in returned stores
        const matchingStore = preselectedStore 
          ? result.stores.find((s) => s.shortName.toLowerCase() === preselectedStore.toLowerCase() || s.name.toLowerCase() === preselectedStore.toLowerCase())
          : null;

        if (matchingStore) {
          setSelectedStore(matchingStore.shortName);
        } else {
          // Default to the first assigned store
          setSelectedStore(result.stores[0].shortName);
        }
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

  // Quick select an auditor from demo chips
  const handleQuickSelectAuditor = (auditorName) => {
    setUsername(auditorName);
    fetchStoresForUser(auditorName);
    if (errors.username) {
      setErrors((prev) => ({ ...prev, username: null }));
    }
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
      <div className="w-full max-w-[390px] mx-auto bg-white rounded-md border border-gray-300 shadow-sm p-6 sm:p-7 relative transition-all">
        {/* Top Logo - Halal Food Authority (Exact match to screenshot) */}
        <div className="flex flex-col items-center justify-center pt-1 pb-4">
          <img
            src="/hfa-logo.png"
            alt="Halal Food Authority - HFA Approved"
            className="h-20 sm:h-22 w-auto object-contain select-none"
            loading="eager"
          />
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="border-t border-gray-200/90 w-full mb-6" />

        {/* Headings matching the screenshot */}
        <div className="text-center mb-6 space-y-1">
          <h1 className="text-xl sm:text-[22px] font-normal text-gray-700 tracking-tight">
            Log in.
          </h1>
          <p className="text-sm sm:text-[15px] font-normal text-gray-600">
            Enter LogIn Details.
          </p>
        </div>

        {/* Global Error Banner if any */}
        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          {/* Field 1: Username */}
          <div>
            <InputField
              id="auditor-username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Username"
              required
              autoComplete="username"
              icon={<User className="w-4 h-4 text-gray-500" />}
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
                  ? 'Input username to load stores'
                  : assignedStores.length === 0
                  ? 'No assigned stores'
                  : 'Select assigned store'
              }
              required
              disabled={isCheckingStores || assignedStores.length === 0}
              isLoading={isCheckingStores}
              icon={<Store className="w-4 h-4 text-gray-500" />}
              error={errors.store}
            />

            {/* Helper status text for assigned audit stores */}
            {storeStatusMessage && (
              <div className="flex items-center gap-1.5 mt-1 px-1 text-[11px]">
                {storeStatusType === 'success' ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Assigned: {storeStatusMessage}
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {storeStatusMessage}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Field 3: Password */}
          <div>
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
              placeholder="•••••••"
              required
              autoComplete="current-password"
              icon={<Lock className="w-4 h-4 text-gray-500" />}
              error={errors.password}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
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
                className="w-4 h-4 rounded border-gray-400 text-[#006a19] focus:ring-emerald-500 cursor-pointer accent-[#006a19]"
              />
              <span className="text-xs sm:text-[13px] font-bold text-[#003d0e] tracking-tight">
                Remember Password
              </span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs sm:text-[13px] text-gray-600 hover:text-[#006a19] hover:underline font-normal transition-colors"
            >
              Forget password ?
            </button>
          </div>

          {/* Green Login Button (Exact style from screenshot) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-24 sm:w-28 py-2 px-4 bg-[#006a19] hover:bg-[#005213] active:bg-[#00410f] text-white font-medium text-sm rounded transition-all duration-150 shadow-xs flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        {/* Quick Test Switcher for user testing */}
        <AuditorQuickSelect
          currentUsername={username}
          onSelectAuditor={handleQuickSelectAuditor}
        />
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

