import { Stack } from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import HelperBotCard from '@/ui/component/manage/HelperBotCard';

export default function GameAccountPage() {
  return (
    <Stack>
      <PageTitle>游戏账号</PageTitle>
      <Stack gap={'sm'}>
        <HelperBotCard isUserAccount={true} />
      </Stack>
    </Stack>
  );
}
