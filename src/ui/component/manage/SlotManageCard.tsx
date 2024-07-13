import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useRef } from 'react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import eleCss from '@/ui/css/elements.module.css';
import { ServerSlot, ServerSlotDataType } from '@/api/slot';
import {
  formatTime,
  getDurationChineseString,
  nowUnix,
} from '@/utils/timeUtils';

export default function SlotManageCard() {
  const { colorScheme } = useMantineColorScheme();
  const currentInitInput = useRef('');
  const currentMarkInput = useRef('');

  const mock: ServerSlot[] = [
    {
      slotId: '1145141',
      data: '987654',
      mark: '生存服但是过期了',
      dataType: ServerSlotDataType.SERVER_ID_SLOT,
      expireToClean: true,
      slotTime: 60 * 60 * 24 * 30,
      expire: 1623301748,
    },
    {
      slotId: '1145142',
      data: '123456',
      mark: '生存服',
      dataType: ServerSlotDataType.SERVER_ID_SLOT,
      expireToClean: true,
      slotTime: 60 * 60 * 24 * 30,
      expire: 1723301748,
    },
    {
      slotId: '11451424',
      data: '24531',
      mark: '建筑服',
      dataType: ServerSlotDataType.SERVER_ID_SLOT,
      expireToClean: false,
      slotTime: 60 * 60 * 24 * 30,
      expire: 1623301748,
    },
    {
      slotId: '114514241',
      data: '24531',
      mark: '',
      dataType: ServerSlotDataType.SERVER_ID_SLOT,
      expireToClean: false,
      slotTime: 60 * 60 * 24 * 30,
      expire: 1623301748,
    },
    {
      slotId: '1145143',
      data: '23333',
      mark: '好朋友',
      dataType: ServerSlotDataType.PLAYER_ID_SLOT,
      expireToClean: false,
      slotTime: 60 * 60 * 24 * 30,
      expire: 1723301748,
    },
    {
      slotId: '1145144',
      data: '',
      mark: '',
      dataType: ServerSlotDataType.SERVER_ID_SLOT,
      expireToClean: true,
      slotTime: 60 * 60 * 24 * 30,
      expire: -1,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onClickInitThisSlot(thisSlot: ServerSlot, index: number) {
    currentInitInput.current = '';
    modals.open({
      title: `初始化槽位`,
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <Text size="sm">
            槽位类型：{getDurationChineseString(thisSlot.slotTime)}{' '}
            {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
              '游戏账号 SLOT'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服号 SLOT'}
          </Text>
          <TextInput
            label={
              <>
                {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
                  '游戏账号昵称'}
                {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
                  '租赁服号'}
              </>
            }
            placeholder={'请输入'}
            onChange={e => {
              currentInitInput.current = e.currentTarget.value.replaceAll(
                ' ',
                '',
              );
            }}
          />
          {thisSlot.expireToClean && (
            <Text size={'sm'} c={'red'} fw={700}>
              注意，这个SLOT将在过期后自动删除。
            </Text>
          )}
          <Button
            fullWidth
            onClick={() => {
              if (currentInitInput.current.length === 0) {
                notifications.show({
                  message: '请输入内容',
                  color: 'red',
                  autoClose: 1000,
                });
                return;
              }
              modals.closeAll();
              modals.openConfirmModal({
                title: '再次确认',
                closeOnEscape: false,
                closeOnClickOutside: false,
                children: (
                  <Stack>
                    <Text size="sm">
                      确定使用
                      {thisSlot.dataType ===
                        ServerSlotDataType.PLAYER_ID_SLOT && '游戏昵称'}
                      {thisSlot.dataType ===
                        ServerSlotDataType.SERVER_ID_SLOT && '租赁服号'}
                      “{currentInitInput.current}”初始化这个SLOT吗？
                    </Text>
                    <Text size="sm">
                      请认真检查，我们不会因为填写错误导致无法使用而补偿。
                    </Text>
                  </Stack>
                ),
                labels: { confirm: '确定', cancel: '取消' },
                onConfirm: () => {
                  // todo: request api
                },
              });
            }}
            mt="md"
          >
            初始化
          </Button>
        </Stack>
      ),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onClickEditThisSlotMark(thisSlot: ServerSlot, index: number) {
    currentMarkInput.current = '';
    modals.open({
      title: `编辑SLOT备注`,
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <Text size="sm">
            {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
              '游戏账号 SLOT'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服号 SLOT'}
            ：{thisSlot.data}
          </Text>
          {thisSlot.mark && <Text size="sm">原备注：{thisSlot.mark}</Text>}
          <TextInput
            label="新备注"
            placeholder={'请输入'}
            onChange={e => {
              currentInitInput.current = e.currentTarget.value.replaceAll(
                ' ',
                '',
              );
            }}
          />
          <Button
            fullWidth
            onClick={() => {
              if (currentInitInput.current.length === 0) {
                notifications.show({
                  message: '请输入内容',
                  color: 'red',
                  autoClose: 1000,
                });
                return;
              }
              modals.closeAll();
              // todo: request api
            }}
            mt="md"
          >
            修改备注
          </Button>
        </Stack>
      ),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onClickDropThisSlot(thisSlot: ServerSlot, index: number) {
    modals.openConfirmModal({
      title: '删除确认',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <Text size="sm">
            {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
              '游戏账号 SLOT'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服号 SLOT'}
            ：{thisSlot.data}
            {thisSlot.mark && `（备注：${thisSlot.mark}）`}
          </Text>
          <Text size="sm">确定删除吗？</Text>
        </Stack>
      ),
      labels: { confirm: '确定删除', cancel: '取消' },
      confirmProps: { bg: 'red' },
      onConfirm: () => {
        // todo: request api
      },
    });
  }

  async function onClickManageThisSlot(thisSlot: ServerSlot, index: number) {
    modals.open({
      title: `管理SLOT`,
      children: (
        <Stack>
          <Text size="sm">
            槽位类型：{getDurationChineseString(thisSlot.slotTime)}{' '}
            {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
              '游戏账号 SLOT'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服号 SLOT'}
          </Text>
          <Text size="sm">
            绑定的
            {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
              '游戏昵称'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服号'}
            ：{thisSlot.data}
          </Text>
          {thisSlot.mark && <Text size="sm">备注：{thisSlot.mark}</Text>}
          <Group>
            <Button
              onClick={() => {
                modals.closeAll();
                onClickEditThisSlotMark(thisSlot, index);
              }}
              mt="md"
            >
              修改备注
            </Button>
          </Group>
        </Stack>
      ),
    });
  }

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      className={`${eleCss.appShellBg} ${
        colorScheme === 'light' ? eleCss.appShellBgLight : ''
      }`}
    >
      <Stack gap={'md'}>
        <Title order={4}>您的槽位</Title>
        {mock.map((item, i) => (
          <Card
            key={item.slotId}
            shadow="sm"
            padding="sm"
            radius="md"
            withBorder
            className={`${eleCss.appShellBg} ${
              colorScheme === 'light' ? eleCss.appShellBgLight : ''
            }`}
          >
            <Group justify={'space-between'}>
              <Stack>
                {item.expire !== -1 ? (
                  <>
                    <Text size={'sm'}>
                      {item.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
                        '游戏账号 SLOT'}
                      {item.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
                        '租赁服号 SLOT'}
                      ：{item.mark ? `${item.mark} (${item.data})` : item.data}
                    </Text>
                    <Group>
                      {item.expireToClean && (
                        <Text size={'sm'} c={'red'} fw={700}>
                          （自动删除）
                        </Text>
                      )}
                      <Text size={'xs'}>
                        {item.expire < nowUnix() ? '已过期' : '过期时间'}：
                        {formatTime(item.expire, true)}
                      </Text>
                    </Group>
                  </>
                ) : (
                  <Group gap={0} p={0}>
                    <Text size={'sm'}>
                      {item.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
                        '游戏账号 SLOT '}
                      {item.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
                        '租赁服号 SLOT '}
                      (未使用)
                    </Text>
                    {item.expireToClean && (
                      <Text size={'sm'} c={'red'} fw={700}>
                        （自动删除）
                      </Text>
                    )}
                  </Group>
                )}
              </Stack>
              <Group gap={'xs'}>
                {item.expire < nowUnix() && item.expire !== -1 && (
                  <Button
                    bg={'red'}
                    onClick={() => {
                      onClickDropThisSlot(item, i);
                    }}
                  >
                    删除
                  </Button>
                )}
                {item.data.length === 0 && (
                  <Button
                    bg={'lime'}
                    onClick={() => {
                      onClickInitThisSlot(item, i);
                    }}
                  >
                    初始化
                  </Button>
                )}
                {item.data.length > 0 && item.expire > nowUnix() && (
                  <Button
                    onClick={() => {
                      onClickManageThisSlot(item, i);
                    }}
                  >
                    管理
                  </Button>
                )}
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>
    </Card>
  );
}
