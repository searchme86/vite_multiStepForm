import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Switch } from './ui/switch';
import { type BlogPostFormData } from '../types/blog-post';

function PublishSection() {
  const { control } = useFormContext<BlogPostFormData>();

  return (
    <div className="space-y-6">
      <Controller
        name="isDraft"
        control={control}
        render={({ field }) => (
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-medium font-medium">초안으로 저장</h3>
              <p className="text-sm text-gray-500">
                포스트를 초안으로 저장하여 나중에 편집할 수 있습니다.
              </p>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
      <Controller
        name="isPublic"
        control={control}
        render={({ field }) => (
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-medium font-medium">공개 포스트</h3>
              <p className="text-sm text-gray-500">
                포스트를 모두에게 공개합니다.
              </p>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
    </div>
  );
}

export default PublishSection;
