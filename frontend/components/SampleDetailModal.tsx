"use client";

import { ReactNode } from "react";

interface SampleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export function SampleDetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  actionText,
  onAction,
}: SampleDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-border max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface transition-colors"
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                {badge}
              </span>
            )}
            <span className="text-xs text-text-secondary">Interactive Sample Data</span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-text-primary">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-sm text-text-primary leading-relaxed">
          {children}
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-outline text-xs px-4 py-2"
          >
            Close
          </button>
          {actionText && onAction && (
            <button
              onClick={() => {
                onClose();
                onAction();
              }}
              className="btn btn-primary text-xs px-4 py-2"
            >
              {actionText} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
