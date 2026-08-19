"use client";

import Link from "next/link";
import Image from "next/image";
import { PatientProfile, DR_UPASANA_GALA } from "@/lib/evolve/patientStore";
import { BleConnectionStatus } from "@/lib/evolve/museBleService";
import { User, Play, Stethoscope } from "lucide-react";

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border text-text-primary shadow-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Evolve Logo & Clinic Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link href="/evolve" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface border border-border flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
              <img
                src="/evolve/evolve-logo.webp"
                alt="Evolve Brain Training"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-text-primary group-hover:text-accent transition-colors">
                  Evolve Brain Training
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-text-secondary truncate max-w-[170px] sm:max-w-none">
                Dr. Upasana Gala · Dubai & Abu Dhabi
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Tab Navigation */}
        <nav className="hidden md:flex items-center p-1 bg-surface rounded-lg border border-border text-xs font-medium">
          <button
            onClick={() => onSelectTab("patient")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              currentTab === "patient"
                ? "bg-white text-text-primary shadow-xs border border-border font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Dashboard</span>
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
            <span>Live Session</span>
          </button>
          <button
            onClick={() => onSelectTab("clinician")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              currentTab === "clinician"
                ? "bg-white text-text-primary shadow-xs border border-border font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Dr. Gala Portal</span>
          </button>
        </nav>

        {/* Right: Muse Status & User Profile */}
        <div className="flex items-center gap-2">
          {/* Muse BLE Connection Button */}
          <button
            onClick={onConnectBle}
            title={
              bleStatus === "connected"
                ? "Muse 2 Headband Connected"
                : "Connect Muse Headband via Web Bluetooth"
            }
            className={`text-xs px-2 sm:px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all font-mono shrink-0 ${
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
            <span className="text-[11px] sm:text-xs">
              {bleStatus === "connected"
                ? "Muse Linked"
                : bleStatus === "connecting"
                ? "Pairing..."
                : "Connect Muse"}
            </span>
          </button>

          {/* User Profile / Auth Switcher */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg border border-border hover:border-border-strong hover:bg-surface transition-all text-left"
          >
            {currentRole === "clinician" ? (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-accent/40 shrink-0 bg-slate-100">
                <img
                  src="/evolve/dr-upasana-gala.png"
                  alt={DR_UPASANA_GALA.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-teal-100 border border-teal-300 text-teal-800 font-mono text-[10px] sm:text-xs flex items-center justify-center font-semibold shrink-0">
                {activePatient.name.split(" ").map((n) => n[0]).join("")}
              </div>
            )}
            <div className="hidden lg:block text-left pr-1">
              <p className="text-xs font-semibold text-text-primary leading-none">
                {currentRole === "clinician" ? "Dr. Upasana Gala" : activePatient.name}
              </p>
              <p className="text-[10px] text-text-secondary font-mono leading-tight mt-0.5">
                {currentRole === "clinician" ? "Supervising Clinician" : activePatient.id}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (< md screens) */}
      <div className="md:hidden flex items-center justify-around border-t border-border bg-surface/80 px-2 py-1 text-xs font-medium">
        <button
          onClick={() => onSelectTab("patient")}
          className={`flex-1 py-1.5 text-center rounded-md transition-all flex items-center justify-center gap-1 ${
            currentTab === "patient"
              ? "bg-white text-text-primary shadow-xs border border-border font-semibold"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <User className="w-3 h-3" />
          <span>Patient</span>
        </button>
        <button
          onClick={() => onSelectTab("session")}
          className={`flex-1 py-1.5 text-center rounded-md transition-all flex items-center justify-center gap-1 ${
            currentTab === "session"
              ? "bg-accent text-white shadow-xs font-semibold"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Session</span>
        </button>
        <button
          onClick={() => onSelectTab("clinician")}
          className={`flex-1 py-1.5 text-center rounded-md transition-all flex items-center justify-center gap-1 ${
            currentTab === "clinician"
              ? "bg-white text-text-primary shadow-xs border border-border font-semibold"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Stethoscope className="w-3 h-3" />
          <span>Dr. Gala Portal</span>
        </button>
      </div>
    </header>
  );
}
