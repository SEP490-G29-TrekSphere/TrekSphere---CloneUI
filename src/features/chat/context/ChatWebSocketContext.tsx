import type { Client } from '@stomp/stompjs';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { createStompClient } from '@/lib/stompClient';

interface ChatWebSocketContextType {
  client: Client | null;
  isConnected: boolean;
}

const ChatWebSocketContext = createContext<ChatWebSocketContextType>({
  client: null,
  isConnected: false,
});

export const useChatWebSocket = () => useContext(ChatWebSocketContext);

export const ChatWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const stompClient = createStompClient();

    stompClient.onConnect = () => {
      setIsConnected(true);
      if (import.meta.env.DEV) {
        console.log('[STOMP] Connected to WebSocket');
      }
    };

    stompClient.onDisconnect = () => {
      setIsConnected(false);
      if (import.meta.env.DEV) {
        console.log('[STOMP] Disconnected from WebSocket');
      }
    };

    stompClient.onWebSocketError = (error) => {
      console.error('[STOMP] WebSocket Error:', error);
    };

    stompClient.onStompError = (frame) => {
      console.error('[STOMP] Broker Error:', frame.headers['message'], frame.body);
    };

    // Bắt đầu kết nối
    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
      setIsConnected(false);
    };
  }, []);

  return (
    <ChatWebSocketContext.Provider value={{ client, isConnected }}>
      {children}
    </ChatWebSocketContext.Provider>
  );
};
