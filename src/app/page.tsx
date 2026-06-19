import Link from "next/link";

const tools = [
  {
    href: "/morse",
    name: "Morse Code",
    description: "Học mã Morse qua bảng cây tương tác",
    emoji: "📡",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-16 px-4">
      <h1 className="text-3xl font-bold tracking-widest text-yellow-400 mb-2">Tools</h1>
      <p className="text-gray-500 mb-10 text-sm">Bộ công cụ học tập và tiện ích</p>
      <div className="grid gap-4 w-full max-w-md">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex items-center gap-4 p-5 rounded-xl bg-gray-900 border border-gray-700 hover:border-yellow-500 transition-all group"
          >
            <span className="text-3xl">{tool.emoji}</span>
            <div>
              <div className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                {tool.name}
              </div>
              <div className="text-sm text-gray-500">{tool.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
