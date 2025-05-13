import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Textarea} from './ui/textarea';
import { Input} from './ui/input';
import { Badge } from './ui/badge';
import { type BlogPostFormData } from '../types/blog-post';

function ContentSection() {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BlogPostFormData>();
  const tags = watch('tags') || [];

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setValue('tags', [...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <div className="space-y-6">
      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <div>
            <Textarea
              placeholder="포스트 내용을 작성하세요..."
              rows={10}
              {...field}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>
        )}
      />
      <div className="space-y-2">
        <Input
          placeholder="태그를 입력하고 Enter 키를 누르세요"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const input = e.target as HTMLInputElement;
              handleAddTag(input.value);
              input.value = '';
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        {errors.tags && (
          <p className="text-sm text-red-500">{errors.tags.message}</p>
        )}
      </div>
    </div>
  );
}

export default ContentSection;
