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
import { useEffect, useState } from 'react';
import { useModel } from '@modern-js/runtime/model';
import { notifications } from '@mantine/notifications';
import { useLocation, useNavigate } from '@modern-js/runtime/router';
import {
  IconApi,
  IconBuildingStore,
  IconCashRegister,
  IconChartTreemap,
  IconChevronRight,
  IconDownload,
  IconInfoCircle,
  IconLogout,
  IconMoonStars,
  IconNews,
  IconReceipt,
  IconServerCog,
  IconShirt,
  IconShoppingBagEdit,
  IconSun,
  IconUser,
  IconUserCog,
} from '@tabler/icons-react';
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
    { name: '公告', link: '/app', icon: <IconNews /> },
    { name: '管理', link: '/app/manage', icon: <IconChartTreemap /> },
    { name: '用户', link: '/app/user', icon: <IconUser /> },
    { name: '商店', link: '/app/shop', icon: <IconBuildingStore /> },
    { name: 'OpenAPI', link: '/app/openapi', icon: <IconApi /> },
    { name: '下载', link: '/app/download', icon: <IconDownload /> },
    { name: '关于', link: '/app/about', icon: <IconInfoCircle /> },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [navigateItemsAdmin, setNavigateItemsAdmin] = useState([
    { name: '用户管理', link: '/app/admin/user', icon: <IconUserCog /> },
    { name: '订单管理', link: '/app/admin/order', icon: <IconReceipt /> },
    {
      name: '商品管理',
      link: '/app/admin/item',
      icon: <IconShoppingBagEdit />,
    },
    { name: '服务配置', link: '/app/admin/service', icon: <IconServerCog /> },
    {
      name: '发布公告',
      link: '/app/admin/publish-announcement',
      icon: <IconNews />,
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
                  value.link === window.location.pathname && (
                    <IconChevronRight />
                  )
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
                leftSection={<IconCashRegister />}
                rightSection={
                  '/app/cash' === window.location.pathname && (
                    <IconChevronRight />
                  )
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
                  value.link === window.location.pathname && (
                    <IconChevronRight />
                  )
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
            <IconShirt />
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
            {/* auto: IconSunMoon */}
            {colorScheme === 'light' ? <IconMoonStars /> : <IconSun />}
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
            <IconLogout />
          </ActionIcon>
        </Flex>
      </AppShell.Section>
    </>
  );
}
