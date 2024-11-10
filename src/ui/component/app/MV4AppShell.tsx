import { ReactNode, useState } from 'react';
import { useColorScheme, useDisclosure, useElementSize } from '@mantine/hooks';
import {
  AppShell,
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
  const systemColorScheme = useColorScheme();
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
    setPendingNavigate(path);
    setShowMain(false);
  }

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
    <RemoveScroll>
      <AppShell
        className={`${bgCss.bg} ${getThemeStyleCssName(themeState.style)} ${
          getCurrentCS() === 'light' &&
          themeState.style === 'anime' &&
          bgCss.bgAnimeLight
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
            getCurrentCS() === 'light' && css.appShellBgLight
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
            {getCurrentCS() === 'dark' ? (
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
            getCurrentCS() === 'light' && css.appShellBgLight
          }`}
        >
          <MV4AppShellNavBar doNavigateTo={onNavigatePage} />
        </AppShell.Navbar>
        <AppShell.Main style={{ display: 'flex', height: '100vh' }}>
          <Transition
            mounted={showMain}
            transition={'fade-up'}
            onExited={() => {
              navigate(pendingNavigate);
              setShowMain(true);
            }}
          >
            {styles => (
              <AppShell.Section
                style={styles}
                grow
                component={ScrollArea}
                p="md"
              >
                {children}
                <Space h={shellHeaderBarElementSize.height} />
              </AppShell.Section>
            )}
          </Transition>
        </AppShell.Main>
      </AppShell>
    </RemoveScroll>
  );
}
