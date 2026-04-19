"use client";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";

import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/dashboard";
import React from "react";

interface UppyDashboardCustomProps {
  uppy: Uppy;
  note?: string;
  height?: number;
  className?: string;
}

export const UppyDashboardCustom = ({
  uppy,
  note = "Max 20 files, up to 100MB each.",
  height = 380,
  className = "",
}: UppyDashboardCustomProps) => {
  return (
    <div className={`uppy-Dashboard-custom-container ${className}`}>
      <div
        className="rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-card transition-all hover:border-primary/20"
        style={
          {
            "--uppy-primary-button-bg": "var(--primary)",
            "--uppy-primary-button-font-color": "var(--primary-foreground)",
            "--uppy-font-family": "inherit",
            "--uppy-container-bg": "transparent",
          } as React.CSSProperties
        }
      >
        <Dashboard
          uppy={uppy}
          theme="dark"
          width="100%"
          height={height}
          proudlyDisplayPoweredByUppy={false}
          note={note}
        />
      </div>

      <style jsx global>{`
        /* Scoped overrides for Uppy to make it look native */
        .uppy-Dashboard-custom-container .uppy-Dashboard-inner {
          background-color: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }
        .uppy-Dashboard-custom-container .uppy-Dashboard-Content {
          background-color: transparent !important;
        }
        .uppy-Dashboard-custom-container .uppy-Dashboard-AddFiles {
          background-color: transparent !important;
        }
        .uppy-Dashboard-custom-container .uppy-Dashboard-AddFiles-title {
          font-weight: 600 !important;
          font-size: 1.25rem !important;
        }
        .uppy-Dashboard-custom-container .uppy-DashboardContent-bar {
          background-color: var(--card) !important;
          border-bottom: 1px solid var(--border) !important;
        }
        .uppy-Dashboard-custom-container .uppy-DashboardItem {
          background-color: var(--background) !important;
          border: 1px solid var(--border) !important;
          border-radius: 12px !important;
        }
        .uppy-Dashboard-custom-container .uppy-Button--primary {
          border-radius: 8px !important;
          transition: transform 0.2s ease !important;
        }
        .uppy-Dashboard-custom-container .uppy-Button--primary:hover {
          transform: translateY(-1px) !important;
        }
        .uppy-Dashboard-custom-container .uppy-StatusBar {
          background-color: var(--card) !important;
          border-top: 1px solid var(--border) !important;
        }
        .uppy-Dashboard-custom-container .uppy-Dashboard-note {
          color: var(--muted-foreground) !important;
        }
      `}</style>
    </div>
  );
};
