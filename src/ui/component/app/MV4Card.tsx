import { ReactNode } from 'react';
import {
  Card,
  MantineSpacing,
  MantineStyleProp,
  useMantineColorScheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
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
  const systemColorScheme = useColorScheme();

  function getCurrentCS() {
    switch (colorScheme) {
      case 'auto': {
        return systemColorScheme;
      }
      default:
        return colorScheme;
    }
  }

  return (
    <Card
      shadow="sm"
      padding={pd}
      radius="md"
      withBorder
      className={`${eleCss.appShellBg} ${
        getCurrentCS() === 'light' && eleCss.appShellBgLight
      }`}
      style={style}
    >
      {children}
    </Card>
  );
}
