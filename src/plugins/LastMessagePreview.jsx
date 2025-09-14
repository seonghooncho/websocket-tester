// src/plugins/LastMessagePreview.jsx
export default function LastMessagePreview({ api }) {
  const last = api.logs[0] ?? '(no messages yet)';
  return (
    <div>
      <p style={{ marginTop: 0, color: '#888' }}>가장 최근 메시지/이벤트</p>
      <pre style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        background: '#0f0f0f',
        color: '#ddd',
        padding: 10,
        borderRadius: 6,
        minHeight: 80
      }}>{last}</pre>
      <button onClick={() => api.appendLog('Manual log from LastMessagePreview')}
              style={{ padding: '6px 10px', borderRadius: 8 }}>
        임의 로그 추가
      </button>
    </div>
  );
}
