"use client";

import React from "react";

export function SearchBar({ placeholder }: { placeholder?: string }) {
  return (
    <input
      type='text'
      placeholder={placeholder}
      className='w-full md:w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300'
    />
  );
}
