import {
  Card,
  Flex,
  Pagination,
  Text,
  ScrollArea,
  Stack,
  Title,
  Divider,
  useMantineColorScheme,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { useState } from 'react';
import eleCss from '@/ui/css/elements.module.css';
import PageTitle from '@/ui/component/app/PageTitle';

export default function AnnouncementPage() {
  const { colorScheme /* ,  toggleColorScheme */ } = useMantineColorScheme();
  const baseElement = useElementSize();

  const [activePage, setPage] = useState(1);

  return (
    <Stack gap={'sm'} justify={'space-between'} style={{ flexGrow: 1 }}>
      <PageTitle>公告</PageTitle>
      <Stack style={{ flexGrow: 1 }} ref={baseElement.ref}>
        <ScrollArea h={baseElement.height}>
          <Stack gap={'md'}>
            {Array(100)
              .fill(0)
              .map(item => (
                <Card
                  key={item}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  className={`${eleCss.appShellBg} ${
                    colorScheme === 'light' ? eleCss.appShellBgLight : ''
                  }`}
                >
                  <Title order={5}>Norway Fjord Adventures</Title>
                  <Divider my="md" />
                  <Text size="sm" c="dimmed">
                    With Fjord Tours you can explore more of the magical fjord
                    landscapes with tours and activities on and around the
                    fjords of Norway
                  </Text>
                </Card>
              ))}
          </Stack>
        </ScrollArea>
      </Stack>
      <Flex justify={'center'}>
        <Pagination
          withControls={false}
          size={'lg'}
          value={activePage}
          onChange={setPage}
          total={20}
        />
      </Flex>
    </Stack>
  );
}
