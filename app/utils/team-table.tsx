import { UserIcon, UsersIcon } from 'lucide-react';

import { z } from 'zod';

export const roles = [
  {
    value: 'owner',
    label: 'Owner',
    icon: UsersIcon
  },
  {
    value: 'user',
    label: 'User',
    icon: UserIcon
  }
];

export const tableSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string()
});
