import { ReactNode } from 'react';
import { Card, useMantineColorScheme } from '@mantine/core';
import eleCss from '@/ui/css/elements.module.css';

export default function MV4Card({ children = null }: { children: ReactNode }) {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={`${eleCss.appShellBg} ${
        colorScheme === 'light' ? eleCss.appShellBgLight : ''
      }`}
    >
      {children}
    </Card>
  );
}
