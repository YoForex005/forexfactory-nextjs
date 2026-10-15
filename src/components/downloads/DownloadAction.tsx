"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { getToken } from "@/lib/auth-client";

type DownloadActionProps = {
  signalId: number;
  uuid: string;
  title: string;
  type: string;
  fileSize: string | null;
  className?: string;
  label?: string;
};

export function DownloadAction({ signalId, uuid, title, type, fileSize, className = "", label = "Download files" }: DownloadActionProps) {
  const [isPreparing, setIsPreparing] = useState(false);

  async function handleDownload() {
    if (isPreparing) return;
    setIsPreparing(true);

    const token = getToken();
    if (token) {
      // Personal download history is optional. Do not make a file handoff wait
      // for it, because an expired session or slow request must not leave the
      // primary download button in a loading state.
      void fetch("/api/user/downloads", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ signalId, title, type, fileSize }),
        }).catch(() => {
          // Download availability must not depend on personal-history tracking.
        });
    }

    window.location.assign(`/api/download/${uuid}`);
    // A ZIP response can be saved by the browser while this page remains open.
    // Restore the control in that case; a normal navigation unmounts it first.
    window.setTimeout(() => setIsPreparing(false), 1200);
  }

  return (
    <button type="button" onClick={handleDownload} disabled={isPreparing} className={className}>
      {isPreparing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
      {isPreparing ? "Preparing download..." : label}
    </button>
  );
}
