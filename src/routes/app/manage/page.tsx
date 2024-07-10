import { Card, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';

export default function ManagePage() {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Stack>
      <PageTitle>管理</PageTitle>
      <Stack gap={'sm'}>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          className={`${eleCss.appShellBg} ${
            colorScheme === 'light' ? eleCss.appShellBgLight : ''
          }`}
        >
          <Stack gap={'md'}>
            <Title order={4}>您的产品类型</Title>
            <Text>Basic</Text>
            <Text>Expire at 2024-05-26 12:14:35</Text>
          </Stack>
        </Card>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          className={`${eleCss.appShellBg} ${
            colorScheme === 'light' ? eleCss.appShellBgLight : ''
          }`}
        >
          <Stack gap={'md'}>
            <Title order={4}>您的槽位</Title>
          </Stack>
        </Card>
      </Stack>
    </Stack>
  );
}
