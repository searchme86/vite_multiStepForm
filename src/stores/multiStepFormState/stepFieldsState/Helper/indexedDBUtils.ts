import type { DBSchema } from 'idb';
import { openDB } from 'idb';

// IndexedDB 스키마 정의
// 마크다운 데이터를 저장하기 위한 스키마
interface BlogDB extends DBSchema {
  markdownStore: {
    key: string;
    value: string | undefined;
  };
}

// IndexedDB 초기화 및 데이터 조회
// 마크다운 데이터를 가져오는 함수
export const getMarkdownFromIndexedDB = async (): Promise<
  string | undefined
> => {
  // BlogDB 데이터베이스를 버전 1로 열기
  // 데이터베이스가 없으면 생성
  const db = await openDB<BlogDB>('BlogDB', 1, {
    upgrade(db) {
      // 마크다운 데이터 저장용 오브젝트 스토어 생성
      // 키는 문자열, 값은 마크다운 텍스트
      if (!db.objectStoreNames.contains('markdownStore')) {
        db.createObjectStore('markdownStore');
      }
    },
  });
  // 읽기 전용 트랜잭션 시작
  // 트랜잭션은 데이터 일관성을 보장
  const tx = db.transaction('markdownStore', 'readonly');
  // 마크다운 스토어 접근
  const store = tx.objectStore('markdownStore');
  // 'markdown' 키로 데이터 조회
  const value = await store.get('markdown');
  // 트랜잭션 완료 대기
  await tx.done;
  // 조회된 값 반환, 없으면 undefined
  return value;
};

// IndexedDB에 데이터 저장
// 마크다운 데이터를 저장하는 함수
export const setMarkdownInIndexedDB = async (markdown: string | undefined) => {
  // BlogDB 데이터베이스를 버전 1로 열기
  const db = await openDB<BlogDB>('BlogDB', 1);
  // 읽기/쓰기 트랜잭션 시작
  // 데이터 수정이 가능하도록 설정
  const tx = db.transaction('markdownStore', 'readwrite');
  // 마크다운 스토어 접근
  const store = tx.objectStore('markdownStore');
  // 'markdown' 키에 데이터 저장
  await store.put(markdown, 'markdown');
  // 트랜잭션 완료 대기
  await tx.done;
};

// IndexedDB 데이터 삭제
// 마크다운 데이터를 제거하는 함수
export const deleteMarkdownFromIndexedDB = async () => {
  // BlogDB 데이터베이스를 버전 1로 열기
  const db = await openDB<BlogDB>('BlogDB', 1);
  // 읽기/쓰기 트랜잭션 시작
  const tx = db.transaction('markdownStore', 'readwrite');
  // 마크다운 스토어 접근
  const store = tx.objectStore('markdownStore');
  // 'markdown' 키 데이터 삭제
  await store.delete('markdown');
  // 트랜잭션 완료 대기
  await tx.done;
};
