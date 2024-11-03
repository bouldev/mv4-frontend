import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from '@modern-js/runtime/router';
import PageTitle from '@/ui/component/app/PageTitle';
import HelperBotCard from '@/ui/component/manage/HelperBotCard';
import SlotManageCard from '@/ui/component/manage/SlotManageCard';
import MV4Card from '@/ui/component/app/MV4Card';

export default function ManagePage() {
  const navigate = useNavigate();
  return (
    <Stack>
      <PageTitle>管理</PageTitle>
      <Stack gap={'sm'}>
        <HelperBotCard />
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>您绑定的服主账号</Title>
            <Box>
              <Text size={'sm'}>
                要管理或查看您绑定的服主账号，请前往“用户”页面。
              </Text>
            </Box>
            <Group gap={'sm'}>
              <Button
                onClick={() => {
                  navigate('/app/user');
                }}
              >
                前往
              </Button>
            </Group>
          </Stack>
        </MV4Card>
        <SlotManageCard />
      </Stack>
    </Stack>
  );
}
