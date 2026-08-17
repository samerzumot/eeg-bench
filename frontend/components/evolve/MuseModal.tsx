"use client";

import { useState, useEffect } from "react";
import { museBle, BleConnectionStatus, MuseDeviceInfo } from "@/lib/evolve/museBleService";

interface MuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export function MuseModal({ isOpen, onClose, onConnected }: MuseModalProps) {
  const [status, setStatus] = useState<BleConnectionStatus>("disconnected");
  const [deviceInfo, setDeviceInfo] = useState<MuseDeviceInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    setIsSupported(museBle.isSupported());
    const unsub = museBle.subscribe((st, dev) => {
      setStatus(st);
      setDeviceInfo(dev || null);
      if (st === "connected" && onConnected) {
        onConnected();
      }
    });
    return () => unsub();
  }, [onConnected]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setErrorMessage(null);
    try {
      await museBle.connect();
    } catch (err: any) {
      if (err.name !== "NotFoundError" && !err.message?.includes("User cancelled")) {
        setErrorMessage(err.message || "Failed to pair with Muse headband.");
      }
    }
  };

  const handleDisconnect = () => {
    museBle.disconnect();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in text-text-primary"
      onClick={onClose}
    >
      <div
        className="card max-w-md w-full p-6 sm:p-7 bg-white border border-border shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Muse Headband Connection</h3>
              <p className="text-xs text-text-secondary">Muse 2 / Muse S Wireless EEG Link</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1 rounded-md transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Browser compatibility check */}
        {!isSupported && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">Web Bluetooth is not supported in this browser.</p>
            <p className="text-[11px] leading-relaxed">
              Please open this link in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on your laptop/desktop, or use <strong>Bluefy Browser</strong> on iOS. You can still test with the simulated signal!
            </p>
          </div>
        )}

        {/* Connection status card */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Headband Status:</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                status === "connected"
                  ? "bg-teal-100 text-teal-800 border border-teal-200"
                  : status === "connecting"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-border/60 text-text-secondary"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "connected"
                    ? "bg-teal-500 animate-pulse"
                    : status === "connecting"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-slate-400"
                }`}
              />
              {status === "connected"
                ? "Connected & Streaming"
                : status === "connecting"
                ? "Searching for Headband..."
                : "Not Connected"}
            </span>
          </div>

          {status === "connected" && deviceInfo && (
            <div className="pt-2 border-t border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Device:</span>
                <span className="font-semibold text-text-primary">{deviceInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Battery Level:</span>
                <span className="font-semibold text-teal-700">{deviceInfo.batteryLevel}%</span>
              </div>

              {/* Sensor check */}
              <div className="pt-2">
                <span className="text-[11px] text-text-secondary block mb-1.5 font-medium">
                  Electrode Contact Quality:
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
                  <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-800">
                    <span className="block font-bold">TP9</span>
                    <span className="text-[9px]">Left Ear</span>
                  </div>
                  <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-800">
                    <span className="block font-bold">AF7</span>
                    <span className="text-[9px]">Left Front</span>
                  </div>
                  <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-800">
                    <span className="block font-bold">AF8</span>
                    <span className="text-[9px]">Right Front</span>
                  </div>
                  <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-800">
                    <span className="block font-bold">TP10</span>
                    <span className="text-[9px]">Right Ear</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3 Step Setup Guide */}
        {status !== "connected" && (
          <div className="space-y-2 text-xs text-text-secondary">
            <p className="font-semibold text-text-primary">How to pair your headband:</p>
            <ol className="space-y-1.5 list-decimal list-inside text-[11px] leading-relaxed">
              <li>
                <strong>Turn on Muse:</strong> Hold the power button for 2 seconds until the LED lights turn on.
              </li>
              <li>
                <strong>Wear Headband:</strong> Ensure the forehead rubber sensors touch bare skin and the ear hooks rest behind your ears.
              </li>
              <li>
                <strong>Click Pair:</strong> Select your Muse headset from the browser popup list.
              </li>
            </ol>
          </div>
        )}

        {errorMessage && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {errorMessage}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {status !== "connected" ? (
            <button
              onClick={handleConnect}
              disabled={!isSupported || status === "connecting"}
              className="btn btn-primary w-full py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
              </svg>
              <span>{status === "connecting" ? "Connecting..." : "Pair Muse Headband"}</span>
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="btn btn-outline w-full py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              Disconnect Headset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
