"use client";

import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className='flex items-center justify-center'>
      <Loader2 className='animate-spin h-10 w-10 text-blue-600' />
    </div>
  );
}
