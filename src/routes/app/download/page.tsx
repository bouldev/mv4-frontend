import { Anchor, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import PageTitle from '@/ui/component/app/PageTitle';
import MV4Card from '@/ui/component/app/MV4Card';

export default function DownloadPage() {
  const buildShellCode = `git clone git@github.com:bouldev/PhoenixBuilder.git
cd PhoenixBuilder
make current
# 初次使用在执行完一次 make 后执行下面的命令：
sed "s/urrentProtocol byte = 11/urrentProtocol byte = 8/g" ~/go/pkg/mod/github.com/sandertv/go-raknet@v1.12.0/conn.go
make current
./build/phoenixbuilder`;

  const downloadShellCode =
    'export PB_USE_GH_REPO=1 && export GH_DOMAIN="https://github.com/" && bash -c "$(curl -fsSL raw.githubusercontent.com/bouldev/PhoenixBuilder/main/install.sh)"';

  return (
    <Stack>
      <PageTitle>下载</PageTitle>
      <MV4Card>
        <Stack gap={'md'}>
          <Title order={4}>使用安装脚本</Title>
          <Text size="sm">
            您可以使用我们的安装脚本来安装 PhoenixBuilder 。
          </Text>
          <Stack gap={'xs'}>
            <ScrollArea>
              <CodeHighlight code={downloadShellCode} lang={'sh'} />
            </ScrollArea>
          </Stack>
        </Stack>
      </MV4Card>
      <MV4Card>
        <Stack gap={'md'}>
          <Title order={4}>从源码构建</Title>
          <Stack gap={'xs'}>
            <ScrollArea>
              <CodeHighlight code={buildShellCode} lang={'sh'} />
            </ScrollArea>
          </Stack>
        </Stack>
      </MV4Card>
      <MV4Card>
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
      </MV4Card>
    </Stack>
  );
}
