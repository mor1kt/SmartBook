export function sendJson(res: any, status: number, body: any) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
}

export function getBearer(req: any): string | null {
  const header = String(req.headers.authorization || '');
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}
