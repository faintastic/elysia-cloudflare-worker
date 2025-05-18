export function getIP(headers: any): string {
  let ip: string;

  if (headers.get("cf-connecting-ip")) {
    ip = headers.get("cf-connecting-ip");
  } else if (headers.get("x-forwarded-for")) {
    ip = headers.get("x-forwarded-for");
  } else if (headers.get("x-real-ip")) {
    ip = headers.get("x-real-ip");
  } else {
    ip = "127.0.0.1"
  }

  return ip;
}