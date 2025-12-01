// app/login/page.js   (or app/page.js)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const login = async (email, password, role) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role);
      return true;
    }
    throw new Error('Invalid credentials');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password, selectedRole);
      alert('Login successful! Welcome back.');

      if (selectedRole === 'admin') router.push('/admin/dashboard');
      else if (selectedRole === 'faculty') router.push('/faculty/dashboard');
      else if (selectedRole === 'student') router.push('/student/dashboard');
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 text-black">
      {/* Wider container */}
      <div className="w-full max-w-2xl">
        {/* Card - wider & cleaner */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 md:p-12">

          {/* Header - smaller text */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl mb-4 shadow-lg">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Class Scheduling System</h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-7">

            {/* Role Selection - smaller text & buttons */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-3">Choose Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                {['admin', 'faculty', 'student'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-3 px-5 rounded-xl text-sm font-medium capitalize transition-all ${
                      selectedRole === role
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {role === 'admin' ? 'Admin' : role === 'faculty' ? 'Faculty' : 'Student'}
                  </button>
                ))}
              </div>
            </div>

            {/* User ID */}
            <div>
              <label htmlFor="userId" className="block text-xs font-medium text-gray-600 mb-1.5">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your User ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-3 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

          </form>
        </div>

        {/* Footer - smaller */}
        <div className="text-center mt-8 text-gray-400 text-xs">
          © {new Date().getFullYear()} Class Scheduling System
        </div>
      </div>
    </div>
  );
}