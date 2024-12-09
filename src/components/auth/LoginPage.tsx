import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../hooks/useToast';

const loginSchema = z.object({
  email: z
    .string()
    .transform(email => email.toLowerCase())
    .refine(
      (email) => email.length > 0,
      { message: 'Please enter your work email' }
    )
    .refine(
      (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      { message: 'Please enter a valid email address' }
    )
    .refine(
      (email) => email.endsWith('@spryker.com'),
      { message: 'Please use your work email' }
    ),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/.netlify/functions/auth-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      let errorMessage = 'Failed to send login link';
      try {
        const responseText = await response.text();
        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(responseText);
          errorMessage = jsonData.error || errorMessage;
        } catch {
          // If not JSON, use text directly
          errorMessage = responseText;
        }
      } catch {
        // If text() fails, use default message
      }

      if (!response.ok) {
        showToast({
          title: 'Access Denied',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      setEmailSent(true);
      showToast({
        title: 'Check your email',
        description: 'We\'ve sent you a magic link to sign in.',
      });
    } catch (error) {
      console.error('Login error:', error);
      showToast({
        title: 'Error',
        description: 'Failed to send login link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#011427] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <img
              src="/images/cq-500.png"
              alt="CommerceQuest Logo"
              className="mx-auto h-24 w-auto"
            />
          </div>
          <div className="bg-green-50/90 dark:bg-[#011427] rounded-lg p-8 border border-green-200 dark:border-green-500">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-500/20 rounded-full">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-400">
              Email Sent Successfully
            </h2>
            <p className="mt-4 text-base text-green-800 dark:text-green-300">
              Please check your inbox for a sign-in link.
            </p>
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
              The link will expire in 15 minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#011427] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            src="/images/cq-500.png"
            alt="CommerceQuest Logo"
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to Community Echo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your work email to receive a magic link
          </p>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit(onSubmit)} 
          noValidate
        >
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="text"
              autoComplete="off"
              spellCheck="false"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border 
                       border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400
                       text-gray-900 dark:text-white bg-white dark:bg-[#011427]
                       focus:outline-none focus:ring-[#00AEEF] focus:border-[#00AEEF]
                       focus:z-10 sm:text-sm"
              placeholder="name@spryker.com"
              {...register('email')}
              autoFocus
            />
          </div>

          {errors.email && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.email.message}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                       text-sm font-medium rounded-lg text-white bg-[#00AEEF] hover:bg-[#EC008C]
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00AEEF]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200"
            >
              {isLoading ? 'Sending...' : 'Send magic link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
