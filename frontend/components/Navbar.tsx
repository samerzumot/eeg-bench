"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border text-text-primary">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-text-primary hover:text-accent transition-colors"
          >
            EEG-Bench
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              href="/benchmark"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Academic Researchers
            </Link>
            <Link
              href="/wizard"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Your Data
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/clinician"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Clinician Portal
            </Link>
            <button
              onClick={() => setShowSignIn(true)}
              className="btn text-sm py-1.5 px-4 rounded-lg border btn-outline border-border-strong text-text-primary hover:bg-surface transition-all"
            >
              Sign In
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-text-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-3 border-border bg-white">
            <Link
              href="/"
              className="text-sm font-medium text-accent"
              onClick={() => setMobileOpen(false)}
            >
              bniAdam AI Research Lab
            </Link>
            <Link
              href="/benchmark"
              className="text-sm font-medium text-text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              Academic Researchers
            </Link>
            <Link
              href="/wizard"
              className="text-sm font-medium text-text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              Your Data
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <Link
              href="/clinician"
              className="text-sm font-medium text-teal-600"
              onClick={() => setMobileOpen(false)}
            >
              Clinician Portal
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                setShowSignIn(true);
              }}
              className="btn text-sm py-1.5 px-4 w-fit rounded-lg border btn-outline border-border-strong text-text-primary hover:bg-surface transition-all"
            >
              Sign In
            </button>
          </div>
        )}
      </nav>

      {/* Sign In Modal */}
      {showSignIn && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSignIn(false)}
        >
          <div
            className="rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 border bg-white border-border text-text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-medium">Sign In</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Authentication is coming soon. For now, all features are available without signing in.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                disabled
                className="btn w-full py-2.5 rounded-lg opacity-50 cursor-not-allowed flex items-center justify-center gap-2 border bg-surface border-border text-text-secondary"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button
                disabled
                className="btn w-full py-2.5 rounded-lg opacity-50 cursor-not-allowed border bg-surface border-border text-text-secondary"
              >
                Continue with Email
              </button>
            </div>

            <button
              onClick={() => setShowSignIn(false)}
              className="mt-6 w-full text-sm text-text-secondary hover:text-text-primary transition-colors text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
