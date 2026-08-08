import type { Client } from '@stomp/stompjs';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { ensureFreshSession } from '@/config/apiClient';
import { hasValidAccessToken } from '@/lib/session';
import { createStompClient } from '@/lib/stompClient';
import { useAppStore } from '@/store/useAppStore';

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
  // `userId` là tín hiệu duy nhất cần theo dõi: `clearExpiredSession` luôn
  // `setUser(null)` khi phiên hết hạn, nên socket tự bị đóng qua cleanup của
  // effect; đăng nhập lại làm `userId` đổi → dựng client mới với token mới
  // (`connectHeaders` chỉ đọc token 1 lần lúc tạo, không sửa được sau đó).
  const userId = useAppStore((state) => state.user?.id ?? null);

  useEffect(() => {
    // Chưa đăng nhập → không mở socket. Trước đây provider luôn activate() dù
    // không có token, nên STOMP reconnect vô hạn mỗi 5s với header rỗng, và sau
    // khi phiên hết hạn thì vẫn giữ kết nối bằng token đã chết.
    if (!userId) {
      setClient(null);
      setIsConnected(false);
      return;
    }

    let stompClient: Client | null = null;
    let cancelled = false;

    // Access token có thể vừa hết hạn (vd: quay lại tab sau vài giờ) — refresh
    // trước khi bắt tay STOMP, vì `connectHeaders` không thể sửa sau khi kết nối.
    void (async () => {
      const ready = (await ensureFreshSession()) && hasValidAccessToken();
      if (cancelled || !ready) return;

      stompClient = createStompClient();

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
        console.error('[STOMP] Broker Error:', frame.headers.message, frame.body);
      };

      // Bắt đầu kết nối
      stompClient.activate();
      setClient(stompClient);
    })();

    return () => {
      cancelled = true;
      void stompClient?.deactivate();
      setClient(null);
      setIsConnected(false);
    };
  }, [userId]);

  return (
    <ChatWebSocketContext.Provider value={{ client, isConnected }}>
      {children}
    </ChatWebSocketContext.Provider>
  );
};
