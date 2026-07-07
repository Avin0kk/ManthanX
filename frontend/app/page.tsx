import Link from "next/link";

const agents = [
  { name: "Router", angle: -90, desc: "Decides how to handle your question" },
  { name: "Researcher", angle: 0, desc: "Retrieves relevant document chunks" },
  { name: "Critic", angle: 90, desc: "Verifies retrieved content is sufficient" },
  { name: "Synthesizer", angle: 180, desc: "Writes the final, cited answer" },
];

function polarPoint(angle: number, radius: number, cx: number, cy: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export default function Home() {
  const cx = 200;
  const cy = 200;
  const radius = 140;

  return (
    <main className="max-w-5xl mx-auto px-6">
      <section className="grid md:grid-cols-2 gap-12 items-center py-20">
        <div>
          <h1 className="font-display text-5xl font-semibold leading-tight mb-6">
            Ask your documents anything.
          </h1>
          <p className="text-lg text-ink/80 mb-8">
            Watch four agents figure it out together — routing, researching,
            verifying, and synthesizing a cited answer in real time.
          </p>
          <Link
            href="/chat"
            className="inline-block bg-ink text-paper px-6 py-3 rounded-sm font-medium hover:bg-teal transition-colors"
          >
            Start a conversation
          </Link>
        </div>

        <div className="flex justify-center">
          <svg width="520" height="400" viewBox="-60 0 520 400">
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--color-hairline)"
              strokeWidth="1"
            />
            {agents.map((agent, i) => {
              const point = polarPoint(agent.angle, radius, cx, cy);
              const next = agents[(i + 1) % agents.length];
              const nextPoint = polarPoint(next.angle, radius, cx, cy);
              return (
                <g key={agent.name}>
                  <line
                    x1={point.x}
                    y1={point.y}
                    x2={nextPoint.x}
                    y2={nextPoint.y}
                    stroke="var(--color-saffron)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx={point.x} cy={point.y} r="8" fill="var(--color-teal)" />
                  <text
                    x={point.x + (agent.angle === 0 ? 15 : agent.angle === 180 ? -15 : 0)}
                    y={point.y + (agent.angle === -90 ? -20 : agent.angle === 90 ? 32 : 5)}
                    textAnchor={agent.angle === 0 ? "start" : agent.angle === 180 ? "end" : "middle"}
                    className="font-mono text-xs"
                    fill="var(--color-ink)"
                  >
                    {agent.name}
                  </text>
                </g>
              );
            })}
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              className="font-display text-lg"
              fill="var(--color-ink)"
            >
              churning
            </text>
          </svg>
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-8 py-16 border-t border-hairline">
        {agents.map((agent) => (
          <div key={agent.name}>
            <p className="font-mono text-xs text-teal mb-2">{agent.name.toUpperCase()}</p>
            <p className="text-sm text-ink/80">{agent.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}