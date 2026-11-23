import React, { useState } from 'react';
import { X, CheckCircle, ShieldAlert, PhoneCall } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose, initialUsername }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState(initialUsername || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleResetState = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative border border-gray-100 overflow-hidden">
        <button
          onClick={handleResetState}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Reset Auditor Password
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your auditor username or registered employee ID. A verification PIN will be dispatched to your authorized supervisor.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Auditor Username / ID
                </label>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. Taoheed"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/60 text-[11px] text-amber-800 flex items-start gap-2">
                <PhoneCall className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  For immediate support at store locations, reach the <strong>HFA Nigeria Quality Hotline</strong> or speak to the Regional Audit Lead.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetState}
                  className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-xs transition-colors"
                >
                  Send OTP
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Instructions Sent!
            </h3>
            <p className="text-xs text-gray-600 mb-5">
              A temporary authentication token has been generated for <strong>{usernameOrEmail || 'your account'}</strong>.
            </p>
            <button
              onClick={handleResetState}
              className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-xs"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

