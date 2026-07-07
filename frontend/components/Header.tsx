import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-hairline">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">
          ManthanX
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="hover:text-saffron transition-colors">
            Home
          </Link>
          <Link href="/chat" className="hover:text-saffron transition-colors">
            Chat
          </Link>
        </nav>
      </div>
    </header>
  );
}