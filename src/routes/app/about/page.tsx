import { Anchor, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from '@modern-js/runtime/router';
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
                Mantine
              </Anchor>
              {', '}
              <Anchor
                target={'_blank'}
                rel={'noreferrer'}
                href={'https://tabler.io/icons'}
              >
                Tabler Icons
              </Anchor>
            </Text>
            <Text>Copyright © 2019-2024 FastBuilder Dev. Group, Bouldev</Text>
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
      <MV4Card>
        <Stack gap={'md'}>
          <Title order={4}>沟通交流</Title>
          <Stack gap={'xs'}>
            <Text>您可以通过下方入口与其他用户进行交流。</Text>
            <Anchor
              target={'_blank'}
              rel={'noreferrer'}
              href={'https://pd.qq.com/s/8svbj7li0'}
            >
              QQ频道：FastBuilder0
            </Anchor>
            <Anchor
              target={'_blank'}
              rel={'noreferrer'}
              href={'https://qm.qq.com/q/5Ptk9wjsKk'}
            >
              公告群：859708791
            </Anchor>
            <Anchor
              target={'_blank'}
              rel={'noreferrer'}
              href={'https://qm.qq.com/q/x40GXMQ0SG'}
            >
              交流群：974227577
            </Anchor>
          </Stack>
        </Stack>
      </MV4Card>
    </Stack>
  );
}
