import Link from "next/link";

const links = [
  {
    title: "Benji Taylor",
    url: "https://benji.org/",
    description: "Personal website of a designer who has founded consumer software companies and leads design at SpaceX.",
  },
  {
    title: "Historical Tech Tree",
    url: "https://www.historicaltechtree.com/",
    description: "An interactive visualization of how technologies evolved and influenced each other throughout history.",
  },
  {
    title: "Two Accidental Tyrannies",
    url: "https://andymatuschak.org/tat/",
    description: "Andy Matuschak on how coding agents and composable software could free interface design from programmer gatekeeping and app silos.",
  },
];

export default function LinksPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg px-6">
        <Link href="/" className="text-sm">
          ← Back
        </Link>
        <h1 className="mt-4 text-lg font-bold">Interesting Links</h1>
        <ul className="mt-6 space-y-4">
          {links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <span className="font-medium">
                  {link.title}
                </span>
                <p className="mt-0.5 text-sm text-gray-500">
                  {link.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
