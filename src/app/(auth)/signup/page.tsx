'use client';

import { useActionState } from 'react';
import { signup } from '@/app/actions/auth';
import Link from 'next/link';

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Skapa konto</h1>
          <p className="mt-2 text-gray-600">Registrera dig för att komma igång med Timma</p>
        </div>

        <form action={action} className="space-y-6">
          {state?.message && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{state.message}</div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Ditt namn
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              placeholder="Anna Svensson"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              E-postadress
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              placeholder="anna@example.com"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Lösenord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              placeholder="Minst 8 tecken"
            />
            {state?.errors?.password && (
              <ul className="mt-1 text-sm text-red-600">
                {state.errors.password.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="householdName" className="block text-sm font-medium">
              Hushållsnamn
            </label>
            <input
              id="householdName"
              name="householdName"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              placeholder="Familjen Svensson"
            />
            {state?.errors?.householdName && (
              <p className="mt-1 text-sm text-red-600">{state.errors.householdName[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            {pending ? 'Skapar konto...' : 'Skapa konto'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Har du redan ett konto?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Logga in
          </Link>
        </p>
      </div>
    </div>
  );
}
