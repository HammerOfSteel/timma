'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
          >
            <span className="bg-gradient-to-r from-purple-600 via-violet-500 to-emerald-500 bg-clip-text text-transparent">
              TIMMA
            </span>
          </h1>
          <p className="mt-2 text-gray-500">Din visuella dagsplanerare</p>
        </div>

        <form action={action} className="space-y-6">
          {state?.message && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{state.message}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-postadress
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              placeholder="anna@example.com"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Lösenord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            {pending ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Har du inget konto?{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Skapa konto
          </Link>
        </p>
      </div>
    </div>
  );
}
