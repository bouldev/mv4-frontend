import { Stack } from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import HelperBotCard from '@/ui/component/manage/HelperBotCard';
import SlotManageCard from '@/ui/component/manage/SlotManageCard';

export default function ManagePage() {
  return (
    <Stack>
      <PageTitle>管理</PageTitle>
      <Stack gap={'sm'}>
        <HelperBotCard />
        <SlotManageCard />
      </Stack>
    </Stack>
  );
}
