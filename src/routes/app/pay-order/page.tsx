import { Button, Card, Group, Space, Stack, Text, Title } from '@mantine/core';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import PageTitle from '@/ui/component/app/PageTitle';
import { MV4Order, MV4OrderStatusEnum } from '@/api/order';
import { formatTime } from '@/utils/timeUtils';
import { MV4RequestError } from '@/api/base';
import { mv4RequestApi } from '@/api/mv4Client';
import MV4Card from '@/ui/component/app/MV4Card';

export default function ManagePage() {
  const [showLoading, setShowLoading] = useState(true);
  const [showConfirmByUserBtn, setShowConfirmByUserBtn] = useState(false);
  const [order, setOrder] = useState<MV4Order>({
    payTime: 0,
    productId: '',
    orderNo: '',
    username: '',
    buyForUsername: '',
    price: 0,
    realPrice: 0,
    usedBalance: 0,
    usedFBCoins: 0,
    gateway: '',
    createTime: 0,
    orderStatus: MV4OrderStatusEnum.WAITING_TO_PAY,
    name: '',
    desc: '',
    payUrl: 'test',
  });

  async function requestOrder(orderNo: string): Promise<MV4Order> {
    const ret = await mv4RequestApi<any, MV4Order>({
      path: '/order/query-order',
      data: {
        orderNo,
      },
    });
    return ret.data;
  }

  function showModal(reason: string) {
    const params = new URLSearchParams(window.location.search);
    modals.open({
      title: '提示',
      children: (
        <Stack>
          <Text>{reason}</Text>
          <Space />
          <Text>订单号：{params.get('orderNo') as string}</Text>
        </Stack>
      ),
      onClose: () => {
        window.location.href = '/app';
      },
    });
  }

  async function onClickConfirmByUser() {
    try {
      await mv4RequestApi({
        path: '/shop/confirm-order',
        data: {
          orderNo: order.orderNo,
        },
      });
      notifications.show({
        message: '已经催处理，稍后将刷新状态',
      });
    } catch (e) {
      if (e instanceof Error || e instanceof MV4RequestError) {
        notifications.show({
          title: '订单催处理失败',
          message: e.message,
          color: 'red',
        });
      }
    }
  }

  function openAlipay(payUrl: string) {
    window.open(
      `alipays://platformapi/startapp?saId=10000007&clientVersion=3.7.0.0718&qrcode=${encodeURIComponent(
        payUrl,
      )}`,
      '_blank',
    );
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    async function init() {
      if (params.get('orderNo') !== null) {
        const order = await requestOrder(params.get('orderNo') as string);
        setOrder(order);
        setShowLoading(false);
        setTimeout(() => {
          setShowConfirmByUserBtn(true);
        }, 5000);
        return;
      }
      showModal('链接无效');
    }
    init();
    requestOrder(params.get('orderNo') as string);
    const interval = setInterval(async () => {
      try {
        await requestOrder(params.get('orderNo') as string);
      } catch (e) {
        clearInterval(interval);
        if (e instanceof Error || e instanceof MV4RequestError) {
          showModal(e.message);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Stack>
      <PageTitle>支付订单</PageTitle>
      <Stack gap={'sm'}>
        {showLoading && (
          <MV4Card>
            <Stack gap={'md'}>
              <Title order={4}>订单信息</Title>
              <Text size={'sm'} fs={'italic'}>
                正在加载。。。
              </Text>
            </Stack>
          </MV4Card>
        )}
        {!showLoading && (
          <Stack gap={'sm'}>
            <MV4Card>
              <Stack gap={'md'} align="center">
                <Group>
                  <Card>
                    <QRCodeSVG
                      style={{
                        alignSelf: 'center',
                      }}
                      value={order.payUrl}
                      size={250}
                    />
                  </Card>
                </Group>
                <Title order={5} c={'red'}>
                  请使用支付宝扫码或点击下方按钮支付
                </Title>
                <Title order={3} c={'red'}>
                  ￥ {order.realPrice.toFixed(2)}
                </Title>
                <Title order={6} c={'red'}>
                  订单有效期为5分钟，请勿离开页面
                </Title>
                <Button
                  hiddenFrom="sm"
                  onClick={() => openAlipay(order.payUrl)}
                >
                  打开支付宝
                </Button>
                {showConfirmByUserBtn && (
                  <Button onClick={() => onClickConfirmByUser()}>
                    已支付？点击催处理
                  </Button>
                )}
              </Stack>
            </MV4Card>
            <MV4Card>
              <Stack gap={'md'}>
                <Title order={4}>订单信息</Title>
                <Stack gap="xs">
                  <Text size="sm">订单名称</Text>
                  <Text size="xs" c="dimmed">
                    {order.name}
                  </Text>
                  <Text size="sm">订单号</Text>
                  <Text size="xs" c="dimmed">
                    {order.orderNo}
                  </Text>
                  <Text size="sm">订单创建时间</Text>
                  <Text size="xs" c="dimmed">
                    {formatTime(order.createTime, true)}
                  </Text>
                  <Text size="sm">为谁购买</Text>
                  <Text size="xs" c="dimmed">
                    {order.buyForUsername}
                  </Text>
                  <Text size="sm">金额</Text>
                  <Text size="xs" c="dimmed">
                    {order.price}
                  </Text>
                  <Text size="sm">实际支付金额</Text>
                  <Text size="xs" c="dimmed">
                    {order.realPrice}
                  </Text>
                  <Text size="sm">使用FBCoin</Text>
                  <Text size="xs" c="dimmed">
                    {order.usedFBCoins}
                  </Text>
                  <Text size="sm">使用余额</Text>
                  <Text size="xs" c="dimmed">
                    {order.usedBalance}
                  </Text>
                  <Text size="sm">订单备注</Text>
                  <Text size="xs" c="dimmed">
                    {order.desc ? order.desc : '（无）'}
                  </Text>
                </Stack>
              </Stack>
            </MV4Card>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
