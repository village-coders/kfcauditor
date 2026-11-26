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
        className={`flex items-stretch w-full rounded-xl border bg-white overflow-hidden transition-all duration-150 shadow-2xs ${
          error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 hover:border-slate-300 focus-within:border-[#064e2b] focus-within:ring-2 focus-within:ring-emerald-100'
        } ${disabled ? 'bg-slate-50 opacity-75' : ''}`}
      >
        {/* Icon prefix block */}
        <div className="w-11 bg-slate-50/90 border-r border-slate-200/80 flex items-center justify-center shrink-0 text-slate-400">
          {icon || <span className="w-4 h-4 rounded-sm bg-slate-200" />}
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
          className="w-full px-3.5 py-2.5 text-sm sm:text-[15px] text-slate-800 placeholder-slate-400 bg-transparent outline-none focus:outline-none min-h-[46px]"
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

