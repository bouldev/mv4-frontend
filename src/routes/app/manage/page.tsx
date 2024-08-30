import { Box, Stack, Text, Title } from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import HelperBotCard from '@/ui/component/manage/HelperBotCard';
import SlotManageCard from '@/ui/component/manage/SlotManageCard';
import MV4Card from '@/ui/component/app/MV4Card';

export default function ManagePage() {
  return (
    <Stack>
      <PageTitle>管理</PageTitle>
      <Stack gap={'sm'}>
        <HelperBotCard />
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>您绑定的服主账号</Title>
            <Box>
              <Text size={'sm'}>该项目已被迁移。</Text>
              <Text size={'sm'}>
                要管理或查看您绑定的服主账号，请前往“用户”页面。
              </Text>
            </Box>
          </Stack>
        </MV4Card>
        <SlotManageCard />
      </Stack>
    </Stack>
  );
}
