import {
  Card,
  ScrollArea,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';

export default function ManagePage() {
  const { colorScheme } = useMantineColorScheme();
  const baseElement = useElementSize();

  return (
    <Stack style={{ flexGrow: 1 }} ref={baseElement.ref}>
      <ScrollArea h={baseElement.height}>
        <Stack gap={'sm'}>
          <PageTitle>商品管理</PageTitle>
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
              <Title order={4}>您的服务状态</Title>
              <Text>未拥有服务</Text>
            </Stack>
          </Card>
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
