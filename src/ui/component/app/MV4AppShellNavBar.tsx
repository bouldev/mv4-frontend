import {
  ActionIcon,
  Flex,
  Group,
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
  Moon,
  MoreApp,
  Right,
  Server,
  SunOne,
  Theme,
  User,
} from '@icon-park/react';
import { useEffect, useState } from 'react';
import { useModel } from '@modern-js/runtime/model';
import { useElementSize } from '@mantine/hooks';
import { ThemeSwitchModel } from '@/context/UIContext';

export default function MV4AppShellNavBar({
  showAdminOptions,
}: {
  showAdminOptions: boolean;
}) {
  const navigateItemsUser = [
    { name: '公告', link: '/app', icon: <Announcement /> },
    { name: '管理', link: '/app/manage', icon: <MoreApp /> },
    { name: '用户', link: '/app/user', icon: <User /> },
    { name: '下载', link: '/app/download', icon: <Download /> },
    { name: '关于', link: '/app/about', icon: <Help /> },
  ];

  const navigateItemsAdmin = [
    { name: '用户管理', link: '/app/admin/user', icon: <EveryUser /> },
    { name: '商品管理', link: '/app/admin/item', icon: <Commodity /> },
    { name: '服务配置', link: '/app/admin/service', icon: <Server /> },
  ];

  const [page, setPage] = useState('user');

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [themeState, themeActions] = useModel(ThemeSwitchModel);

  const baseElement = useElementSize();

  useEffect(() => {
    if (window.location.pathname.startsWith('/app/admin/')) {
      setPage('admin');
    }
  }, []);

  return (
    <Stack gap={'sm'} justify={'space-between'} style={{ flexGrow: 1 }}>
      <Stack gap={'sm'} style={{ flexGrow: 1 }}>
        {showAdminOptions && (
          <SegmentedControl
            fullWidth
            value={page}
            onChange={setPage}
            data={[
              { label: '一般', value: 'user' },
              { label: '管理', value: 'admin' },
            ]}
          />
        )}
        <Flex ref={baseElement.ref} style={{ flexGrow: 1 }}>
          <ScrollArea h={baseElement.height} style={{ flexGrow: 1 }}>
            <Stack gap={'sm'}>
              {page === 'user' &&
                navigateItemsUser.map(value => (
                  <NavLink
                    key={value.name}
                    href={value.link}
                    active={value.link === window.location.pathname}
                    label={value.name}
                    leftSection={value.icon}
                    rightSection={
                      value.link === window.location.pathname && <Right />
                    }
                  />
                ))}
              {page === 'admin' &&
                navigateItemsAdmin.map(value => (
                  <NavLink
                    key={value.name}
                    href={value.link}
                    active={value.link === window.location.pathname}
                    label={value.name}
                    leftSection={value.icon}
                    rightSection={
                      value.link === window.location.pathname && <Right />
                    }
                  />
                ))}
            </Stack>
          </ScrollArea>
        </Flex>
      </Stack>
      <Group>
        <Flex justify={'flex-end'} m={4} gap={'xs'}>
          <ActionIcon
            variant="default"
            size="xl"
            onClick={() => {
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
            onClick={() => toggleColorScheme()}
          >
            {colorScheme === 'light' ? <Moon /> : <SunOne />}
          </ActionIcon>
        </Flex>
      </Group>
    </Stack>
  );
}
