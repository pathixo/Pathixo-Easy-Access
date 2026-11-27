"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  inquiryId: string;
  currentStatus: string;
}

export function InquiryStatusSelector({ inquiryId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_status: newStatus }),
      });
    } catch {
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={status}
        onChange={handleChange}
        disabled={isUpdating}
        className="h-8 rounded-lg border border-white/10 bg-[#161622] px-2 text-[11px] font-semibold text-white focus:border-brand-500 focus:outline-none"
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="in_discussion">In Discussion</option>
        <option value="converted">Converted</option>
        <option value="closed">Closed</option>
      </select>
      {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-brand-400" />}
    </div>
  );
}
