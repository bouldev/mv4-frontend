import { useDisclosure } from '@mantine/hooks';
import {
  AppShell,
  Burger,
  Group,
  ScrollArea,
  Skeleton,
  useMantineColorScheme,
} from '@mantine/core';
import FBLogoWhite from '@/assets/logo-white.svg';
import FBLogoBlack from '@/assets/logo-black.svg';

export default function MV4AppShell() {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme /* ,  toggleColorScheme */ } = useMantineColorScheme();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          {colorScheme === 'dark' ? (
            <img src={FBLogoWhite} alt="FBLogoWhite" height={32} width={32} />
          ) : (
            <img src={FBLogoBlack} alt="FBLogoBlack" height={32} width={32} />
          )}
          FastBuilder 用户中心
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <ScrollArea>
          Navbar
          {Array(200)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} h={28} mt="sm" animate={false} />
            ))}
        </ScrollArea>
      </AppShell.Navbar>
      <AppShell.Main>Main</AppShell.Main>
    </AppShell>
  );
}
