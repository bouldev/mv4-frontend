import { Stack } from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import HelperBotCard from '@/ui/component/manage/HelperBotCard';
import SlotManageCard from '@/ui/component/manage/SlotManageCard';
import BindPlayerCard from '@/ui/component/manage/BindPlayerCard';
import MV4WaterMark from '@/ui/component/MV4WaterMark';

export default function ManagePage() {
  return (
    <Stack>
      <MV4WaterMark />
      <PageTitle>管理</PageTitle>
      <Stack gap={'sm'}>
        <HelperBotCard />
        <BindPlayerCard />
        <SlotManageCard />
      </Stack>
    </Stack>
  );
}
