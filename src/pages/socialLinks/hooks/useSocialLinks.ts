import { useCallback, useEffect, useState } from 'react';
import type { UseFormGetValues } from 'react-hook-form';
import type { FormSchemaType } from '@/schema/FormSchema';
import { fetchGitHubProfile } from '../utils/FetchGitHubProfile';
import { fetchPageMetadata } from '../utils/FetchPageMetadata';

// 코드의 의미: 소셜 링크 상태와 로직을 관리하는 커스텀 훅
// 왜 사용했는지: GitHub와 포트폴리오 링크 관련 상태와 로직을 캡슐화
export const useSocialLinks = (getValues: UseFormGetValues<FormSchemaType>) => {
  // 코드의 의미: GitHub 프로필 데이터 상태 관리
  // 왜 사용했는지: GitHub 프로필 정보를 저장
  const [githubData, setGithubData] = useState<{
    avatar_url: string;
    login: string;
    bio: string;
  } | null>(null);

  // 코드의 의미: 포트폴리오 메타데이터 상태 관리
  // 왜 사용했는지: 포트폴리오 링크 정보를 저장
  const [portfolioData, setPortfolioData] = useState<{
    title: string;
    description: string;
    image: string;
  } | null>(null);

  // 코드의 의미: GitHub URL 변경 핸들러
  // 왜 사용했는지: GitHub URL 입력 시 프로필 정보 가져오기
  const handleGitHubChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      if (!url) {
        setGithubData(null);
        return;
      }

      try {
        const username = url.split('/').pop();
        if (username) {
          const data = await fetchGitHubProfile(username);
          setGithubData(data);
        } else {
          setGithubData(null);
        }
      } catch (error) {
        console.error('GitHub 프로필 가져오기 실패:', error);
        setGithubData(null);
      }
    },
    []
  );

  // 코드의 의미: 포트폴리오 URL 변경 핸들러
  // 왜 사용했는지: 포트폴리오 URL 입력 시 메타데이터 가져오기
  const handlePortfolioChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      if (!url) {
        setPortfolioData(null);
        return;
      }

      try {
        const data = await fetchPageMetadata(url);
        setPortfolioData(data);
      } catch (error) {
        console.error('포트폴리오 메타데이터 가져오기 실패:', error);
        setPortfolioData(null);
      }
    },
    []
  );

  // 코드의 의미: GitHub URL 값을 변수로 추출
  // 왜 사용했는지: 의존성 배열에서 복잡한 표현식 제거
  const githubUrl = getValues().github ?? '';

  // 코드의 의미: 포트폴리오 URL 값을 변수로 추출
  // 왜 사용했는지: 의존성 배열에서 복잡한 표현식 제거
  const portfolioUrl = getValues().portfolio ?? '';

  // 코드의 의미: GitHub URL 변경 시 데이터 초기화
  // 왜 사용했는지: URL 변경 시 이전 데이터 초기화
  useEffect(() => {
    setGithubData(null);
  }, [githubUrl]);

  // 코드의 의미: 포트폴리오 URL 변경 시 데이터 초기화
  // 왜 사용했는지: URL 변경 시 이전 데이터 초기화
  useEffect(() => {
    setPortfolioData(null);
  }, [portfolioUrl]);

  return {
    githubData,
    portfolioData,
    handleGitHubChange,
    handlePortfolioChange,
  };
};
