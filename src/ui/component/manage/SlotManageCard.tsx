import {
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Pagination,
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
  const currentRedeemCodeInput = useRef('');
  const [slots, setSlots] = useState<ServerSlot[]>([]);
  const [activePage, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_MAX_ITEMS = 8;

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
      setPage(1);
      setTotalPages(Math.ceil(ret.data.list.length / PAGE_MAX_ITEMS));
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
            卡槽类型：
            {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
              '玩家 SLOT'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服 SLOT'}
          </Text>
          <Text size="sm">
            总时长：{getDurationChineseString(thisSlot.slotTime)}
          </Text>
          <TextInput
            label={
              <>
                {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
                  '玩家昵称'}
                {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
                  '租赁服'}
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
              '玩家 SLOT'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服 SLOT'}
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
  async function onClickRenewThisSlotMark(thisSlot: ServerSlot, index: number) {
    currentRedeemCodeInput.current = '';
    modals.open({
      title: '续费卡槽',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <TextInput
            label="兑换码"
            placeholder="请输入对应类型（租赁服/玩家）的兑换码"
            onChange={e => {
              currentRedeemCodeInput.current = e.currentTarget.value;
            }}
          />
          <Button
            fullWidth
            onClick={async () => {
              modals.closeAll();
              try {
                const ret = await mv4RequestApi<any, { name: string }>({
                  path: '/redeem-code/get-status',
                  data: {
                    code: currentRedeemCodeInput.current,
                    requireSlotId: thisSlot.slotId,
                  },
                });
                modals.openConfirmModal({
                  title: '确定使用该兑换码续费吗？',
                  children: (
                    <Box>
                      <Text size="sm">兑换码名称：{ret.data.name}</Text>
                    </Box>
                  ),
                  labels: { confirm: '确定', cancel: '取消' },
                  onConfirm: async () => {
                    try {
                      await mv4RequestApi({
                        path: '/redeem-code/renew-server-slot',
                        data: {
                          requireSlotId: thisSlot.slotId,
                          code: currentRedeemCodeInput.current,
                        },
                      });
                      notifications.show({
                        message: '续费成功',
                      });
                      await updateSlotList();
                    } catch (e) {
                      console.error(e);
                      if (e instanceof MV4RequestError || e instanceof Error) {
                        notifications.show({
                          title: '续费失败',
                          message: e.message,
                          color: 'red',
                        });
                      }
                    }
                  },
                });
              } catch (e) {
                console.error(e);
                if (e instanceof MV4RequestError || e instanceof Error) {
                  notifications.show({
                    title: '续费失败',
                    message: e.message,
                    color: 'red',
                  });
                }
              }
            }}
            mt="md"
          >
            使用
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
              '玩家 SLOT'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服 SLOT'}
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
            卡槽类型：
            {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
              '玩家 SLOT'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服 SLOT'}
          </Text>
          <Text size="sm">
            总时长：{getDurationChineseString(thisSlot.slotTime)}
          </Text>
          <Text size="sm">
            绑定的
            {thisSlot.dataType === ServerSlotDataType.PLAYER_ID_SLOT &&
              '玩家昵称'}
            {thisSlot.dataType === ServerSlotDataType.SERVER_ID_SLOT &&
              '租赁服号'}
            ：{thisSlot.data}
          </Text>
          {thisSlot.mark && <Text size="sm">备注：{thisSlot.mark}</Text>}
          <Group mt="md">
            <Button
              onClick={() => {
                modals.closeAll();
                onClickEditThisSlotMark(thisSlot, index);
              }}
            >
              修改备注
            </Button>
            {!thisSlot.expireToClean && (
              <Button
                bg={'teal'}
                onClick={() => {
                  onClickRenewThisSlotMark(thisSlot, index);
                }}
              >
                续费
              </Button>
            )}
          </Group>
        </Stack>
      ),
    });
  }

  return (
    <MV4Card>
      <Stack gap={'md'}>
        <Title order={4}>您的 SLOT</Title>
        <Box>
          <Text size={'sm'}>
            除您绑定的服主账号外，您只能使辅助用户进入以下租赁服/玩家名下的租赁服。
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
        {!cardLoading && (
          <Text size={'sm'}>
            当前拥有 {slots.length} 个SLOT，正显示第{' '}
            {(activePage - 1) * PAGE_MAX_ITEMS + 1}~
            {Math.min(activePage * PAGE_MAX_ITEMS, slots.length)} 个
          </Text>
        )}
        <Grid gutter="xs" justify="flex-start" align="stretch">
          {!cardLoading &&
            slots
              .slice(
                (activePage - 1) * PAGE_MAX_ITEMS,
                activePage * PAGE_MAX_ITEMS,
              )
              .map((item, i) => (
                <Grid.Col
                  key={item.slotId}
                  span={{ base: 12, md: 6, lg: 3 }}
                  display={'grid'}
                >
                  <MV4Card
                    pd="md"
                    style={{
                      alignSelf: 'stretch',
                    }}
                  >
                    <Stack
                      style={{
                        flexGrow: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      {item.expire !== -1 ? (
                        <Stack gap={'xs'}>
                          <Text size={'sm'}>
                            #{(activePage - 1) * PAGE_MAX_ITEMS + i + 1}{' '}
                            {item.expireToClean && (
                              <Text span size={'sm'} c={'red'} fw={700}>
                                (自动删除){' '}
                              </Text>
                            )}
                            {item.dataType ===
                              ServerSlotDataType.PLAYER_ID_SLOT && '玩家'}
                            {item.dataType ===
                              ServerSlotDataType.SERVER_ID_SLOT && '租赁服'}
                            ：{item.data}
                          </Text>
                          {item.mark && <Text size="sm">({item.mark})</Text>}
                          <Text size={'xs'}>
                            {item.expire < nowUnix() ? '已过期' : '过期时间'}：
                            {formatTime(item.expire, true)}
                          </Text>
                        </Stack>
                      ) : (
                        <Group gap={0} p={0}>
                          <Text size={'sm'}>
                            #{(activePage - 1) * PAGE_MAX_ITEMS + i + 1}{' '}
                            {item.expireToClean && (
                              <Text span size={'sm'} c={'red'} fw={700}>
                                (自动删除){' '}
                              </Text>
                            )}
                            {item.dataType ===
                              ServerSlotDataType.PLAYER_ID_SLOT && '玩家 SLOT'}
                            {item.dataType ===
                              ServerSlotDataType.SERVER_ID_SLOT &&
                              '租赁服 SLOT'}{' '}
                            (未使用)
                          </Text>
                        </Group>
                      )}
                      <Group>
                        {item.expire < nowUnix() && item.expire !== -1 && (
                          <>
                            {!item.expireToClean && (
                              <Button
                                bg={'teal'}
                                onClick={() => {
                                  onClickRenewThisSlotMark(item, i);
                                }}
                              >
                                续费
                              </Button>
                            )}
                            <Button
                              bg={'red'}
                              onClick={() => {
                                onClickDropThisSlot(item, i);
                              }}
                            >
                              删除
                            </Button>
                          </>
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
                    </Stack>
                  </MV4Card>
                </Grid.Col>
              ))}
        </Grid>
        <Flex justify={'center'}>
          <Pagination
            disabled={cardLoading}
            withControls={false}
            size={'lg'}
            value={activePage}
            onChange={value => setPage(value)}
            total={totalPages}
          />
        </Flex>
      </Stack>
    </MV4Card>
  );
}
