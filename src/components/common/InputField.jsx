import React from 'react';

export default function InputField({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
  disabled = false,
  icon,
  rightElement,
  error,
  autoComplete
}) {
  return (
    <div className="w-full">
      <div
        className={`flex items-stretch w-full rounded-md border bg-white overflow-hidden transition-all duration-150 ${
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : 'border-gray-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100'
        } ${disabled ? 'bg-gray-50 opacity-75' : ''}`}
      >
        {/* Grey prefix block matching the screenshot */}
        <div className="w-12 bg-gray-100/90 border-r border-gray-300/80 flex items-center justify-center shrink-0 text-gray-500">
          {icon || <span className="w-4 h-4 rounded-sm bg-gray-200" />}
        </div>

        {/* Input */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full px-3.5 py-2.5 text-base text-gray-800 placeholder-gray-400 bg-transparent outline-none focus:outline-none min-h-[44px]"
        />

        {/* Optional right element (e.g. eye toggle, loading indicator) */}
        {rightElement && (
          <div className="flex items-center pr-3 shrink-0">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium pl-1">{error}</p>
      )}
    </div>
  );
}

