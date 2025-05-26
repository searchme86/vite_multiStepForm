import { PersonInfoSchema } from '../../../pages/write/basicFormSection/parts/personInfo/parts/personalForm/schema/PersonSchema';
import { blogPostSchema } from '../../../pages/write/schema/blogPostSchema';

import { z } from 'zod';

export const MultiStepSchema = blogPostSchema.merge(PersonInfoSchema);

export type MultiStepSchemaType = z.infer<typeof MultiStepSchema>;
