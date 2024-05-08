import { ReactNode } from 'react';
import { Title } from '@mantine/core';

export default function PageTitle({ children }: { children: ReactNode }) {
  return (
    <Title order={3} hiddenFrom={'sm'}>
      {children}
    </Title>
  );
}
