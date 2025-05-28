import type { DBSchema } from 'idb';
import { openDB } from 'idb';

interface BlogDB extends DBSchema {
  contentStore: {
    key: string;
    value: string | undefined;
  };
}

export const getContentFromIndexedDB = async (
  key: 'markdown' | 'richTextContent'
): Promise<string | undefined> => {
  const db = await openDB<BlogDB>('BlogDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('contentStore')) {
        db.createObjectStore('contentStore');
      }
    },
  });
  const tx = db.transaction('contentStore', 'readonly');
  const store = tx.objectStore('contentStore');
  const value = await store.get(key);
  await tx.done;
  return value;
};

export const setContentInIndexedDB = async (
  key: 'markdown' | 'richTextContent',
  content: string | undefined
) => {
  const db = await openDB<BlogDB>('BlogDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('contentStore')) {
        db.createObjectStore('contentStore');
      }
    },
  });
  const tx = db.transaction('contentStore', 'readwrite');
  const store = tx.objectStore('contentStore');
  await store.put(content, key);
  await tx.done;
};

export const deleteContentFromIndexedDB = async (
  key: 'markdown' | 'richTextContent'
) => {
  const db = await openDB<BlogDB>('BlogDB', 1);
  const tx = db.transaction('contentStore', 'readwrite');
  const store = tx.objectStore('contentStore');
  await store.delete(key);
  await tx.done;
};
