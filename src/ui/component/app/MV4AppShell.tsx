import { ReactNode, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  AppShell,
  Box,
  Burger,
  Group,
  useMantineColorScheme,
} from '@mantine/core';
import { useModel } from '@modern-js/runtime/model';
import css from './mv4AppShell.module.css';
import FBLogoWhite from '@/assets/logo-white.svg';
import FBLogoBlack from '@/assets/logo-black.svg';
import MV4AppShellNavBar from '@/ui/component/app/MV4AppShellNavBar';
import { getThemeStyleCssName, ThemeSwitchModel } from '@/context/UIContext';
import bgCss from '@/ui/css/background.module.css';

export default function MV4AppShell({
  children = null,
}: {
  children: ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme } = useMantineColorScheme();
  const [themeState, themeActions] = useModel(ThemeSwitchModel);

  useEffect(() => {
    themeActions.loadTheme();
  }, []);

  return (
    <Box
      className={`${bgCss.bg} ${getThemeStyleCssName(themeState.style)} ${
        colorScheme === 'light' && themeState.style === 'anime'
          ? bgCss.bgAnimeLight
          : ''
      }`}
    >
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header
          className={`${css.appShellBg} ${
            colorScheme === 'light' ? css.appShellBgLight : ''
          }`}
        >
          <Group h="100%" px="md">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            {colorScheme === 'dark' ? (
              <img src={FBLogoWhite} alt="FBLogoWhite" height={32} width={32} />
            ) : (
              <img src={FBLogoBlack} alt="FBLogoBlack" height={32} width={32} />
            )}
            FastBuilder 用户中心
          </Group>
        </AppShell.Header>
        <AppShell.Navbar
          style={{ display: 'flex' }}
          p="sm"
          className={`${css.appShellBg} ${
            colorScheme === 'light' ? css.appShellBgLight : ''
          }`}
        >
          <MV4AppShellNavBar showAdminOptions={true} />
        </AppShell.Navbar>
        <AppShell.Main style={{ display: 'flex' }}>{children}</AppShell.Main>
      </AppShell>
    </Box>
  );
}
