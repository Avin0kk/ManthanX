"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type Document = {
  id: string;
  title: string;
  source_type: string;
  created_at: string;
};

export default function DocumentPanel() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchDocuments() {
    try {
      const res = await fetch(`${API_URL}/documents`);
      const data = await res.json();
      setDocuments(data);
    } catch {
      setError("Could not load documents");
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || "Upload failed");
      }
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`${API_URL}/documents/${id}`, { method: "DELETE" });
      await fetchDocuments();
    } catch {
      setError("Could not delete document");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <p className="font-mono text-xs text-teal mb-3">DOCUMENTS</p>

      <div className="flex flex-col gap-2 mb-4 overflow-y-auto flex-1">
        {documents.length === 0 && (
          <p className="text-sm text-ink/50">No documents yet</p>
        )}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between gap-2 border border-hairline rounded-sm px-3 py-2 text-sm"
          >
            <span className="truncate">{doc.title}</span>
            <button
              onClick={() => handleDelete(doc.id)}
              className="text-ink/40 hover:text-critic text-xs shrink-0"
            >
              remove
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-critic mb-2">{error}</p>}

      <label className="border border-hairline rounded-sm px-3 py-2 text-sm text-center cursor-pointer hover:border-teal transition-colors">
        {uploading ? "Uploading..." : "Upload document"}
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}