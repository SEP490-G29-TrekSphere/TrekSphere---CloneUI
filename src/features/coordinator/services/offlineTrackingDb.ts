import type { TrackingOfflineRecord } from '../types';

const DATABASE_NAME = 'treksphere-tracking-offline';
const DATABASE_VERSION = 1;
const SESSION_STORE = 'sessions';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Trình duyệt không hỗ trợ lưu dữ liệu offline.'));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(SESSION_STORE)) {
        database.createObjectStore(SESSION_STORE, { keyPath: 'sessionId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Không thể mở bộ nhớ offline.'));
  });
}

export async function getOfflineRecord(
  sessionId: string
): Promise<TrackingOfflineRecord | undefined> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SESSION_STORE, 'readonly');
    const request = transaction.objectStore(SESSION_STORE).get(sessionId);
    request.onsuccess = () => resolve(request.result as TrackingOfflineRecord | undefined);
    request.onerror = () => reject(request.error ?? new Error('Không thể đọc dữ liệu offline.'));
    transaction.oncomplete = () => database.close();
  });
}

export async function putOfflineRecord(record: TrackingOfflineRecord): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SESSION_STORE, 'readwrite');
    transaction.objectStore(SESSION_STORE).put(record);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Không thể lưu dữ liệu offline.'));
    };
  });
}

export async function updateOfflineRecord(
  sessionId: string,
  updater: (record: TrackingOfflineRecord) => TrackingOfflineRecord
): Promise<TrackingOfflineRecord> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(SESSION_STORE, 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.get(sessionId);
    let updated: TrackingOfflineRecord | undefined;

    request.onsuccess = () => {
      const current = request.result as TrackingOfflineRecord | undefined;
      if (!current) {
        transaction.abort();
        reject(new Error('Chưa tải gói dữ liệu offline cho phiên tour này.'));
        return;
      }
      updated = updater(current);
      store.put(updated);
    };
    request.onerror = () => reject(request.error ?? new Error('Không thể đọc dữ liệu offline.'));
    transaction.oncomplete = () => {
      database.close();
      if (updated) resolve(updated);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Không thể cập nhật dữ liệu offline.'));
    };
    transaction.onabort = () => database.close();
  });
}
