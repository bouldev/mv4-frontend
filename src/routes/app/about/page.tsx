import { Anchor, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from '@modern-js/runtime/dist/types/router';
import PageTitle from '@/ui/component/app/PageTitle';
import MV4Card from '@/ui/component/app/MV4Card';

export default function AboutPage() {
  const navigate = useNavigate();

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
      <MV4Card>
        <Stack gap={'md'}>
          <Title order={4}>联络</Title>
          <Stack gap={'xs'}>
            <Text>
              您可以通过下方入口或发送邮件到 admin@boul.dev 与我们联络。
            </Text>
            <Text>
              <Anchor href={'#'}>一般联络（暂未完成）</Anchor>{' '}
              <Anchor
                href={'#'}
                onClick={() => {
                  navigate('/app/contact/emergency-notify');
                }}
              >
                紧急联络
              </Anchor>
            </Text>
          </Stack>
        </Stack>
      </MV4Card>
    </Stack>
  );
}
