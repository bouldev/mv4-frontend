import { Stack, Text, Title } from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import MV4Card from '@/ui/component/app/MV4Card';

export default function ManagePage() {
  return (
    <Stack>
      <PageTitle>服务配置</PageTitle>
      <Stack gap={'sm'}>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>TODO</Title>
            <Text>TODO</Text>
          </Stack>
        </MV4Card>
      </Stack>
    </Stack>
  );
}
