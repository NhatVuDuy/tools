export default function BuildInfo() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE
    ? new Date(process.env.NEXT_PUBLIC_BUILD_DATE).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return (
    <div className="fixed bottom-2 right-3 text-[10px] text-gray-700 font-mono select-none">
      v{version} · {buildDate}
    </div>
  );
}
