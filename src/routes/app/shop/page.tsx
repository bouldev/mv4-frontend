import {
  Card,
  NavLink,
  Stack,
  Tabs,
  useMantineColorScheme,
} from '@mantine/core';
import { useState } from 'react';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';

export default function ShopPage() {
  const { colorScheme } = useMantineColorScheme();
  const [activeTab, setActiveTab] = useState<string | null>('plan');

  return (
    <Stack>
      <PageTitle>商店</PageTitle>
      <Card
        shadow="xl"
        padding="sm"
        radius="md"
        withBorder
        className={`${eleCss.appShellBg} ${
          colorScheme === 'light' ? eleCss.appShellBgLight : ''
        }`}
        mih={'450px'}
      >
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="plan">产品</Tabs.Tab>
            <Tabs.Tab value="slot">卡槽</Tabs.Tab>
            <Tabs.Tab value="service">服务</Tabs.Tab>
          </Tabs.List>
          <Stack mt={'xs'} gap={'sm'}>
            <Tabs.Panel value="plan">
              <NavLink label={'Pro'} />
              <NavLink label={'Premium'} />
              <NavLink label={'Business'} />
              <NavLink label={'Business Pro'} />
            </Tabs.Panel>
            <Tabs.Panel value="slot">
              <NavLink label={'可变 SLOT'} />
              <NavLink label={'固定 SLOT'} />
            </Tabs.Panel>
            <Tabs.Panel value="service">
              <NavLink label={'丢弃辅助用户'} />
            </Tabs.Panel>
          </Stack>
        </Tabs>
      </Card>
    </Stack>
  );
}
