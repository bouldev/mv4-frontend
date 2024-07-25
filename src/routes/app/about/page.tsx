import { Anchor, Stack, Text, Title } from '@mantine/core';
import PageTitle from '@/ui/component/app/PageTitle';
import MV4Card from '@/ui/component/app/MV4Card';

export default function AboutPage() {
  return (
    <Stack>
      <PageTitle>关于</PageTitle>
      <MV4Card>
        <Stack gap={'md'}>
          <Title order={4}>FastBuilder UserCenter Next (mv4)</Title>
          <Stack gap={'xs'}>
            <Text>
              <Anchor
                target={'_blank'}
                rel={'noreferrer'}
                href="https://fastbuilder.pro/enduser-license.html"
              >
                用户协议
              </Anchor>{' '}
              <Anchor
                target={'_blank'}
                rel={'noreferrer'}
                href="https://fastbuilder.pro/privacy-policy.html"
              >
                隐私策略
              </Anchor>
            </Text>
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
      </MV4Card>
    </Stack>
  );
}
