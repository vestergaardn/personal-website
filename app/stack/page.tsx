export default function Stack() {
  const tools = [
    { name: "Conductor", description: "Interface for managing agents", price: 0 },
    { name: "Claude Code Max", description: "Coding model", price: 200 },
    { name: "Paper Design", description: "Adding shaders to design", price: 0 },
    { name: "Figma", description: "Constructing designs", price: 20 },
    { name: "Vercel", description: "Deploying and managing domains", price: 20 },
    { name: "InstantDB", description: "Database for most apps", price: 0 },
    { name: "Field Notes", description: "Notebook for sketching", price: 0 },
  ];

  const total = tools.reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="min-h-screen px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-2xl">Stack</h1>
        <p className="mt-1 text-sm text-gray-500">Last updated April 2025</p>

        <ul className="mt-10 space-y-6">
          {tools.map((tool) => (
            <li key={tool.name} className="flex items-baseline justify-between">
              <div>
                <span className="font-medium">{tool.name}</span>
                <span className="ml-2 text-sm text-gray-500">{tool.description}</span>
              </div>
              <span className="shrink-0 text-sm tabular-nums text-gray-500">
                {tool.price === 0 ? "Free" : `$${tool.price}/mo`}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-baseline justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
          <span className="text-sm text-gray-500">Total</span>
          <span className="font-medium tabular-nums">${total}/mo</span>
        </div>

        <div className="mt-16 space-y-4 text-sm text-gray-500 leading-relaxed">
          <p>
            Inspiration is my biggest stack hack. I scroll Pinterest and Twitter
            for inspiration, and aggregate it in a Figma file.
          </p>
          <p>
            In the agentic coding era, I&apos;m pretty much language agnostic. I
            do most of the time use TypeScript, React, and CSS if possible.
          </p>
        </div>
      </div>
    </div>
  );
}
