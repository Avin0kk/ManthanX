"use client";

type AgentStatus = "pending" | "active" | "complete";

type Props = {
  statuses: Record<string, AgentStatus>;
  criticNotes: string | null;
};

const AGENT_ORDER = ["router", "researcher", "critic", "synthesizer"];

export default function AgentActivityPanel({ statuses, criticNotes }: Props) {
  return (
    <div className="flex flex-col h-full">
      <p className="font-mono text-xs text-teal mb-3">AGENT ACTIVITY</p>

      <div className="flex flex-col gap-3">
        {AGENT_ORDER.map((agent) => {
          const status = statuses[agent] || "pending";
          return (
            <div key={agent} className="flex items-center gap-2 text-sm">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  status === "complete"
                    ? "bg-teal"
                    : status === "active"
                    ? "bg-saffron animate-pulse"
                    : "bg-hairline"
                }`}
              />
              <span className="capitalize">{agent}</span>
            </div>
          );
        })}
      </div>

      {criticNotes && (
        <div className="mt-6 pt-4 border-t border-hairline">
          <p className="font-mono text-xs text-ink/50 mb-2">CRITIC NOTES</p>
          <p className="text-xs text-ink/70">{criticNotes}</p>
        </div>
      )}
    </div>
  );
}