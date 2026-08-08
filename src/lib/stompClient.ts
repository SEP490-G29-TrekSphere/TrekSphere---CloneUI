import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { storage } from '@/utils/storage';

export const getWebSocketUrl = (): string => {
  const isDev = import.meta.env.DEV;
  if (isDev) {
    // Trong môi trường dev, Vite proxy sẽ chuyển tiếp `/ws` sang backend.
    // Trả về url tương đối để SockJS tự lấy origin hiện tại (localhost:3000)
    return '/ws';
  }

  // Trên production, url thường có dạng https://api.treksphere.io.vn/api/v1
  const rawUrl = import.meta.env.VITE_API_URL || 'https://api.treksphere.io.vn';
  // Xóa đuôi /api/v1 hoặc /api để lấy domain gốc
  const rootUrl = rawUrl.replace(/\/api(\/v\d+)?\/?$/, '');
  return `${rootUrl}/ws`;
};

export const createStompClient = (): Client => {
  const token = storage.get<string>('accessToken');
  const wsUrl = getWebSocketUrl();

  const client = new Client({
    // Sử dụng SockJS làm fallback (do BE dùng .withSockJS())
    webSocketFactory: () => new SockJS(wsUrl),

    // Gửi token qua headers để xác thực STOMP (nếu BE yêu cầu)
    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
    },

    // Debug info (chỉ hiển thị ở môi trường dev)
    debug: (str) => {
      if (import.meta.env.DEV) {
        console.log('[STOMP]:', str);
      }
    },

    // Cấu hình reconnect
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  return client;
};
