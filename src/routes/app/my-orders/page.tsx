import { Button, Group, Stack, Table, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import PageTitle from '@/ui/component/app/PageTitle';
import { getOrderStatusEmoji, getOrderStatusString } from '@/utils/orderUtils';
import { formatTime, nowUnix } from '@/utils/timeUtils';
import { MV4Order, MV4OrderStatusEnum } from '@/api/order';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import MV4Card from '@/ui/component/app/MV4Card';

export default function ManagePage() {
  const [orders, setOrders] = useState<MV4Order[]>([]);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    getOrders();
  }, []);

  async function getOrders() {
    setShowLoading(true);
    try {
      const ret = await mv4RequestApi<
        any,
        {
          orders: MV4Order[];
        }
      >({
        path: '/order/my-orders',
        methodGet: true,
      });
      setOrders(ret.data.orders);
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: '获取订单列表失败，请刷新页面',
          message: e.message,
          color: 'red',
        });
      }
    }
    setShowLoading(false);
  }

  /* function showModal(reason: string) {
    modals.open({
      title: '提示',
      children: (
        <Box>
          <Text>{reason}</Text>
        </Box>
      ),
    });
  } */

  async function onClickConfirmByUser(orderNo: string) {
    try {
      await mv4RequestApi({
        path: '/shop/confirm-order',
        data: {
          orderNo,
        },
      });
      notifications.show({
        message: '订单已催处理',
      });
      modals.closeAll();
      await getOrders();
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

  async function onClickCancelOrder(orderNo: string) {
    try {
      await mv4RequestApi({
        path: '/shop/cancel-order',
        data: {
          orderNo,
        },
      });
      notifications.show({
        message: '订单取消成功',
      });
      modals.closeAll();
      await getOrders();
    } catch (e) {
      if (e instanceof Error || e instanceof MV4RequestError) {
        notifications.show({
          title: '订单取消失败',
          message: e.message,
          color: 'red',
        });
      }
    }
  }

  return (
    <Stack>
      <PageTitle>历史订单</PageTitle>
      <Stack gap={'sm'}>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>订单列表（前30条）</Title>
            {showLoading && (
              <Text size={'sm'} fs={'italic'}>
                正在加载。。。
              </Text>
            )}
            {!showLoading && (
              <Table highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>订单号</Table.Th>
                    <Table.Th>价格</Table.Th>
                    <Table.Th>支付渠道</Table.Th>
                    <Table.Th>状态</Table.Th>
                    <Table.Th>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {orders.map(item => (
                    <Table.Tr key={item.orderNo}>
                      <Table.Td>{item.orderNo}</Table.Td>
                      <Table.Td>
                        {item.price === item.realPrice
                          ? String(item.price)
                          : `${item.price} (real: ${item.realPrice})`}
                      </Table.Td>
                      <Table.Td>{item.gateway}</Table.Td>
                      <Table.Td>
                        {getOrderStatusEmoji(item.orderStatus)}
                      </Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          onClick={() => {
                            modals.open({
                              title: <Text>Order {item.orderNo}</Text>,
                              children: (
                                <Stack gap="xs">
                                  <Text size="sm">订单名：{item.name}</Text>
                                  <Text size="sm">
                                    订单状态：
                                    {getOrderStatusString(item.orderStatus)}
                                  </Text>
                                  <Text size="sm">
                                    订单备注：
                                    <Text
                                      span
                                      size="sm"
                                      dangerouslySetInnerHTML={{
                                        __html: item.desc
                                          ? item.desc.replaceAll('\n', '<br/>')
                                          : '（无）',
                                      }}
                                    />
                                  </Text>
                                  <Text size="sm">订单号：{item.orderNo}</Text>
                                  <Text size="sm">
                                    订单创建时间：
                                    {formatTime(item.createTime, true)}
                                  </Text>
                                  <Text size="sm">
                                    订单支付时间：
                                    {item.payTime
                                      ? formatTime(item.payTime, true)
                                      : '（未支付）'}
                                  </Text>
                                  <Text size="sm">
                                    为谁购买：{item.buyForUsername}
                                  </Text>
                                  <Text size="sm">金额：{item.price}￥</Text>
                                  <Text size="sm">
                                    实际支付金额：{item.realPrice}￥
                                  </Text>
                                  <Text size="sm">
                                    使用FBCoin：{item.usedFBCoins}
                                  </Text>
                                  <Text size="sm">
                                    使用余额：{item.usedBalance}
                                  </Text>
                                  <Group>
                                    {item.orderStatus ===
                                      MV4OrderStatusEnum.WAITING_TO_PAY &&
                                      item.createTime + 300 > nowUnix() &&
                                      !item.payTime && (
                                        <Button
                                          size="xs"
                                          bg={'teal'}
                                          onClick={() => {
                                            window.location.href = `/app/pay-order?orderNo=${item.orderNo}`;
                                          }}
                                        >
                                          继续支付
                                        </Button>
                                      )}
                                    {item.createTime + 10800 > nowUnix() &&
                                      item.orderStatus ===
                                        MV4OrderStatusEnum.WAITING_TO_PAY && (
                                        <Button
                                          size="xs"
                                          bg={'violet'}
                                          onClick={() =>
                                            onClickConfirmByUser(item.orderNo)
                                          }
                                        >
                                          催发货
                                        </Button>
                                      )}
                                    {item.createTime + 10800 > nowUnix() &&
                                      item.orderStatus ===
                                        MV4OrderStatusEnum.WAITING_TO_PAY && (
                                        <Button
                                          size="xs"
                                          bg={'red'}
                                          onClick={() =>
                                            onClickCancelOrder(item.orderNo)
                                          }
                                        >
                                          取消订单
                                        </Button>
                                      )}
                                  </Group>
                                </Stack>
                              ),
                            });
                          }}
                        >
                          查看详情
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </MV4Card>
      </Stack>
    </Stack>
  );
}
