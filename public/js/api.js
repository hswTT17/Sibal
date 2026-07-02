export async function fetchApps() {
  const res = await fetch("/api/apps");
  if (!res.ok) throw new Error("Failed to load apps");
  return res.json(); // { apps, disclaimer }
}

export function formatKRW(amount) {
  return `약 ${amount.toLocaleString("ko-KR")}원`;
}
