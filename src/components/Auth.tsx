import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastViewport, ToastClose } from './Toast';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [toast, setToast] = useState<{ title: string; description: string; variant: 'success' | 'error' } | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const showToast = (title: string, description: string, variant: 'success' | 'error') => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });

    if (error) {
      showToast('Error', error.message, 'error');
    } else if (data.user) {
      showToast('Success', 'Account created successfully! You can now sign in.', 'success');
      setIsSignUp(false);
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      showToast('Error', error.message, 'error');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      showToast('Error', error.message, 'error');
    } else {
      showToast('Success', 'Password reset email sent! Check your inbox.', 'success');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <ToastProvider>
        <div className="bg-white p-8 rounded-xl shadow-lg w-96">
          <h1 className="text-2xl font-bold text-center mb-6">Tournament Maker</h1>
          
          {!isForgotPassword && (
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => { setIsSignUp(false); setIsForgotPassword(false); }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  !isSignUp ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsSignUp(true); setIsForgotPassword(false); }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  isSignUp ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={isForgotPassword ? handleForgotPassword : isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!isForgotPassword && (
            <p className="text-center text-sm mt-4">
              <button onClick={() => setIsForgotPassword(true)} className="text-indigo-600 hover:underline">
                Forgot Password?
              </button>
            </p>
          )}

          {isForgotPassword && (
            <p className="text-center text-sm mt-4">
              <button onClick={() => setIsForgotPassword(false)} className="text-indigo-600 hover:underline">
                Back to Sign In
              </button>
            </p>
          )}
        </div>

        {toast && (
          <Toast className={`${toast.variant === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="grid gap-1">
              <ToastTitle className={`${toast.variant === 'success' ? 'text-green-900' : 'text-red-900'}`}>{toast.title}</ToastTitle>
              <ToastDescription className={`${toast.variant === 'success' ? 'text-green-700' : 'text-red-700'}`}>{toast.description}</ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}