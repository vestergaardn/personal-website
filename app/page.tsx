import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p>Building something new</p>
        <p className="mt-2 font-bold">Christian Vestergaard</p>
        <p className="mt-1 text-sm text-gray-500">Designer and Engineer</p>
        <nav className="mt-4 flex gap-4 justify-center">
          <Link href="/links" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Links
          </Link>
          <Link href="/stack" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Stack
          </Link>
        </nav>
      </div>
    </div>
  );
}
