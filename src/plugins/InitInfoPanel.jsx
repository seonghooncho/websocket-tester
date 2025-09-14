// src/plugins/InitInfoPanel.jsx
export default function InitInfoPanel({ api }) {
  const info = api.initInfo;

  return (
    <div>
      <p style={{ marginTop: 0, color: '#888' }}>
        1) <code>GET /livekit/init-info?workspaceId=...</code> 결과
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
        <input
          value={api.workspaceId}
          onChange={(e) => api.setWorkspaceId(e.target.value)}
          placeholder="Workspace ID"
          style={{ padding: 6, borderRadius: 8, border: '1px solid #444', width: 160 }}
        />
        <button onClick={api.fetchInitInfo} disabled={api.initLoading || !api.workspaceId}
                style={{ padding: '6px 10px', borderRadius: 8 }}>
          {api.initLoading ? 'Loading…' : 'Load'}
        </button>
      </div>

      {info ? (
        <pre style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          background: '#0f0f0f',
          color: '#ddd',
          padding: 10,
          borderRadius: 6,
          minHeight: 120,
          maxHeight: 360,
          overflow: 'auto'
        }}>
{JSON.stringify(info, null, 2)}
        </pre>
      ) : (
        <div style={{ color: '#aaa' }}>
          아직 로드되지 않았습니다. Workspace ID를 입력하고 <b>Load</b>를 눌러주세요.
        </div>
      )}
    </div>
  );
}
