import React from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
}: SearchInputProps) {
  return (
    <input
      type='search'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='
        w-full
        px-4 py-2
        rounded-xl
        border border-gray-200
        focus:outline-none focus:ring-2 focus:ring-primary
      '
    />
  );
}
