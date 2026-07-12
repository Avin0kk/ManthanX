"use client";

type Props = {
  open: boolean;
  title: string;
  summary: string | null;
  onClose: () => void;
};

export default function DocumentPreviewModal({ open, title, summary, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-paper border border-hairline rounded-sm p-6 max-w-md w-full mx-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-xs text-teal mb-1">PREVIEW</p>
        <p className="font-display text-lg mb-4">{title}</p>
        {summary ? (
          <p className="text-sm text-ink/80 leading-relaxed">{summary}</p>
        ) : (
          <p className="text-sm text-ink/50 italic">Summary not available for this document.</p>
        )}
        <button
          onClick={onClose}
          className="mt-6 text-sm px-4 py-2 rounded-sm border border-hairline hover:bg-hairline/30 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}