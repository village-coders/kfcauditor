import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function SelectField({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select assigned store',
  required = true,
  disabled = false,
  icon,
  error,
  isLoading = false
}) {
  return (
    <div className="w-full">
      <div
        className={`relative flex items-stretch w-full rounded-md border bg-white overflow-hidden transition-all duration-150 ${
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : 'border-gray-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100'
        } ${disabled ? 'bg-gray-50/80 text-gray-400 cursor-not-allowed' : ''}`}
      >
        {/* Grey prefix block matching the screenshot */}
        <div className="w-12 bg-gray-100/90 border-r border-gray-300/80 flex items-center justify-center shrink-0 text-gray-500">
          {icon || <span className="w-4 h-4 rounded-sm bg-gray-200" />}
        </div>

        {/* Native Select with custom arrow */}
        <div className="relative w-full flex items-center">
          <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled || isLoading}
            className={`w-full px-3.5 py-2.5 text-base bg-transparent appearance-none outline-none focus:outline-none min-h-[44px] pr-9 ${
              !value ? 'text-gray-400' : 'text-gray-800 font-medium'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <option value="" disabled>
              {isLoading ? 'Checking assigned stores...' : placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt.id || opt.value || opt.name} value={opt.shortName || opt.name || opt.value}>
                {opt.name || opt.label}
              </option>
            ))}
          </select>

          {/* Dropdown arrow matching the screenshot */}
          <div className="pointer-events-none absolute right-3 flex items-center text-gray-600">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 stroke-[2.2]" />
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium pl-1">{error}</p>
      )}
    </div>
  );
}

