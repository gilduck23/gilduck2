'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/login');
      }
    } catch (error) {
      setErrorMsg('An error occurred during registration');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold">Register</h1>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {errorMsg && (
            <div className="text-center text-red-500">{errorMsg}</div>
          )}
          <div>
            <input
              type="email"
              required
              className="w-full rounded-md border p-2"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="w-full rounded-md border p-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
            >
              Register
            </button>
          </div>
        </form>
        <div className="text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-600">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
