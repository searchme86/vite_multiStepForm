import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import NotificationProvider from '../../components/Notification';
import DisplayDate from '../../components/DisplayDate';
import StepFormContainer from '../../components/multiStepForm/StepFormContainer';
import PostIntroduction from './common/PostIntroduction';

function Write() {
  return (
    <div>
      <NotificationProvider>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">새 블로그 포스트 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <PostIntroduction />
            <DisplayDate />
            <StepFormContainer />
          </CardContent>
        </Card>
      </NotificationProvider>
    </div>
  );
}

export default Write;
