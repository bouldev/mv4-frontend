import {
  Alert,
  Avatar,
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useEffect, useRef, useState } from 'react';
import { MD5 } from 'crypto-js';
import { useModel } from '@modern-js/runtime/model';
import { useNavigate } from '@modern-js/runtime/router';
import { notifications } from '@mantine/notifications';
import PageTitle from '@/ui/component/app/PageTitle';
import {
  permissionToString,
  productExpireDateToString,
  productTypeToString,
} from '@/utils/stringUtils';
import { GlobalUserModel } from '@/model/globalUserModel';
import { MV4RequestError } from '@/api/base';
import { mv4RequestApi } from '@/api/mv4Client';
import { ModalConfirmPlayerWithAvatar } from '@/ui/component/ModalConfirmPlayerWithAvatar';
import { nemcQueryPlayer } from '@/api/nemcQueryPlayer';
import { downloadBlobText } from '@/utils/blobUtils';
import MV4Card from '@/ui/component/app/MV4Card';

export default function UserPage() {
  const [userModelState, userModelActions] = useModel(GlobalUserModel);
  const [showMore, setShowMore] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [bindPlayerInfo, setBindingPlayerInfo] = useState({
    name: '',
    uid: '',
  });
  const currentPlayerNameInput = useRef('');
  const navigate = useNavigate();

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
      title: '绑定游戏账号',
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
                        message: '绑定游戏账号成功',
                      });
                      await getBindPlayerInfo();
                    } catch (e) {
                      console.error(e);
                      if (e instanceof MV4RequestError || e instanceof Error) {
                        notifications.show({
                          title: '绑定游戏账号失败',
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
                    title: '绑定游戏账号失败',
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

  useEffect(() => {
    async function init() {
      try {
        await userModelActions.update();
        await getBindPlayerInfo();
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  return (
    <Stack>
      <PageTitle>用户</PageTitle>
      <Stack gap={'sm'}>
        <MV4Card>
          <Stack gap={'md'}>
            <Group gap={'sm'}>
              <Avatar
                variant="filled"
                radius="sm"
                size="xl"
                src={
                  userModelState.user.email.length > 0
                    ? `https://cravatar.cn/avatar/${MD5(
                        userModelState.user.email.trim().toLowerCase(),
                      ).toString()}?s=550`
                    : null
                }
                onClick={() => {
                  modals.open({
                    title: '这是什么？',
                    children: (
                      <Box>
                        <Text>这是您的用户头像。</Text>
                        <Text>
                          它将同步您绑定的邮箱所设置的 Gravatar/Cravatar 头像。
                        </Text>
                        <Text>如果您未绑定邮箱，将显示为默认头像。</Text>
                      </Box>
                    ),
                  });
                }}
              />
              <Stack gap={4}>
                <Title order={4}>{userModelState.user.username}</Title>
                <Text size={'sm'}>
                  {permissionToString(userModelState.user.permission)}
                </Text>
              </Stack>
            </Group>
          </Stack>
        </MV4Card>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>账号信息</Title>
            <Stack gap={'sm'}>
              <Text>产品：{productTypeToString(userModelState.user.plan)}</Text>
              <Text>
                产品有效期：{productExpireDateToString(userModelState.user)}
              </Text>
              {showMore ? (
                <>
                  {userModelState.user.balance > 0 ? (
                    <Text>余额：{userModelState.user.balance}</Text>
                  ) : null}
                  <Text>FBCoins：{userModelState.user.fbCoins}</Text>
                </>
              ) : null}
              <Group gap={'sm'}>
                <Button
                  onClick={() => {
                    setShowMore(!showMore);
                  }}
                >
                  {showMore ? '隐藏详细信息' : '展示详细信息'}
                </Button>
              </Group>
            </Stack>
          </Stack>
        </MV4Card>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>您绑定的游戏账号</Title>
            <Text size={'sm'}>
              绑定游戏账号后，您将能在
              <Text span fw={700}>
                订阅有效
              </Text>
              的情况下无限制地使辅助用户进入
              <Text span fw={700}>
                该游戏账号名下的
              </Text>
              租赁服。
            </Text>
            <Stack gap={'sm'}>
              <Alert color="orange" title="注意">
                <Text size={'sm'}>
                  游戏账号属于我们认定所有者租赁服的依据，一旦绑定将不可解绑。
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
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>安全设置</Title>
            <Text size={'sm'}>邮箱是您在发生意外时找回账号的唯一手段。</Text>
            <Stack gap={'sm'}>
              {userModelState.user.email.length > 0 ? (
                <Text>邮箱：{userModelState.user.email}</Text>
              ) : (
                <Text fs={'italic'}>未绑定邮箱</Text>
              )}
              <Group gap={'sm'}>
                <Button
                  onClick={() => {
                    window.location.href = '/login?action=set_new_email';
                  }}
                >
                  {userModelState.user.email.length > 0
                    ? '改绑新邮箱'
                    : '绑定邮箱'}
                </Button>
                <Button
                  bg={'grape'}
                  onClick={() => {
                    window.location.href = '/login?action=change_password';
                  }}
                >
                  修改密码
                </Button>
              </Group>
            </Stack>
          </Stack>
        </MV4Card>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>FBToken</Title>
            <Stack gap={'sm'}>
              <Group gap={'sm'}>
                <Button
                  onClick={async () => {
                    try {
                      const ret = await mv4RequestApi<
                        any,
                        {
                          token: string;
                        }
                      >({
                        path: '/user/get-fbtoken',
                        methodGet: true,
                      });
                      downloadBlobText(ret.data.token, 'fbtoken');
                    } catch (e) {
                      console.error(e);
                      if (e instanceof MV4RequestError || e instanceof Error) {
                        notifications.show({
                          title: '获取FBToken失败',
                          message: e.message,
                          color: 'red',
                        });
                      }
                    }
                  }}
                >
                  获取FBToken
                </Button>
              </Group>
            </Stack>
          </Stack>
        </MV4Card>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>其他</Title>
            <Stack gap={'sm'}>
              <Group gap={'sm'}>
                <Button
                  onClick={() => {
                    navigate('/app/my-orders');
                  }}
                >
                  历史订单
                </Button>
              </Group>
            </Stack>
          </Stack>
        </MV4Card>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>危险区域</Title>
            <Stack gap={'sm'}>
              <Group gap={'sm'}>
                <Button
                  bg={'red'}
                  onClick={async () => {
                    modals.openConfirmModal({
                      title: '确定丢弃辅助用户吗？',
                      children: (
                        <Box>
                          <Text size="sm">
                            一旦丢弃辅助用户，它就会永远消失！
                          </Text>
                        </Box>
                      ),
                      labels: { confirm: '确定丢弃', cancel: '取消' },
                      confirmProps: { color: 'red' },
                      onConfirm: async () => {
                        try {
                          await mv4RequestApi({
                            path: '/helper-bot/drop',
                            methodGet: true,
                          });
                          notifications.show({
                            message: '操作成功',
                          });
                        } catch (e) {
                          console.error(e);
                          if (
                            e instanceof MV4RequestError ||
                            e instanceof Error
                          ) {
                            notifications.show({
                              title: '丢弃辅助用户失败',
                              message: e.message,
                            });
                          }
                        }
                      },
                    });
                  }}
                >
                  丢弃辅助用户
                </Button>
              </Group>
            </Stack>
          </Stack>
        </MV4Card>
      </Stack>
    </Stack>
  );
}
