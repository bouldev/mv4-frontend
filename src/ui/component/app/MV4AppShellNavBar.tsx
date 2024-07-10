import {
  ActionIcon,
  AppShell,
  Flex,
  NavLink,
  ScrollArea,
  SegmentedControl,
  Stack,
  useMantineColorScheme,
} from '@mantine/core';
import {
  Announcement,
  Commodity,
  Download,
  EveryUser,
  Help,
  Logout,
  Moon,
  MoreApp,
  Right,
  Server,
  Shop,
  SunOne,
  Theme,
  User,
} from '@icon-park/react';
import { useEffect, useState } from 'react';
import { useModel } from '@modern-js/runtime/model';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@modern-js/runtime/router';
import { ThemeSwitchModel } from '@/model/UIModel';
import { mv4RequestApi } from '@/api/mv4Client';
import { GlobalUserModel } from '@/model/globalUserModel';
import { MV4UserPermissionLevel } from '@/api/user';

export default function MV4AppShellNavBar({
  doNavigateTo,
  toggleNavBar,
}: {
  doNavigateTo: (path: string) => void;
  toggleNavBar: VoidFunction;
}) {
  const navigateItemsUser = [
    { name: '公告', link: '/app', icon: <Announcement /> },
    { name: '管理', link: '/app/manage', icon: <MoreApp /> },
    { name: '用户', link: '/app/user', icon: <User /> },
    { name: '商店', link: '/app/shop', icon: <Shop /> },
    { name: '下载', link: '/app/download', icon: <Download /> },
    { name: '关于', link: '/app/about', icon: <Help /> },
  ];

  const navigateItemsAdmin = [
    { name: '用户管理', link: '/app/admin/user', icon: <EveryUser /> },
    { name: '商品管理', link: '/app/admin/item', icon: <Commodity /> },
    { name: '服务配置', link: '/app/admin/service', icon: <Server /> },
  ];

  const [page, setPage] = useState('user');

  const { colorScheme, toggleColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });
  const [themeState, themeActions] = useModel(ThemeSwitchModel);
  const [userModelState, userModelActions] = useModel(GlobalUserModel);

  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname.startsWith('/app/admin/')) {
      setPage('admin');
    }
  }, []);

  return (
    <>
      {userModelState.user.permission >= MV4UserPermissionLevel.ADMIN && (
        <AppShell.Section mb={'xs'}>
          <SegmentedControl
            fullWidth
            value={page}
            onChange={setPage}
            data={[
              { label: '一般', value: 'user' },
              { label: '管理', value: 'admin' },
            ]}
          />
        </AppShell.Section>
      )}
      <AppShell.Section grow component={ScrollArea}>
        <Stack gap={'sm'}>
          {page === 'user' &&
            navigateItemsUser.map(value => (
              <NavLink
                key={value.name}
                onClick={() => doNavigateTo(value.link)}
                active={value.link === window.location.pathname}
                label={value.name}
                leftSection={value.icon}
                rightSection={
                  value.link === window.location.pathname && <Right />
                }
              />
            ))}
          {page === 'admin' &&
            userModelState.user.permission >= MV4UserPermissionLevel.ADMIN &&
            navigateItemsAdmin.map(value => (
              <NavLink
                key={value.name}
                onClick={() => doNavigateTo(value.link)}
                active={value.link === window.location.pathname}
                label={value.name}
                leftSection={value.icon}
                rightSection={
                  value.link === window.location.pathname && <Right />
                }
              />
            ))}
        </Stack>
      </AppShell.Section>
      <AppShell.Section>
        <Flex justify={'flex-start'} m={4} gap={'xs'}>
          <ActionIcon
            variant="default"
            size="xl"
            onClick={() => {
              toggleNavBar();
              if (themeState.style === 'default') {
                themeActions.changeStyle('anime');
              } else {
                themeActions.changeStyle('default');
              }
            }}
          >
            <Theme />
          </ActionIcon>
          <ActionIcon
            variant="default"
            size="xl"
            onClick={() => {
              toggleNavBar();
              toggleColorScheme();
              notifications.clean();
              notifications.show({
                message: `已${
                  colorScheme !== 'dark' ? '启用' : '禁用'
                }深色模式`,
              });
            }}
          >
            {colorScheme === 'light' ? <Moon /> : <SunOne />}
          </ActionIcon>
          <ActionIcon
            variant="default"
            size="xl"
            onClick={async () => {
              notifications.show({
                message: '已退出登录',
              });
              navigate('/login');
              try {
                await mv4RequestApi({
                  methodGet: true,
                  path: '/user/logout',
                });
                await userModelActions.update();
              } catch {}
            }}
          >
            <Logout />
          </ActionIcon>
        </Flex>
      </AppShell.Section>
    </>
  );
}
