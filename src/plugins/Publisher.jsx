// src/plugins/Publisher.jsx
export default function Publisher({ api }) {
  const sendPing = () => {
    const client = api.getClient();
    if (!client?.connected) return api.appendLog('Connect first to publish.');
    // 서버 @MessageMapping("/ping") 같은 엔드포인트가 있을 때
    client.publish({
      destination: '/app/ping',
      body: JSON.stringify({ at: Date.now(), roomId: api.roomId }),
    });
    api.appendLog('Sent /app/ping');
  };

  return (
    <div>
      <p style={{ marginTop: 0, color: '#888' }}>서버로 메시지 보내기 (옵션)</p>
      <button onClick={sendPing} style={{ padding: '6px 10px', borderRadius: 8 }}>
        /app/ping 보내기
      </button>
    </div>
  );
}
