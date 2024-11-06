import {
  Button,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import PageTitle from '@/ui/component/app/PageTitle';
import { MV4Order } from '@/api/order';
import { getOrderStatusEmoji, getOrderStatusString } from '@/utils/orderUtils';
import { MV4RequestError } from '@/api/base';
import { mv4RequestApi } from '@/api/mv4Client';
import { formatTime } from '@/utils/timeUtils';
import MV4Card from '@/ui/component/app/MV4Card';

export default function OrderPage() {
  const [orders, setOrders] = useState<MV4Order[]>([]);
  const [showLoading, setShowLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState<string>('');

  useEffect(() => {
    filterOrders('');
  }, []);

  async function filterOrders(username: string) {
    setShowLoading(true);
    try {
      const ret = await mv4RequestApi<
        any,
        {
          orders: MV4Order[];
        }
      >({
        path: '/admin/order/search-orders',
        data: {
          username,
        },
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

  return (
    <Stack>
      <PageTitle>订单管理</PageTitle>
      <Stack gap={'sm'}>
        <MV4Card>
          <LoadingOverlay
            visible={showLoading}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />
          <Stack gap={'md'}>
            <Title order={4}>订单列表 (limit=30)</Title>
            <Group align="end">
              <TextInput
                label="Username"
                value={usernameInput}
                onChange={e => setUsernameInput(e.currentTarget.value)}
              />
              <Button size="sm" onClick={() => setUsernameInput('')}>
                CLEAN
              </Button>
              <Button size="sm" onClick={() => filterOrders(usernameInput)}>
                OK
              </Button>
            </Group>
            <Table highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>OrderNo</Table.Th>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Gateway</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {orders.map(item => (
                  <Table.Tr key={item.orderNo}>
                    <Table.Td>{item.orderNo}</Table.Td>
                    <Table.Td>{item.username}</Table.Td>
                    <Table.Td>
                      {item.price === item.realPrice
                        ? String(item.price)
                        : `${item.price} (real: ${item.realPrice})`}
                    </Table.Td>
                    <Table.Td>{item.gateway}</Table.Td>
                    <Table.Td>{getOrderStatusEmoji(item.orderStatus)}</Table.Td>
                    <Table.Td>
                      <Group>
                        <Button
                          bg="gray"
                          size="xs"
                          onClick={() => {
                            modals.open({
                              title: <Text>Order {item.orderNo}</Text>,
                              children: (
                                <Stack>
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
                                  <Text size="sm">创建者：{item.username}</Text>
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
                                </Stack>
                              ),
                            });
                          }}
                        >
                          Desc.
                        </Button>
                        <Button size="xs">Manage</Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </MV4Card>
      </Stack>
    </Stack>
  );
}
