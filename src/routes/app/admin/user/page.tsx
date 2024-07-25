import {
  Button,
  Checkbox,
  Divider,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import PageTitle from '@/ui/component/app/PageTitle';
import MV4Card from '@/ui/component/app/MV4Card';

export default function ManagePage() {
  const [filterAdminChecked, setFilterAdminChecked] = useState(false);
  const [filterBalanceChecked, setFilterBalanceChecked] = useState(false);

  const mock = [
    {
      username: 'Alice',
      permission: 0,
      fbCoins: 1,
      balance: 0,
    },
    {
      username: 'Bob',
      permission: 1,
      fbCoins: 24,
      balance: 74,
    },
    {
      username: 'Chara',
      permission: 2,
      fbCoins: 666,
      balance: 666,
    },
    {
      username: 'David',
      permission: 3,
      fbCoins: 888,
      balance: 888,
    },
  ];

  return (
    <Stack>
      <PageTitle>用户管理</PageTitle>
      <Stack gap={'sm'}>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>用户列表 (TODO)</Title>
            <Table highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>FBCoins</Table.Th>
                  <Table.Th>Balance</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mock.map(item => (
                  <Table.Tr key={item.username}>
                    <Table.Td>{item.username}</Table.Td>
                    <Table.Td>{item.fbCoins}</Table.Td>
                    <Table.Td>{item.balance}</Table.Td>
                    <Table.Td>
                      <Button size="xs">Manage</Button>
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
        </MV4Card>
      </Stack>
    </Stack>
  );
}
