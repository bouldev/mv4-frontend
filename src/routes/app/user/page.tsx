import { Avatar, Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useEffect, useState } from 'react';
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
import { downloadBlobText } from '@/utils/blobUtils';
import MV4Card from '@/ui/component/app/MV4Card';

export default function UserPage() {
  const [userModelState, userModelActions] = useModel(GlobalUserModel);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        await userModelActions.update();
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
              <Text>
                FBCoin：{showMore ? userModelState.user.fbCoins : '***'}
              </Text>
              {userModelState.user.balance > 0 ? (
                <Text>
                  余额：{showMore ? userModelState.user.balance : '***'}
                </Text>
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
