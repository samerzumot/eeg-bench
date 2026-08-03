"use client";

import { useEffect, useRef } from "react";

/**
 * Draws a subtle multichannel EEG-like trace — purely decorative.
 * Uses Brownian motion (random walk) to simulate realistic EEG waveforms.
 */
export function EegTrace({
  channels = 5,
  className = "",
}: {
  channels?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const channelHeight = height / channels;

    // Store waveform data for each channel — a buffer of x values
    const bufferSize = Math.ceil(width / 1.5) + 10;
    const buffers: number[][] = Array.from({ length: channels }, () => {
      const buf: number[] = [];
      let val = 0;
      for (let i = 0; i < bufferSize; i++) {
        val += (Math.random() - 0.5) * 2.4;
        val *= 0.98; // slight mean-reversion for stability
        buf.push(val);
      }
      return buf;
    });

    const colors = [
      "rgba(59, 155, 143, 0.25)",  // muted teal
      "rgba(134, 134, 139, 0.18)", // gray
      "rgba(59, 155, 143, 0.20)",
      "rgba(134, 134, 139, 0.15)",
      "rgba(59, 155, 143, 0.18)",
    ];

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (let ch = 0; ch < channels; ch++) {
        const buf = buffers[ch];
        const centerY = channelHeight * (ch + 0.5);
        const amplitude = channelHeight * 0.3;

        // Advance the waveform: push new sample, shift old
        let lastVal = buf[buf.length - 1];
        lastVal += (Math.random() - 0.5) * 2.4;
        lastVal *= 0.98;
        buf.push(lastVal);
        buf.shift();

        // Draw
        ctx.beginPath();
        ctx.strokeStyle = colors[ch % colors.length];
        ctx.lineWidth = 1;

        for (let i = 0; i < buf.length; i++) {
          const x = i * 1.5;
          const y = centerY + buf[i] * (amplitude / 8);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [channels]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
