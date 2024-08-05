import { Stack } from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import HelperBotCard from '@/ui/component/manage/HelperBotCard';
import SlotManageCard from '@/ui/component/manage/SlotManageCard';
import BindPlayerCard from '@/ui/component/manage/BindPlayerCard';

export default function ManagePage() {
  return (
    <Stack>
      <PageTitle>管理</PageTitle>
      <Stack gap={'sm'}>
        <HelperBotCard />
        <BindPlayerCard />
        <SlotManageCard />
      </Stack>
    </Stack>
  );
}
