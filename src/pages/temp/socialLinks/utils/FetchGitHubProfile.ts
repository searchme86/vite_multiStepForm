// 코드의 의미: GitHub 프로필 정보를 가져오는 함수
// 왜 사용했는지: GitHub API를 통해 사용자 프로필 정보 요청
export const fetchGitHubProfile = async (
  username: string
): Promise<{
  avatar_url: string;
  login: string;
  bio: string;
}> => {
  try {
    // 실제 API 호출은 GitHub API로 대체 가능
    // 여기서는 모의 데이터로 대체 (2025-05-19 기준 GitHub API 엔드포인트 사용 예시)
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('GitHub 프로필을 가져오지 못했습니다.');
    }

    const data = await response.json();
    return {
      avatar_url: data.avatar_url || '',
      login: data.login || username,
      bio: data.bio || '',
    };
  } catch (error) {
    console.error('GitHub 프로필 가져오기 실패:', error);
    throw error;
  }
};
