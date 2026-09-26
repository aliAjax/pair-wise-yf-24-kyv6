const PREFIX = "policy-diff.";

export function readRows<T>(key: string, fallback: readonly T[]): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // 本地数据缺失或损坏时回退种子数据,保证页面可用
  }
  return fallback.map((row) => ({ ...(row as object) }) as T);
}

export function writeRows<T>(key: string, rows: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(rows));
}

export function upsertRow<T extends { id: number }>(key: string, fallback: readonly T[], row: T): { rows: T[]; created: boolean } {
  const rows = readRows(key, fallback);
  const index = rows.findIndex((item) => item.id === row.id);
  const created = index < 0;
  if (created) rows.push(row);
  else rows[index] = row;
  writeRows(key, rows);
  return { rows, created };
}
