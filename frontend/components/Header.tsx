"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  function handleLogout() {
    clearToken();
    setLoggedIn(false);
    window.location.href = "/";
  }

  return (
    <header className="border-b border-hairline">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">
          ManthanX
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-saffron transition-colors">
            Home
          </Link>
          <Link href="/chat" className="hover:text-saffron transition-colors">
            Chat
          </Link>
          {loggedIn ? (
            <button onClick={handleLogout} className="hover:text-critic transition-colors">
              Logout
            </button>
          ) : (
            
              <a href={`${API_URL}/auth/google/login`}
                className="bg-ink text-paper px-4 py-1.5 rounded-sm hover:bg-teal transition-colors">Sign in
              </a>
          )}
        </nav>
      </div>
    </header>
  );
}