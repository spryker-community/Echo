import React from 'react';
import { useSearchParams } from 'react-router-dom';

export function ErrorPage() {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('message') || 'Authentication failed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#011427] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <img
            src="/images/cq-500.png"
            alt="CommerceQuest Logo"
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            {errorMessage}
          </p>
        </div>
        <div className="mt-8">
          <a
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent 
                     text-sm font-medium rounded-lg text-white bg-[#00AEEF] 
                     hover:bg-[#EC008C] focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-[#00AEEF]
                     transition-colors duration-200"
          >
            Try Again
          </a>
        </div>
      </div>
    </div>
  );
}
