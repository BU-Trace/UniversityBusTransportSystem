'use client';

import React from 'react';
import Link from 'next/link';

type Props = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <h1 className="text-3xl font-bold text-red-600">Something went wrong!</h1>
      <p className="mt-4 text-gray-700 max-w-xl text-center">
        {error?.message || 'Please try refreshing the page or come back later.'}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try again
        </button>
        <Link href="/" className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100">
          Go home
        </Link>
      </div>
    </div>
  );
}
