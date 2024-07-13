import {
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';
import { MV4Order } from '@/api/order';
import { getOrderStatusEmoji } from '@/utils/orderUtils';

export default function OrderPage() {
  const { colorScheme } = useMantineColorScheme();
  const [filterAdminChecked, setFilterAdminChecked] = useState(false);
  const [filterBalanceChecked, setFilterBalanceChecked] = useState(false);

  const mock: MV4Order[] = [];

  return (
    <Stack>
      <PageTitle>订单管理</PageTitle>
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
            <Title order={4}>订单列表</Title>
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
                {mock.map(item => (
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
                              children: <Text>{item.desc}</Text>,
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
            <Divider my="xs" />
            <Stack gap="xs">
              <Title order={5}>Filter</Title>
              <Group align="end">
                <TextInput label="Username" />
                <Group gap="xs">
                  <Text>ADMIN</Text>
                  <Checkbox
                    checked={filterAdminChecked}
                    onChange={event => {
                      setFilterAdminChecked(event.currentTarget.checked);
                    }}
                  />
                </Group>
                <Group gap="xs">
                  <Text>Balance != 0</Text>
                  <Checkbox
                    checked={filterBalanceChecked}
                    onChange={event => {
                      setFilterBalanceChecked(event.currentTarget.checked);
                    }}
                  />
                </Group>
                <Button size="sm">OK</Button>
              </Group>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Stack>
  );
}
