'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function LoginButton() {
  const { login, logout, authenticated, user } = usePrivy();

  if (authenticated) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <p className="font-medium">
            {user?.email?.address || user?.wallet?.address?.slice(0, 6) + '...' + user?.wallet?.address?.slice(-4)}
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
    >
      Connect Wallet
    </button>
  );
}
