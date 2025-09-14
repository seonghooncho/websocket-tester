// src/App.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { createStompClient, subscribeRoomTopic } from './lib/stomp';
import { getInitInfo } from './lib/http';

export default function App({ plugins = [] }) {
  const [roomId, setRoomId] = useState('test-room-1'); // 필요 시 init-info 결과로 갱신 가능
  const [workspaceId, setWorkspaceId] = useState('');  // <= 추가
  const [token, setToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);

  const [initInfo, setInitInfo] = useState(null);
  const [initLoading, setInitLoading] = useState(false);

  const clientRef = useRef(null);
  const subRef = useRef(null);

  const wsUrl = useMemo(() => import.meta.env.VITE_WS_URL, []);

  useEffect(() => {
    return () => {
      if (subRef.current) subRef.current.unsubscribe();
      clientRef.current?.deactivate();
    };
  }, []);

  const appendLog = (line) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}  ${line}`, ...prev].slice(0, 400));
  };

  // 1) REST: init-info 불러오기 (workspaceId 필수)
  const fetchInitInfo = async () => {
    if (!workspaceId) {
      appendLog('INIT-INFO: workspaceId가 필요합니다.');
      return;
    }
    try {
      setInitLoading(true);
      const data = await getInitInfo({ token: token || undefined, workspaceId });
      setInitInfo(data);
      appendLog(`INIT-INFO loaded: ${JSON.stringify(data)}`);

      // 만약 init-info 응답에 roomId가 있으면 자동 세팅하고 싶다면:
      // if (data?.roomId) setRoomId(data.roomId);

      return data;
    } catch (e) {
      console.error(e);
      appendLog(`INIT-INFO error: ${e.message || String(e)}`);
      throw e;
    } finally {
      setInitLoading(false);
    }
  };

  // 2) WebSocket 연결/구독
  const connect = () => {
    if (clientRef.current?.connected) return;
    const client = createStompClient({
      url: wsUrl,
      token: token || undefined,
      onConnect: () => {
        setConnected(true);
        appendLog('Connected');
      },
      onError: (e) => appendLog(`Error: ${typeof e === 'string' ? e : JSON.stringify(e)}`),
    });
    client.activate();
    clientRef.current = client;
  };

  const disconnect = () => {
    if (subRef.current) {
      subRef.current.unsubscribe();
      subRef.current = null;
      appendLog('Unsubscribed');
    }
    clientRef.current?.deactivate();
    setConnected(false);
    appendLog('Disconnected');
  };

  const subscribe = () => {
    const client = clientRef.current;
    if (!client?.connected) return appendLog('Connect first.');
    if (subRef.current)   return appendLog('Already subscribed. Unsubscribe first.');

    subRef.current = subscribeRoomTopic(client, roomId, (msg) => {
      try {
        const body = JSON.parse(msg.body);
        appendLog(`MESSAGE ${msg.headers.destination}: ${JSON.stringify(body)}`);
      } catch {
        appendLog(`MESSAGE ${msg.headers.destination}: ${msg.body}`);
      }
    });

    appendLog(`Subscribed to /topic/room/${roomId}`);
  };

  const unsubscribe = () => {
    if (!subRef.current) return;
    subRef.current.unsubscribe();
    subRef.current = null;
    appendLog('Unsubscribed');
  };

  const api = {
    // 상태
    wsUrl, connected, logs, roomId, token, workspaceId,
    initInfo, initLoading,
    // 제어
    setRoomId, setToken, setWorkspaceId, appendLog,
    fetchInitInfo, connect, disconnect, subscribe, unsubscribe,
    // 저수준
    getClient: () => clientRef.current,
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Syncly WS Tester (Init→WS)</h1>
        <span style={{
          padding: '2px 8px', borderRadius: 999,
          background: connected ? '#1b5e20' : '#5e1b1b', color: 'white', fontSize: 12
        }}>
          {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </header>

      {/* 상단 컨트롤 */}
      <div style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(6, 1fr)',
        alignItems: 'end',
        marginBottom: 16
      }}>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          WS URL (.env)
          <input value={wsUrl} readOnly style={{ padding: 8, border: '1px solid #444', borderRadius: 8 }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Workspace ID (long)
          <input
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            placeholder="e.g. 9"
            style={{ padding: 8, border: '1px solid #444', borderRadius: 8 }}
            inputMode="numeric"
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Room ID
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="room-uuid"
            style={{ padding: 8, border: '1px solid #444', borderRadius: 8 }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          JWT (optional)
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Bearer 없이 순수 토큰만"
            style={{ padding: 8, border: '1px solid #444', borderRadius: 8 }}
          />
        </label>

        {/* 1) Init-info */}
        <button
          onClick={fetchInitInfo}
          disabled={initLoading || !workspaceId}
          style={{ padding: '8px 12px', borderRadius: 8 }}
        >
          {initLoading ? 'Loading…' : 'Load Init Info'}
        </button>

        {/* 2) 이후 WebSocket */}
        <div style={{ display: 'flex', gap: 8 }}>
          {!connected ? (
            <button onClick={connect} style={{ flex: 1, padding: '8px 12px', borderRadius: 8 }}>Connect</button>
          ) : (
            <button onClick={disconnect} style={{ flex: 1, padding: '8px 12px', borderRadius: 8 }}>Disconnect</button>
          )}
          <button onClick={subscribe} disabled={!connected} style={{ padding: '8px 12px', borderRadius: 8 }}>
            Subscribe
          </button>
          <button onClick={unsubscribe} disabled={!connected} style={{ padding: '8px 12px', borderRadius: 8 }}>
            Unsubscribe
          </button>
        </div>
      </div>

      {/* 플러그인 슬롯 */}
      {plugins.length > 0 && (
        <section style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          {plugins.map(({ id, title, Component }) => (
            <div key={id} style={{ border: '1px solid #333', borderRadius: 10, padding: 12 }}>
              {title && <h2 style={{ fontSize: 16, marginTop: 0 }}>{title}</h2>}
              <Component api={api} />
            </div>
          ))}
        </section>
      )}

      {/* 기본 로그 패널 */}
      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16 }}>Logs</h2>
        <div style={{
          border: '1px solid #333',
          borderRadius: 8,
          padding: 12,
          minHeight: 220,
          maxHeight: 420,
          overflow: 'auto',
          background: '#111',
          color: '#eee'
        }}>
          {logs.map((l, i) => (
            <div key={i} style={{ fontFamily: 'ui-monospace, monospace' }}>{l}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
