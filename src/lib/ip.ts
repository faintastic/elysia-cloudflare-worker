
/**
 * Responds with the client's IP address based on request headers.
 * @param headers - Request headers
 * @returns IP address as string
 */
export function getIP(headers: Headers): string {
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const firstIp = xForwardedFor.split(',')[0];
    return firstIp ? firstIp.trim() : "127.0.0.1";
  }

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  return "127.0.0.1";
}