import { ReactNode, useState } from 'react';
import { useDisclosure, useElementSize } from '@mantine/hooks';
import {
  AppShell,
  Box,
  Burger,
  Group,
  RemoveScroll,
  ScrollArea,
  Space,
  Transition,
  useMantineColorScheme,
} from '@mantine/core';
import { useModel } from '@modern-js/runtime/model';
import { useNavigate } from '@modern-js/runtime/router';
import css from './mv4AppShell.module.css';
import FBLogoWhite from '@/assets/logo-white.svg';
import FBLogoBlack from '@/assets/logo-black.svg';
import MV4AppShellNavBar from '@/ui/component/app/MV4AppShellNavBar';
import { getThemeStyleCssName, ThemeSwitchModel } from '@/model/UIModel';
import bgCss from '@/ui/css/background.module.css';

export default function MV4AppShell({
  children = null,
}: {
  children: ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme } = useMantineColorScheme();
  const [themeState] = useModel(ThemeSwitchModel);

  const [showMain, setShowMain] = useState(true);
  const [pendingNavigate, setPendingNavigate] = useState(
    window.location.pathname,
  );
  const navigate = useNavigate();
  const shellHeaderBarElementSize = useElementSize();

  function onNavigatePage(path: string) {
    toggle();
    if (window.location.pathname === path) {
      return;
    }
    if (path === '__OPENAPI__') {
      window.open('https://fastbuilder.pro/openapi-doc/', '_blank');
      return;
    }
    setPendingNavigate(path);
    setShowMain(false);
  }

  return (
    <RemoveScroll>
      <AppShell
        className={`${bgCss.bg} ${getThemeStyleCssName(themeState.style)} ${
          colorScheme === 'light' && themeState.style === 'anime'
            ? bgCss.bgAnimeLight
            : ''
        }`}
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        padding={0}
      >
        <AppShell.Header
          className={`${css.appShellBg} ${
            colorScheme === 'light' ? css.appShellBgLight : ''
          }`}
          ref={shellHeaderBarElementSize.ref}
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
          p="sm"
          className={`${css.appShellBg} ${
            colorScheme === 'light' ? css.appShellBgLight : ''
          }`}
        >
          <MV4AppShellNavBar
            toggleNavBar={toggle}
            doNavigateTo={onNavigatePage}
          />
        </AppShell.Navbar>
        <AppShell.Main style={{ display: 'flex', height: '100vh' }}>
          <AppShell.Section grow component={ScrollArea} px={'md'}>
            <Transition
              mounted={showMain}
              transition={'fade-up'}
              onExited={() => {
                navigate(pendingNavigate);
                setShowMain(true);
              }}
            >
              {styles => (
                <Box py={'md'} style={styles}>
                  {children}
                </Box>
              )}
            </Transition>
            <Space h={shellHeaderBarElementSize.height} />
          </AppShell.Section>
        </AppShell.Main>
      </AppShell>
    </RemoveScroll>
  );
}
