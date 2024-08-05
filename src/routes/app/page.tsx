import {
  Flex,
  Pagination,
  Text,
  Stack,
  Title,
  Divider,
  LoadingOverlay,
  Anchor,
  Group,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useModel } from '@modern-js/runtime/model';
import { modals } from '@mantine/modals';
import PageTitle from '@/ui/component/app/PageTitle';
import { Announcement } from '@/api/announcement';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import { GlobalUserModel } from '@/model/globalUserModel';
import { MV4UserPermissionLevel } from '@/api/user';
import MV4Card from '@/ui/component/app/MV4Card';

export default function AnnouncementPage() {
  const [activePage, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentList, setCurrentList] = useState<Announcement[]>([
    {
      title: '-',
      content: '-',
      date: '-',
      timestamp: 0,
      author: '-',
      uniqueId: '-',
      up: 0,
      down: 0,
    },
  ]);
  const [showLoading, setShowLoading] = useState(true);
  const [userModelState] = useModel(GlobalUserModel);

  useEffect(() => {
    async function init() {
      try {
        const ret = await mv4RequestApi<
          { page: number },
          { list: Announcement[]; total: number }
        >({
          path: '/announcement/get-list',
          data: {
            page: 1,
          },
        });
        setTotalPages(Math.ceil(ret.data.total / 10));
        setCurrentList(ret.data.list);
        setShowLoading(false);
      } catch (e) {
        console.error(e);
        notifications.show({
          title: '公告加载失败',
          message: '请刷新页面以重新加载',
          color: 'red',
        });
      }
    }
    init();
  }, []);

  async function onChangePage(page: number) {
    setShowLoading(true);
    try {
      const ret = await mv4RequestApi<
        { page: number },
        { list: Announcement[]; total: number }
      >({
        path: '/announcement/get-list',
        data: {
          page,
        },
      });
      setPage(page);
      setTotalPages(Math.ceil(ret.data.total / 10));
      setCurrentList(ret.data.list);
      setShowLoading(false);
    } catch (e) {
      console.error(e);
      setShowLoading(false);
      notifications.show({
        message: '获取公告失败，请再试一次',
        color: 'red',
      });
    }
  }

  function onClickDeleteAnnouncementPage(uniqueId: string, title: string) {
    modals.openConfirmModal({
      title: '确定删除这条公告吗？',
      children: <Text size="sm">标题：{title}</Text>,
      labels: { confirm: '确定', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await mv4RequestApi({
            path: '/announcement/delete',
            data: {
              id: uniqueId,
            },
          });
          await onChangePage(activePage);
        } catch (e) {
          if (e instanceof Error || e instanceof MV4RequestError) {
            console.error(e);
            notifications.show({
              message: e.message,
              color: 'red',
            });
          }
        }
      },
    });
  }

  async function updateItByUniqueId(index: number, id: string) {
    setShowLoading(true);
    try {
      const ret = await mv4RequestApi<{ id: string }, Announcement>({
        path: '/announcement/get-by-id',
        data: {
          id,
        },
      });
      setShowLoading(false);
      const copied = currentList;
      copied[index].up = ret.data.up;
      copied[index].down = ret.data.down;
      setCurrentList(copied);
      return ret;
    } catch (e) {
      console.error(e);
      setShowLoading(false);
      notifications.show({
        message: '获取公告失败，请再试一次',
        color: 'red',
      });
      throw e;
    }
  }

  return (
    <Stack>
      <PageTitle>公告</PageTitle>
      <Stack>
        <LoadingOverlay
          visible={showLoading}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <Stack gap={'md'}>
          {currentList.map((item, i) => (
            <MV4Card key={item.uniqueId}>
              <Title order={5}>{item.title}</Title>
              <Text size="sm" c="dimmed">
                Author: {item.author}
              </Text>
              <Text size="sm" c="dimmed">
                Date: {item.date}
              </Text>
              <Divider mt="xs" />
              <Text
                size="sm"
                c="dimmed"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
              <Group gap={'sm'} pt={'sm'}>
                <Anchor
                  type={'button'}
                  component={'button'}
                  onClick={async () => {
                    try {
                      await mv4RequestApi({
                        path: '/announcement/up-vote',
                        data: {
                          id: item.uniqueId,
                        },
                      });
                      await updateItByUniqueId(i, item.uniqueId);
                    } catch (e) {
                      if (e instanceof Error || e instanceof MV4RequestError) {
                        console.error(e);
                        setShowLoading(false);
                        notifications.show({
                          message: e.message,
                          color: 'red',
                        });
                      }
                    }
                  }}
                >
                  支持 ({item.up})
                </Anchor>
                <Anchor
                  type={'button'}
                  component={'button'}
                  onClick={async () => {
                    try {
                      await mv4RequestApi({
                        path: '/announcement/down-vote',
                        data: {
                          id: item.uniqueId,
                        },
                      });
                      await updateItByUniqueId(i, item.uniqueId);
                    } catch (e) {
                      if (e instanceof Error || e instanceof MV4RequestError) {
                        console.error(e);
                        setShowLoading(false);
                        notifications.show({
                          message: e.message,
                          color: 'red',
                        });
                      }
                    }
                  }}
                >
                  反对 ({item.down})
                </Anchor>
                {userModelState.user.permission >=
                MV4UserPermissionLevel.ADMIN ? (
                  <Anchor
                    c={'red'}
                    type={'button'}
                    component={'button'}
                    onClick={() => {
                      onClickDeleteAnnouncementPage(item.uniqueId, item.title);
                    }}
                  >
                    删除
                  </Anchor>
                ) : null}
              </Group>
            </MV4Card>
          ))}
        </Stack>
        <Flex justify={'center'}>
          <Pagination
            disabled={showLoading}
            withControls={false}
            size={'lg'}
            value={activePage}
            onChange={value => onChangePage(value)}
            total={totalPages}
          />
        </Flex>
      </Stack>
    </Stack>
  );
}
