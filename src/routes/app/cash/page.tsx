import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import { formatTime } from '@/utils/timeUtils';

export default function ManagePage() {
  const { colorScheme } = useMantineColorScheme();
  const currentRedeemCode = useRef('');
  const [exportedText, setExportedText] = useState('');

  async function onClickQueryRedeemCode() {
    modals.open({
      title: '查询兑换码状态',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <TextInput
            label="兑换码"
            onChange={e => {
              currentRedeemCode.current = e.currentTarget.value;
            }}
          />
          <Button
            fullWidth
            onClick={async () => {
              modals.closeAll();
              try {
                const ret = await mv4RequestApi<
                  any,
                  {
                    redeemCode: string;
                    fromUsername: string;
                    usedByUsername: string;
                    productId: string;
                    createTime: number;
                    usedTime: number;
                    name: string;
                  }
                >({
                  path: '/redeem-code/get-status-dealer',
                  data: {
                    code: currentRedeemCode.current,
                  },
                });
                modals.open({
                  title: <Text>兑换码 {ret.data.redeemCode}</Text>,
                  children: (
                    <Stack>
                      <Text size="sm">可兑换商品：{ret.data.name}</Text>
                      <Text size="sm">
                        被谁使用：
                        {ret.data.usedByUsername
                          ? ret.data.usedByUsername
                          : '（未被使用）'}
                      </Text>
                      <Text size="sm">
                        生成时间：{formatTime(ret.data.createTime, true)}
                      </Text>
                      <Text size="sm">
                        使用时间：
                        {ret.data.usedTime
                          ? formatTime(ret.data.usedTime, true)
                          : '（未被使用）'}
                      </Text>
                    </Stack>
                  ),
                });
              } catch (e) {
                console.error(e);
                if (e instanceof MV4RequestError || e instanceof Error) {
                  notifications.show({
                    title: '查询失败',
                    message: e.message,
                    color: 'red',
                  });
                }
              }
            }}
            mt="md"
          >
            查询
          </Button>
        </Stack>
      ),
    });
  }

  async function onClickExportRedeemCode() {
    try {
      const ret = await mv4RequestApi<
        any,
        {
          text: string;
        }
      >({
        path: '/redeem-code/export-not-used',
        methodGet: true,
      });
      setExportedText(ret.data.text);
      notifications.show({
        message: '已导出，请查看',
      });
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: '兑换码使用失败',
          message: e.message,
          color: 'red',
        });
      }
    }
  }

  return (
    <Stack>
      <PageTitle>收银台</PageTitle>
      <Stack gap={'sm'}>
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
            <Title order={4}>操作</Title>
            <Group>
              <Button onClick={() => onClickQueryRedeemCode()}>
                查询兑换码状态
              </Button>
              <Button onClick={() => onClickExportRedeemCode()}>
                导出未使用的兑换码
              </Button>
            </Group>
            <Textarea
              placeholder="导出的兑换码"
              value={exportedText}
              autosize
              minRows={3}
              maxRows={20}
            />
          </Stack>
        </Card>
      </Stack>
    </Stack>
  );
}
