import FirstNameField from './FirstNameField';
import LastNameField from './LastNameField';
import PhoneNumberField from './PhoneNumberField';

function PersonalInputComponent() {
  return (
    <div className="flex flex-wrap gap-4">
      {' '}
      {/* 원본의 grid-cols-4를 flex-wrap으로 대체 */}
      <div className="flex-1 min-w-[200px]">
        <FirstNameField />
      </div>
      <div className="flex-1 min-w-[200px]">
        <LastNameField />
      </div>
      <div className="flex-1 min-w-[200px]">
        <PhoneNumberField />
      </div>
      <div className="flex-1 min-w-[200px]"></div> {/* 빈 공간으로 4열 맞춤 */}
    </div>
  );
}

export default PersonalInputComponent;
