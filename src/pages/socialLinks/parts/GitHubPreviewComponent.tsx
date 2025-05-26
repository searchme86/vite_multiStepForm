import AnimatedWrapper from '@/components/motion/AnimatedWrapper';
import AvatarMotion from '@/components/motion/AvatarMotion';
import ProfileInfoMotion from '@/components/motion/ProfileInfoMotion';

// 코드의 의미: GitHub 프로필 미리보기 서브 컴포넌트
// 왜 사용했는지: GitHub 프로필 정보를 시각적으로 표시
function GitHubPreviewComponent({
  avatar_url,
  login,
  bio,
}: {
  avatar_url: string;
  login: string;
  bio: string;
}) {
  return (
    <AnimatedWrapper>
      <div className="flex items-start gap-4">
        <AvatarMotion>
          <img
            src={avatar_url}
            alt="GitHub 아바타"
            width={50}
            height={50}
            className="rounded-full"
          />
        </AvatarMotion>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{login}</span>
          </div>
          {bio && (
            <ProfileInfoMotion className="text-sm text-muted-foreground">
              {bio}
            </ProfileInfoMotion>
          )}
        </div>
      </div>
    </AnimatedWrapper>
  );
}

export default GitHubPreviewComponent;
