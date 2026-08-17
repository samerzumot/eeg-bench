"use client";

import Link from "next/link";
import Image from "next/image";
import { PatientProfile, DR_UPASANA_GALA } from "@/lib/evolve/patientStore";
import { BleConnectionStatus } from "@/lib/evolve/museBleService";

interface EvolveNavbarProps {
  currentTab: "patient" | "session" | "clinician";
  onSelectTab: (tab: "patient" | "session" | "clinician") => void;
  currentRole: "patient" | "clinician";
  activePatient: PatientProfile;
  bleStatus: BleConnectionStatus;
  onConnectBle: () => void;
  onOpenAuth: () => void;
  onOpenDemo: () => void;
}

export function EvolveNavbar({
  currentTab,
  onSelectTab,
  currentRole,
  activePatient,
  bleStatus,
  onConnectBle,
  onOpenAuth,
  onOpenDemo,
}: EvolveNavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border text-text-primary">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Evolve Logo & Clinic Brand */}
        <div className="flex items-center gap-3">
          <Link href="/evolve" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center p-1 overflow-hidden shrink-0">
              <Image
                src="/evolve/evolve-logo.webp"
                alt="Evolve Brain Training"
                width={32}
                height={32}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-text-primary group-hover:text-accent transition-colors">
                  Evolve Brain Training
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Dr. Upasana Gala · Dubai Healthcare City & Abu Dhabi
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Portal Tab Navigation */}
        <nav className="hidden md:flex items-center p-1 bg-surface rounded-lg border border-border text-xs font-medium">
          <button
            onClick={() => onSelectTab("patient")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              currentTab === "patient"
                ? "bg-white text-text-primary shadow-xs border border-border font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Patient Dashboard
          </button>
          <button
            onClick={() => onSelectTab("session")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              currentTab === "session"
                ? "bg-accent text-white shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live Session
          </button>
          <button
            onClick={() => onSelectTab("clinician")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              currentTab === "clinician"
                ? "bg-white text-text-primary shadow-xs border border-border font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Dr. Gala Portal
          </button>
        </nav>

        {/* Right: Muse Status & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Muse BLE Connection Button */}
          <button
            onClick={onConnectBle}
            title={
              bleStatus === "connected"
                ? "Muse 2 Headband Connected"
                : "Connect Muse Headband via Web Bluetooth"
            }
            className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all font-mono ${
              bleStatus === "connected"
                ? "bg-teal-50 border-teal-300 text-teal-800 font-medium"
                : bleStatus === "connecting"
                ? "bg-amber-50 border-amber-300 text-amber-800 animate-pulse"
                : "bg-surface border-border hover:border-border-strong text-text-secondary hover:text-text-primary"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                bleStatus === "connected"
                  ? "bg-teal-500"
                  : bleStatus === "connecting"
                  ? "bg-amber-500"
                  : "bg-black/30"
              }`}
            />
            <span className="hidden sm:inline">
              {bleStatus === "connected"
                ? "Muse Athena"
                : bleStatus === "connecting"
                ? "Pairing..."
                : "Connect Muse"}
            </span>
          </button>

          {/* User Profile / Auth Switcher */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1.5 rounded-lg border border-border hover:border-border-strong hover:bg-surface transition-all text-left"
          >
            {currentRole === "clinician" ? (
              <div className="w-7 h-7 rounded-full overflow-hidden border border-accent/40 shrink-0">
                <Image
                  src={DR_UPASANA_GALA.photoUrl}
                  alt={DR_UPASANA_GALA.name}
                  width={28}
                  height={28}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-300 text-teal-800 font-mono text-xs flex items-center justify-center font-semibold shrink-0">
                {activePatient.name.split(" ").map((n) => n[0]).join("")}
              </div>
            )}
            <div className="hidden lg:block text-left pr-1">
              <p className="text-xs font-semibold text-text-primary leading-none">
                {currentRole === "clinician" ? DR_UPASANA_GALA.name : activePatient.name}
              </p>
              <p className="text-[10px] text-text-secondary font-mono leading-tight mt-0.5">
                {currentRole === "clinician" ? "Supervising Clinician" : activePatient.id}
              </p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-text-secondary"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
