import { ReactNode } from 'react';
import {
  Card,
  MantineSpacing,
  MantineStyleProp,
  useMantineColorScheme,
} from '@mantine/core';
import eleCss from '@/ui/css/elements.module.css';

export default function MV4Card({
  children = null,
  pd = 'lg',
  style = {},
}: {
  children: ReactNode;
  pd?: MantineSpacing;
  style?: MantineStyleProp;
}) {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Card
      shadow="sm"
      padding={pd}
      radius="md"
      withBorder
      className={`${eleCss.appShellBg} ${
        colorScheme === 'light' ? eleCss.appShellBgLight : ''
      }`}
      style={style}
    >
      {children}
    </Card>
  );
}
