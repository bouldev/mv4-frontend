import {
  Alert,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useEffect, useRef, useState } from 'react';
import MV4Card from '@/ui/component/app/MV4Card';
import { nemcQueryPlayer } from '@/api/nemcQueryPlayer';
import { ModalConfirmPlayerWithAvatar } from '@/ui/component/ModalConfirmPlayerWithAvatar';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';

export default function BindPlayerCard() {
  const [showLoading, setShowLoading] = useState(true);
  const [bindPlayerInfo, setBindingPlayerInfo] = useState({
    name: '',
    uid: '',
  });
  const currentPlayerNameInput = useRef('');

  useEffect(() => {
    async function init() {
      setTimeout(async () => {
        try {
          await getBindPlayerInfo();
        } catch (e) {
          console.error(e);
        }
      }, 500);
    }
    init();
  }, []);

  async function getBindPlayerInfo() {
    setShowLoading(true);
    try {
      const ret = await mv4RequestApi<
        any,
        {
          name: string;
          uid: string;
        }
      >({
        path: '/user/bind-player/info',
        methodGet: true,
      });
      setBindingPlayerInfo(ret.data);
      setShowLoading(false);
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: '获取绑定玩家信息失败，请刷新页面',
          message: e.message,
          color: 'red',
        });
      }
    }
  }

  async function onClickBindPlayer() {
    currentPlayerNameInput.current = '';
    modals.open({
      title: '绑定服主账号',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <TextInput
            label="玩家昵称"
            placeholder={'请输入'}
            onChange={e => {
              currentPlayerNameInput.current = e.currentTarget.value.replaceAll(
                ' ',
                '',
              );
            }}
          />
          <Button
            fullWidth
            onClick={async () => {
              if (currentPlayerNameInput.current.length === 0) {
                notifications.show({
                  message: '请输入内容',
                  color: 'red',
                  autoClose: 1000,
                });
                return;
              }
              modals.closeAll();
              try {
                const playerInfo = await nemcQueryPlayer(
                  currentPlayerNameInput.current,
                );
                ModalConfirmPlayerWithAvatar(
                  '请确认',
                  '确定绑定这个玩家吗？一旦绑定将不可修改。',
                  playerInfo,
                  async () => {
                    try {
                      await mv4RequestApi({
                        path: '/user/bind-player/bind',
                        data: {
                          playerName: currentPlayerNameInput.current,
                        },
                      });
                      notifications.show({
                        message: '绑定服主账号成功',
                      });
                      await getBindPlayerInfo();
                    } catch (e) {
                      console.error(e);
                      if (e instanceof MV4RequestError || e instanceof Error) {
                        notifications.show({
                          title: '绑定服主账号失败',
                          message: e.message,
                          color: 'red',
                        });
                      }
                    }
                  },
                );
              } catch (e) {
                console.error(e);
                if (e instanceof MV4RequestError || e instanceof Error) {
                  notifications.show({
                    title: '绑定服主账号失败',
                    message: e.message,
                    color: 'red',
                  });
                }
              }
            }}
            mt="md"
          >
            绑定
          </Button>
        </Stack>
      ),
    });
  }

  return (
    <MV4Card>
      <Stack gap={'md'}>
        <Title order={4}>您绑定的服主账号</Title>
        <Text size={'sm'}>
          绑定服主账号后，您将能在
          <Text span fw={700}>
            订阅有效
          </Text>
          的情况下无限制地使辅助用户进入
          <Text span fw={700}>
            该服主账号名下的
          </Text>
          租赁服。
        </Text>
        <Stack gap={'sm'}>
          <Alert color="orange" title="注意">
            <Text size={'sm'}>
              服主账号属于我们认定所有者租赁服的依据，一旦绑定将不可解绑。
            </Text>
            <Text size={'sm'}>我们不会受理任何的解绑请求。</Text>
          </Alert>
          {showLoading && (
            <Text size={'sm'} fs={'italic'}>
              正在加载。。。
            </Text>
          )}
          {!showLoading && bindPlayerInfo.uid.length > 0 && (
            <Text size={'sm'}>
              {bindPlayerInfo.name} (UID:{bindPlayerInfo.uid})
            </Text>
          )}
          {!showLoading && bindPlayerInfo.uid.length === 0 && (
            <Text fs={'italic'}>（未绑定）</Text>
          )}
          {!showLoading && bindPlayerInfo.uid.length === 0 && (
            <Group gap={'sm'}>
              <Button onClick={onClickBindPlayer}>绑定新账户</Button>
            </Group>
          )}
        </Stack>
      </Stack>
    </MV4Card>
  );
}
