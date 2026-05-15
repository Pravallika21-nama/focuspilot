export function formatShortDate(date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
}

export function isSameDay(a, b) {
  const left = new Date(a);
  const right = new Date(b);
  return left.toDateString() === right.toDateString();
}

export function daysUntil(date) {
  return Math.ceil((new Date(date) - new Date()) / 86400000);
}
