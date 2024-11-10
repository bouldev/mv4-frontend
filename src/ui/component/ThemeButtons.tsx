import {
  ActionIcon,
  Flex,
  MantineColor,
  MantineColorScheme,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconMoonStars,
  IconShirt,
  IconSun,
  IconSunMoon,
} from '@tabler/icons-react';
import { useModel } from '@modern-js/runtime/model';
import { ThemeSwitchModel } from '@/model/UIModel';

interface BaseCSConf {
  color: MantineColor;
  text: string;
  icon: JSX.Element;
}

const CSList: {
  auto: BaseCSConf;
  light: BaseCSConf;
  dark: BaseCSConf;
} = {
  auto: {
    color: 'blue',
    text: '自动模式',
    icon: <IconSunMoon />,
  },
  light: {
    color: 'yellow',
    text: '浅色模式',
    icon: <IconSun />,
  },
  dark: {
    color: 'blue',
    text: '深色模式',
    icon: <IconMoonStars />,
  },
};

export function ThemeButtons() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [themeState, themeActions] = useModel(ThemeSwitchModel);
  function toggleColorScheme() {
    const arr = Object.keys(CSList);
    const now = arr.indexOf(colorScheme);
    let next = now + 1;
    if (next > 2) {
      next = 0;
    }
    setColorScheme(arr[next] as MantineColorScheme);
  }

  return (
    <Flex gap={'xs'}>
      <ActionIcon
        variant="light"
        size="lg"
        onClick={() => {
          if (themeState.style === 'default') {
            themeActions.changeStyle('anime');
          } else {
            themeActions.changeStyle('default');
          }
        }}
      >
        <IconShirt />
      </ActionIcon>
      <Tooltip label={CSList[colorScheme].text}>
        <ActionIcon
          variant="light"
          size="lg"
          color={CSList[colorScheme].color}
          onClick={() => toggleColorScheme()}
        >
          {CSList[colorScheme].icon}
        </ActionIcon>
      </Tooltip>
    </Flex>
  );
}
