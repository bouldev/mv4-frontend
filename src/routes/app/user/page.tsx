import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { MD5 } from 'crypto-js';
import { useModel } from '@modern-js/runtime/model';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';
import {
  permissionToString,
  productExpireDateToString,
  productTypeToString,
} from '@/stringUtils';
import { GlobalUserModel } from '@/model/globalUserModel';

export default function UserPage() {
  const { colorScheme } = useMantineColorScheme();
  const [userModelState, userModelActions] = useModel(GlobalUserModel);
  const [showMore, setShowMore] = useState(false);

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
        </Card>
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
        </Card>
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
            <Title order={4}>您绑定的游戏账号</Title>
            <Stack gap={'sm'}>
              <Alert color="orange" title="注意">
                <Text size={'sm'}>
                  游戏账号属于我们认定所有者租赁服的依据，一旦绑定将不可解绑。
                </Text>
                <Text size={'sm'}>我们不会受理任何的解绑请求。</Text>
              </Alert>
              <Text>***</Text>
              <Group gap={'sm'}>
                <Button>展示绑定信息</Button>
                <Button>绑定新账户</Button>
              </Group>
            </Stack>
          </Stack>
        </Card>
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
            <Title order={4}>安全设置</Title>
            <Stack gap={'sm'}>
              {userModelState.user.email.length > 0 ? (
                <Text>邮箱：{userModelState.user.email}</Text>
              ) : (
                <Text>未绑定邮箱</Text>
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
        </Card>
      </Stack>
    </Stack>
  );
}
