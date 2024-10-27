import {
  ActionIcon,
  AppShell,
  Flex,
  NavLink,
  ScrollArea,
  Stack,
  Tabs,
  useMantineColorScheme,
} from '@mantine/core';
import {
  Announcement,
  Api,
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
  Transaction,
  TransactionOrder,
  User,
} from '@icon-park/react';
import { useEffect, useState } from 'react';
import { useModel } from '@modern-js/runtime/model';
import { notifications } from '@mantine/notifications';
import { useLocation, useNavigate } from '@modern-js/runtime/router';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [navigateItemsUser, setNavigateItemsUser] = useState([
    { name: '公告', link: '/app', icon: <Announcement /> },
    { name: '管理', link: '/app/manage', icon: <MoreApp /> },
    { name: '用户', link: '/app/user', icon: <User /> },
    { name: '商店', link: '/app/shop', icon: <Shop /> },
    { name: '下载', link: '/app/download', icon: <Download /> },
    { name: '关于', link: '/app/about', icon: <Help /> },
    { name: 'OpenAPI', link: '__OPENAPI__', icon: <Api /> },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [navigateItemsAdmin, setNavigateItemsAdmin] = useState([
    { name: '用户管理', link: '/app/admin/user', icon: <EveryUser /> },
    { name: '订单管理', link: '/app/admin/order', icon: <TransactionOrder /> },
    { name: '商品管理', link: '/app/admin/item', icon: <Commodity /> },
    { name: '服务配置', link: '/app/admin/service', icon: <Server /> },
    {
      name: '发布公告',
      link: '/app/admin/publish-announcement',
      icon: <Announcement />,
    },
  ]);

  const [activeTab, setActiveTab] = useState<string | null>('user');

  const { colorScheme, toggleColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });
  const [themeState, themeActions] = useModel(ThemeSwitchModel);
  const [userModelState, userModelActions] = useModel(GlobalUserModel);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/app/admin/')) {
      setActiveTab('admin');
    } else {
      setActiveTab('user');
    }
  }, [location]);

  return (
    <>
      {userModelState.user.permission >= MV4UserPermissionLevel.ADMIN && (
        <AppShell.Section mb={'xs'}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List grow>
              <Tabs.Tab value="user">一般</Tabs.Tab>
              <Tabs.Tab value="admin">管理</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </AppShell.Section>
      )}
      <AppShell.Section grow component={ScrollArea}>
        <Stack gap={'sm'}>
          {activeTab === 'user' &&
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
          {/* 特殊 */}
          {activeTab === 'user' &&
            userModelState.user.permission >= MV4UserPermissionLevel.DEALER && (
              <NavLink
                key={'cash'}
                onClick={() => doNavigateTo('/app/cash')}
                active={'/app/cash' === window.location.pathname}
                label={'收银台'}
                leftSection={<Transaction />}
                rightSection={
                  '/app/cash' === window.location.pathname && <Right />
                }
              />
            )}
          {activeTab === 'admin' &&
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
