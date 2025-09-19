"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: boolean;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  icon,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
          <Search className='w-4 h-4' />
        </span>
      )}
      <input
        type='search'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full
          ${icon ? "pl-10" : "px-4"} pr-4 py-2
          rounded-xl
          border border-border
          focus:outline-none focus:ring-2 focus:ring-primary
        `}
      />
    </div>
  );
}
