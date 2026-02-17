import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle empty response
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error registering');
      }

      // Cookie is now set by the server with security flags
      router.push('/generate');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign Up - Sonic-Wave">
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <div className="window-buttons">
                <button className="window-button window-button-close" />
                <button className="window-button window-button-minimize" />
                <button className="window-button window-button-maximize" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                Create Account
              </h1>
            </div>
            <p className="text-gray-400 text-center mb-8">
              Join Sonic-Wave and start creating music
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-400 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 mb-2 font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 mb-2 font-medium">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Repeat your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-gradient w-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="text-center text-gray-400 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
