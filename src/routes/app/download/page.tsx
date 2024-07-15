import {
  Anchor,
  Card,
  ScrollArea,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';

export default function DownloadPage() {
  const { colorScheme } = useMantineColorScheme();

  const code = `git clone git@github.com:bouldev/PhoenixBuilder.git
cd PhoenixBuilder
make current
# 初次使用在执行完一次 make 后执行下面的命令：
sed "s/urrentProtocol byte = 11/urrentProtocol byte = 8/g" ~/go/pkg/mod/github.com/sandertv/go-raknet@v1.12.0/conn.go
make current
./build/phoenixbuilder`;

  return (
    <Stack>
      <PageTitle>下载</PageTitle>
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
          <Title order={4}>从源码构建</Title>
          <Stack gap={'xs'}>
            <ScrollArea>
              <CodeHighlight code={code} lang={'sh'} />
            </ScrollArea>
          </Stack>
        </Stack>
      </Card>
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
          <Title order={4}>下载预构建版本</Title>
          <Stack gap={'xs'}>
            <Text>
              我们也为每个稳定版本提供了预先构建好的二进制文件供您使用，点击以下链接以查看。
            </Text>
            <Text>
              <Anchor
                target={'_blank'}
                rel={'noreferrer'}
                href={
                  'https://github.com/bouldev/PhoenixBuilder/releases/latest'
                }
              >
                GitHub
              </Anchor>
            </Text>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
