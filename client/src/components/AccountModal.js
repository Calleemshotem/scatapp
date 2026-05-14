import React, { useState, useEffect } from 'react';

const ACCOUNT_STORAGE_KEY = 'scat-accounts';

const generateId = () => `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const loadAccounts = () => {
  try {
    return JSON.parse(window.localStorage.getItem(ACCOUNT_STORAGE_KEY)) || [];
  } catch (err) {
    return [];
  }
};

const saveAccounts = (accounts) => {
  window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
};

const AccountModal = ({ isOpen, onClose, onAuthSuccess, isDarkTheme }) => {
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setPassword('');
      setConfirmPassword('');
      setEmail('');
      if (mode === 'signup') {
        setDisplayName('');
      }
    }
  }, [isOpen, mode]);

  const handleAuthSubmit = (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    const accounts = loadAccounts();

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Please enter a display name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const exists = accounts.some((item) => item.email === trimmedEmail);
      if (exists) {
        setError('An account with that email already exists.');
        return;
      }

      const newAccount = {
        id: generateId(),
        email: trimmedEmail,
        displayName: displayName.trim(),
        password,
        createdAt: new Date().toISOString(),
      };

      saveAccounts([...accounts, newAccount]);
      onAuthSuccess({ id: newAccount.id, email: newAccount.email, displayName: newAccount.displayName });
      return;
    }

    const matchingAccount = accounts.find(
      (item) => item.email === trimmedEmail && item.password === password
    );

    if (!matchingAccount) {
      setError('No matching account found. Please check your email and password.');
      return;
    }

    onAuthSuccess({
      id: matchingAccount.id,
      email: matchingAccount.email,
      displayName: matchingAccount.displayName,
    });
  };

  if (!isOpen) {
    return null;
  }

  const cardBg = isDarkTheme ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900';
  const accentText = isDarkTheme ? 'text-red-500' : 'text-purple-600';
  const accentBg = isDarkTheme ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-600 hover:bg-purple-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-3xl border shadow-xl p-6 ${cardBg}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-sm uppercase tracking-[0.2em] ${accentText}`}>{mode === 'signup' ? 'Create Account' : 'Sign In'}</p>
            <h2 className="text-2xl font-bold mt-2">Access your workspace</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition"
            aria-label="Close account modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'signup' && (
            <label className="block">
              <span className="text-sm font-medium">Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 ${isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
                placeholder="Your name"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-2 w-full rounded-2xl border px-4 py-3 ${isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-2 w-full rounded-2xl border px-4 py-3 ${isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
              placeholder="●●●●●●●●"
            />
          </label>

          {mode === 'signup' && (
            <label className="block">
              <span className="text-sm font-medium">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 ${isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
                placeholder="●●●●●●●●"
              />
            </label>
          )}

          {error && <div className="text-sm text-red-400">{error}</div>}

          <button
            type="submit"
            className={`w-full rounded-2xl py-3 text-white font-semibold transition ${accentBg}`}
          >
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-400">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
                className={`font-semibold ${accentText}`}
              >
                Sign in
              </button>
            </p>
          ) : (
            <p>
              New here?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`font-semibold ${accentText}`}
              >
                Create account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
