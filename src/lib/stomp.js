import { Client } from '@stomp/stompjs';

export function createStompClient({ url, token, onConnect, onError }) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const client = new Client({
    brokerURL: url,
    connectHeaders: headers,
    debug: (str) => console.log('[STOMP]', str),
    reconnectDelay: 2000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect,
    onStompError: (frame) => {
      console.error('[STOMP ERROR]', frame.headers['message'], frame.body);
      onError?.(frame);
    },
    onWebSocketError: (e) => {
      console.error('[WS ERROR]', e);
      onError?.(e);
    },
  });

  return client;
}

export function subscribeRoomTopic(client, roomId, onMessage) {
  const dest = `/topic/room/${roomId}`;
  const sub = client.subscribe(dest, onMessage);
  return { unsubscribe: () => sub.unsubscribe() };
}
