import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { ServerSlot, ServerSlotDataType } from '@/api/slot';
import {
  formatTime,
  getDurationChineseString,
  nowUnix,
} from '@/utils/timeUtils';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import { nemcQueryPlayer } from '@/api/nemcQueryPlayer';
import { ModalConfirmPlayerWithAvatar } from '@/ui/component/ModalConfirmPlayerWithAvatar';
import MV4Card from '@/ui/component/app/MV4Card';

export default function SlotManageCard() {
  const [cardLoading, setCardLoading] = useState(true);
  const currentInitInput = useRef('');
  const currentMarkInput = useRef('');
  const [slots, setSlots] = useState<ServerSlot[]>([]);

  useEffect(() => {
    async function init() {
      await updateSlotList();
    }
    init();
  }, []);

  async function updateSlotList() {
    setCardLoading(true);
    try {
      const ret = await mv4RequestApi<
        any,
        {
          list: ServerSlot[];
        }
      >({
        path: '/server-slot/get-slots-list',
        methodGet: true,
      });
      setSlots(ret.data.list);
      setCardLoading(false);
    } catch (e) {
      console.error(e);
      setCardLoading(false);
      notifications.show({
        message: '获取卡槽列表失败，请刷新页面',
        color: 'red',
      });
      throw e;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onClickInitThisSlot(thisSlot: ServerSlot, index: number) {
    currentInitInput.current = '';
    modals.open({
      title: `初始化卡槽`,
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <Text size="sm">
            卡槽类型：{getDurationChineseString(thisSlot.slotTime)}{' '}
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
            onClick={async () => {
              if (currentInitInput.current.length === 0) {
                notifications.show({
                  message: '请输入内容',
                  color: 'red',
                  autoClose: 1000,
                });
                return;
              }
              async function onClickConfirm() {
                try {
                  await mv4RequestApi({
                    path: '/server-slot/init-slot',
                    data: {
                      slotId: thisSlot.slotId,
                      data: currentInitInput.current,
                    },
                  });
                  notifications.show({
                    message: '初始化成功',
                  });
                  await updateSlotList();
                } catch (e) {
                  console.error(e);
                  if (e instanceof MV4RequestError || e instanceof Error) {
                    notifications.show({
                      title: '初始化卡槽失败',
                      message: e.message,
                      color: 'red',
                    });
                  }
                }
              }
              /***********/
              modals.closeAll();
              if (thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT) {
                modals.openConfirmModal({
                  title: '再次确认',
                  closeOnEscape: false,
                  closeOnClickOutside: false,
                  children: (
                    <Stack>
                      <Text size="sm">
                        确定使用租赁服号“{currentInitInput.current}
                        ”初始化该SLOT吗？
                      </Text>
                      <Text size="sm">
                        请认真检查，我们不会因为填写错误导致无法使用而补偿。
                      </Text>
                    </Stack>
                  ),
                  labels: { confirm: '确定', cancel: '取消' },
                  onConfirm: onClickConfirm,
                });
              } else {
                try {
                  const playerInfo = await nemcQueryPlayer(
                    currentInitInput.current,
                  );
                  ModalConfirmPlayerWithAvatar(
                    '请确认',
                    '确定使用这个玩家初始化该SLOT吗？\n请认真检查，我们不会因为填写错误导致无法使用而补偿。',
                    playerInfo,
                    onClickConfirm,
                  );
                } catch (e) {
                  console.error(e);
                  if (e instanceof MV4RequestError || e instanceof Error) {
                    notifications.show({
                      title: '查找玩家失败',
                      message: e.message,
                      color: 'red',
                    });
                  }
                }
              }
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
              currentMarkInput.current = e.currentTarget.value.replaceAll(
                ' ',
                '',
              );
            }}
          />
          <Button
            fullWidth
            onClick={async () => {
              if (currentMarkInput.current.length === 0) {
                notifications.show({
                  message: '请输入内容',
                  color: 'red',
                  autoClose: 1000,
                });
                return;
              }
              modals.closeAll();
              try {
                await mv4RequestApi({
                  path: '/server-slot/edit-mark',
                  data: {
                    slotId: thisSlot.slotId,
                    mark: currentMarkInput.current,
                  },
                });
                notifications.show({
                  message: '修改成功',
                });
                await updateSlotList();
              } catch (e) {
                console.error(e);
                if (e instanceof MV4RequestError || e instanceof Error) {
                  notifications.show({
                    title: '修改卡槽备注失败',
                    message: e.message,
                    color: 'red',
                  });
                }
              }
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
      onConfirm: async () => {
        try {
          await mv4RequestApi({
            path: '/server-slot/drop-slot',
            data: {
              slotId: thisSlot.slotId,
            },
          });
          notifications.show({
            message: '删除成功',
          });
          await updateSlotList();
        } catch (e) {
          console.error(e);
          if (e instanceof MV4RequestError || e instanceof Error) {
            notifications.show({
              title: '删除卡槽失败',
              message: e.message,
              color: 'red',
            });
          }
        }
      },
    });
  }

  async function onClickManageThisSlot(thisSlot: ServerSlot, index: number) {
    modals.open({
      title: `管理SLOT`,
      children: (
        <Stack>
          <Text size="sm">
            卡槽类型：{getDurationChineseString(thisSlot.slotTime)}{' '}
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
    <MV4Card>
      <Stack gap={'md'}>
        <Title order={4}>您的 SLOT（卡槽）</Title>
        <Box>
          <Text size={'sm'}>
            除您绑定的游戏账号外，您只能使辅助用户进入以下租赁服/游戏账号名下的租赁服。
          </Text>
          <Text size={'sm'}>卡槽只会在初始化后开始计算有效期。</Text>
        </Box>
        {cardLoading && (
          <Text size={'sm'} fs={'italic'}>
            请稍等，正在加载。。。
          </Text>
        )}
        {!cardLoading && slots.length === 0 && (
          <Text size={'sm'} fs={'italic'}>
            （没有SLOT）
          </Text>
        )}
        {!cardLoading &&
          slots.map((item, i) => (
            <MV4Card key={item.slotId}>
              <Group justify={'space-between'}>
                <Stack>
                  {item.expire !== -1 ? (
                    <>
                      <Text size={'sm'}>
                        {item.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
                          '游戏账号 SLOT'}
                        {item.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
                          '租赁服号 SLOT'}
                        ：
                        {item.mark ? `${item.mark} (${item.data})` : item.data}
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
            </MV4Card>
          ))}
      </Stack>
    </MV4Card>
  );
}
