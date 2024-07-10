import {
  Anchor,
  Card,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';

export default function AboutPage() {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Stack>
      <PageTitle>关于</PageTitle>
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
          <Title order={4}>FastBuilder UserCenter Next (mv4)</Title>
          <Stack gap={'xs'}>
            <Text>
              Frontend:{' '}
              <Anchor
                target={'_blank'}
                rel={'noreferrer'}
                href={'https://react.dev/'}
              >
                React
              </Anchor>
              {', '}
              <Anchor
                target={'_blank'}
                rel={'noreferrer'}
                href={'https://modernjs.dev/'}
              >
                Modern.js
              </Anchor>
              {', '}
              <Anchor
                target={'_blank'}
                rel={'noreferrer'}
                href={'https://mantine.dev/'}
              >
                MantineUI
              </Anchor>
              {', '}
              <Anchor
                target={'_blank'}
                rel={'noreferrer'}
                href={'https://iconpark.oceanengine.com/'}
              >
                IconPark
              </Anchor>
            </Text>
            <Text>
              Copyright © 2019-2024 FastBuilder Dev. Group, CodePwn2021, Bouldev
            </Text>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
