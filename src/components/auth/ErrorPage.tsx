import React from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

export function ErrorPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const errorMessage = 
    (location.state as { message?: string })?.message || 
    searchParams.get('message') || 
    'Authentication failed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#011427] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <img
            src="/images/cq-500.png"
            alt="CommerceQuest Logo"
            className="mx-auto h-24 w-auto"
          />
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-900">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/40 rounded-full">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-400">
              Authentication Error
            </h2>
            <p className="mt-4 text-base text-red-800 dark:text-red-300">
              {errorMessage}
            </p>
          </div>
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
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
