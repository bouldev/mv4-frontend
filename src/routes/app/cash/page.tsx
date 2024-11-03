import {
  Button,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import CopyToClipboard from 'copy-to-clipboard';
import PageTitle from '@/ui/component/app/PageTitle';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import { formatTime } from '@/utils/timeUtils';
import MV4Card from '@/ui/component/app/MV4Card';
import MV4WaterMark from '@/ui/component/MV4WaterMark';

export default function CashPage() {
  const currentRedeemCode = useRef('');
  const currentOrderNo = useRef('');
  const [exportedText, setExportedText] = useState('');
  const [showOrderNo, setShowOrderNo] = useState('');

  async function onClickQueryRedeemCode() {
    currentRedeemCode.current = '';
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
                        生成时间：{formatTime(ret.data.createTime, true)}
                      </Text>
                      <Text size="sm">
                        被谁使用：
                        {ret.data.usedByUsername
                          ? ret.data.usedByUsername
                          : '（未被使用）'}
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
    currentOrderNo.current = '';
    modals.open({
      title: '导出未使用的兑换码',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <TextInput
            label="对应订单号"
            onChange={e => {
              currentOrderNo.current = e.currentTarget.value;
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
                    text: string;
                  }
                >({
                  path: '/redeem-code/export-not-used',
                  data: {
                    orderNo: currentOrderNo.current,
                  },
                });
                setExportedText(ret.data.text);
                setShowOrderNo(currentOrderNo.current);
                notifications.show({
                  message: '已导出，请查看',
                });
              } catch (e) {
                console.error(e);
                if (e instanceof MV4RequestError || e instanceof Error) {
                  notifications.show({
                    title: '导出失败',
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

  function onClickCopy(str: string) {
    CopyToClipboard(str);
    notifications.show({
      message: '已将内容复制到剪贴板',
    });
  }

  return (
    <Stack>
      <MV4WaterMark force={true} />
      <PageTitle>收银台</PageTitle>
      <Stack gap={'sm'}>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>操作</Title>
            <Group>
              <Button onClick={() => onClickQueryRedeemCode()}>
                查询兑换码状态
              </Button>
              <Button onClick={() => onClickExportRedeemCode()}>
                导出未使用的兑换码
              </Button>
              <Button onClick={() => onClickCopy(exportedText)}>
                复制导出的兑换码
              </Button>
            </Group>
            {showOrderNo.length > 0 && (
              <Text size="sm">当前导出订单号 {showOrderNo} 下的兑换码</Text>
            )}
            <Textarea
              placeholder="导出的兑换码"
              value={exportedText}
              autosize
              minRows={3}
              maxRows={20}
            />
          </Stack>
        </MV4Card>
      </Stack>
    </Stack>
  );
}
