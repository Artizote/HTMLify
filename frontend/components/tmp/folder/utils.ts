export function isExpired(expiry: string) {
  return new Date(expiry).getTime() <= Date.now();
}
