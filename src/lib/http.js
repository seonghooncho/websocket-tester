// src/lib/http.js
export async function getInitInfo({ token, workspaceId }) {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const url = new URL(`${base}/livekit/init-info`);
  // 쿼리 파라미터로 long 형식 workspaceId 전달
  url.searchParams.set('workspaceId', String(workspaceId));

  const headers = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers,
    credentials: 'include', // 쿠키 기반 인증이면 유지
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`init-info fail: ${res.status} ${text}`);
  }
  return res.json();
}
