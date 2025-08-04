"use client";

import React from "react";

interface CommonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  placeholder?: string;
}

export default function CommonInput({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  ...rest
}: CommonInputProps) {
  const inputId = id || name || undefined;

  return (
    <div className='flex flex-col space-y-1'>
      <label htmlFor={inputId} className='text-sm font-medium text-gray-700'>
        {label}
        {required && <span className='text-red-500'> *</span>}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={
          "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        }
        {...rest}
      />
    </div>
  );
}
