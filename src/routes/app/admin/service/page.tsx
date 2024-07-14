import { Card, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';

export default function ManagePage() {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Stack>
      <PageTitle>服务配置</PageTitle>
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
            <Title order={4}>TODO</Title>
            <Text>TODO</Text>
          </Stack>
        </Card>
      </Stack>
    </Stack>
  );
}
