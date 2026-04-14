import Link from "next/link";

const links = [
  {
    title: "Historical Tech Tree",
    url: "https://www.historicaltechtree.com/",
    description: "An interactive visualization of how technologies evolved and influenced each other throughout history.",
  },
];

export default function LinksPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg px-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
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
                <span className="font-medium group-hover:underline">
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
