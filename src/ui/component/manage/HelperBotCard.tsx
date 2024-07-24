import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { Caution, Key, User } from '@icon-park/react';
import { useEffect, useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { MD5 } from 'crypto-js';
import eleCss from '@/ui/css/elements.module.css';
import { HelperBotStatus } from '@/api/helper_bot';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';

export default function HelperBotCard() {
  const { colorScheme } = useMantineColorScheme();
  const [helperBotState, setHelperBotState] = useState<{
    loaded: boolean;
    helperBotStatus: HelperBotStatus;
    nickname: string;
    dailySigned: boolean;
    level: number;
    exp: number;
    need_exp: number;
  }>({
    loaded: false,
    helperBotStatus: HelperBotStatus.NEED_INIT,
    nickname: '',
    dailySigned: false,
    level: 0,
    exp: 0,
    need_exp: 0,
  });
  const [isPageInit, setIsPageInit] = useState(false);
  const [hasErr, setHasErr] = useState(false);
  const [errReason, setErrReason] = useState('');
  const gameNickname = useRef('');
  const gameAccount = useRef('');
  const gamePassword = useRef('');
  const realnameUrl = useRef('');

  async function refreshHelperBotStatus() {
    setHelperBotState({
      loaded: false,
      helperBotStatus: HelperBotStatus.NEED_INIT,
      nickname: '',
      dailySigned: false,
      level: 0,
      exp: 0,
      need_exp: 0,
    });
    setHasErr(false);
    try {
      const ret = await mv4RequestApi<
        any,
        {
          needRealname: boolean;
          realnameMessage: string;
          realnameUrl: string;
          status: HelperBotStatus;
          nickname: string;
          dailySigned: boolean;
          level: number;
          exp: number;
          need_exp: number;
        }
      >({
        path: '/helper-bot/info',
        methodGet: true,
      });
      if (ret.data.needRealname) {
        setHasErr(true);
        setErrReason(ret.data.realnameMessage);
        realnameUrl.current = ret.data.realnameUrl;
      }
      setHelperBotState({
        loaded: true,
        helperBotStatus: ret.data.status,
        nickname: ret.data.nickname,
        dailySigned: ret.data.dailySigned,
        level: ret.data.level,
        exp: ret.data.exp,
        need_exp: ret.data.need_exp,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: '获取辅助用户状态失败',
          message: e.message,
          color: 'red',
        });
      }
    }
  }

  async function initHelperBot() {
    setHasErr(false);
    try {
      await mv4RequestApi({
        path: '/helper-bot/setup/init',
        methodGet: true,
      });
      await refreshHelperBotStatus();
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        setHasErr(true);
        setErrReason(e.message);
      }
    }
  }

  async function helperBotGenAccount() {
    setHasErr(false);
    try {
      const ret = await mv4RequestApi<
        any,
        {
          needRealname: boolean;
          realnameMessage: string;
          realnameUrl: string;
          status: HelperBotStatus;
          nickname: string;
          dailySigned: boolean;
        }
      >({
        path: '/helper-bot/setup/gen-new-account',
        methodGet: true,
      });
      if (ret.data.needRealname) {
        setHasErr(true);
        setErrReason(ret.data.realnameMessage);
        realnameUrl.current = ret.data.realnameUrl;
      } else {
        notifications.show({
          message: '操作成功',
        });
      }
      setHelperBotState({
        loaded: true,
        helperBotStatus: ret.data.status,
        nickname: ret.data.nickname,
        dailySigned: ret.data.dailySigned,
        level: helperBotState.level,
        exp: helperBotState.exp,
        need_exp: helperBotState.need_exp,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        setHasErr(true);
        setErrReason(e.message);
      }
    }
  }

  async function helperBotLoginAccount() {
    setHasErr(false);
    modals.open({
      title: '使用自己的账号',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <Text size="sm">注意：只支持网易邮箱账号。</Text>
          <TextInput
            label="账号"
            leftSection={<User />}
            onChange={e => {
              gameAccount.current = e.currentTarget.value;
            }}
          />
          <PasswordInput
            label="密码"
            leftSection={<Key />}
            onChange={e => {
              gamePassword.current = e.currentTarget.value;
            }}
          />
          <Button
            fullWidth
            onClick={() => {
              modals.closeAll();
              onClickLoginAccount();
            }}
            mt="md"
          >
            登录
          </Button>
        </Stack>
      ),
    });
  }

  async function onClickLoginAccount() {
    try {
      const ret = await mv4RequestApi<
        any,
        {
          needRealname: boolean;
          realnameMessage: string;
          realnameUrl: string;
          status: HelperBotStatus;
          nickname: string;
          dailySigned: boolean;
        }
      >({
        path: '/helper-bot/setup/login-account',
        data: {
          account: gameAccount.current,
          password_md5: MD5(gamePassword.current).toString(),
        },
      });
      if (ret.data.needRealname) {
        setHasErr(true);
        setErrReason(ret.data.realnameMessage);
        realnameUrl.current = ret.data.realnameUrl;
      } else {
        notifications.show({
          message: '操作成功',
        });
      }
      setHelperBotState({
        loaded: true,
        helperBotStatus: ret.data.status,
        nickname: ret.data.nickname,
        dailySigned: ret.data.dailySigned,
        level: helperBotState.level,
        exp: helperBotState.exp,
        need_exp: helperBotState.need_exp,
      });
      gameAccount.current = '';
      gamePassword.current = '';
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        setHasErr(true);
        setErrReason(e.message);
      }
    }
  }

  async function helperBotSetNickname() {
    setHasErr(false);
    modals.open({
      title: '设置辅助用户的昵称',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <TextInput
            label="新昵称"
            leftSection={<User />}
            onChange={e => {
              gameNickname.current = e.currentTarget.value;
            }}
          />
          <Button
            fullWidth
            onClick={() => {
              modals.closeAll();
              onClickSetNickname();
            }}
            mt="md"
          >
            修改
          </Button>
        </Stack>
      ),
    });
  }

  async function onClickSetNickname() {
    try {
      const ret = await mv4RequestApi<
        any,
        {
          status: HelperBotStatus;
          nickname: string;
          dailySigned: boolean;
        }
      >({
        path: '/helper-bot/set-nickname',
        data: {
          nickname: gameNickname.current,
        },
      });
      setHelperBotState({
        loaded: true,
        helperBotStatus: ret.data.status,
        nickname: ret.data.nickname,
        dailySigned: ret.data.dailySigned,
        level: helperBotState.level,
        exp: helperBotState.exp,
        need_exp: helperBotState.need_exp,
      });
      notifications.show({
        message: '操作成功',
      });
      gameNickname.current = '';
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        setHasErr(true);
        setErrReason(e.message);
      }
    }
  }

  async function helperBotDailySign() {
    modals.openConfirmModal({
      title: '辅助用户签到',
      children: (
        <Box>
          <Text size="sm">
            签到可提升辅助用户的游戏等级，使其能进入更高等级的租赁服。
          </Text>
          <Text size="sm">辅助用户每日首次进入租赁服时，将自动进行签到。</Text>
        </Box>
      ),
      labels: { confirm: '确定签到', cancel: '取消' },
      onConfirm: async () => {
        try {
          const ret = await mv4RequestApi<
            any,
            {
              status: HelperBotStatus;
              nickname: string;
              dailySigned: boolean;
              level: number;
              exp: number;
              need_exp: number;
            }
          >({
            path: '/helper-bot/daily-sign',
            methodGet: true,
          });
          notifications.show({
            message: '操作成功',
          });
          setHelperBotState({
            loaded: true,
            helperBotStatus: ret.data.status,
            nickname: ret.data.nickname,
            dailySigned: ret.data.dailySigned,
            level: ret.data.level,
            exp: ret.data.exp,
            need_exp: ret.data.need_exp,
          });
        } catch (e) {
          console.error(e);
          if (e instanceof MV4RequestError || e instanceof Error) {
            setHasErr(true);
            setErrReason(e.message);
          }
        }
      },
    });
  }

  useEffect(() => {
    async function init() {
      if (!isPageInit) {
        await refreshHelperBotStatus();
        setIsPageInit(true);
      }
    }
    init();
  }, []);

  return (
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
        <Title order={4}>您的辅助用户</Title>
        <Box>
          <Text size={'sm'}>
            辅助用户是用于进入您的租赁服完成操作的
            <Text span fw={700}>
              机器人用户
            </Text>
            。
          </Text>
          <Text size={'sm'}>
            辅助用户的创建是 PhoenixBuilder
            正常工作的必要条件，请确保您已设置完毕。
          </Text>
        </Box>
        <Alert color="red" title="出现错误" icon={<Caution />} hidden={!hasErr}>
          <Text size={'sm'} fw={700}>
            {errReason}
          </Text>
        </Alert>
        {helperBotState.loaded ? (
          <>
            {helperBotState.helperBotStatus === HelperBotStatus.NEED_INIT && (
              <>
                <Text>（未初始化）</Text>
                <Group gap={'sm'} pt={'sm'}>
                  <Button onClick={refreshHelperBotStatus}>刷新状态</Button>
                  <Button onClick={initHelperBot}>初始化</Button>
                </Group>
              </>
            )}
            {helperBotState.helperBotStatus ===
              HelperBotStatus.NEED_LOGIN_ACCOUNT && (
              <>
                <Text>（未登录账号）</Text>
                <Group gap={'sm'} pt={'sm'}>
                  <Button onClick={refreshHelperBotStatus}>刷新状态</Button>
                  <Button onClick={helperBotGenAccount}>自动生成新账号</Button>
                  <Button
                    bg={'orange'}
                    onClick={() => {
                      helperBotLoginAccount();
                    }}
                  >
                    使用自己的账号
                  </Button>
                </Group>
              </>
            )}
            {helperBotState.helperBotStatus ===
              HelperBotStatus.NEED_REALNAME && (
              <>
                <Text>（未实名）</Text>
                <Group gap={'sm'} pt={'sm'}>
                  <Button onClick={refreshHelperBotStatus}>刷新状态</Button>
                  <Button
                    onClick={() => {
                      window.open(realnameUrl.current, '_blank');
                    }}
                  >
                    前往实名
                  </Button>
                </Group>
              </>
            )}
            {helperBotState.helperBotStatus >=
              HelperBotStatus.NEED_SET_NICKNAME && (
              <>
                <Text>
                  昵称：
                  {helperBotState.nickname
                    ? helperBotState.nickname
                    : '（未设置昵称）'}{' '}
                  <Text span>
                    (Lv.
                    {helperBotState.level > 0
                      ? `${helperBotState.level} (${helperBotState.exp}/${helperBotState.need_exp})`
                      : '-'}
                    )
                  </Text>
                </Text>
                <Group gap={'sm'} pt={'sm'}>
                  <Button onClick={refreshHelperBotStatus}>刷新状态</Button>
                  <Button
                    onClick={() => {
                      helperBotSetNickname();
                    }}
                  >
                    设置昵称
                  </Button>
                  {helperBotState.nickname && (
                    <>
                      {helperBotState.dailySigned ? (
                        <Button disabled>已签到</Button>
                      ) : (
                        <Button onClick={helperBotDailySign}>签到</Button>
                      )}
                    </>
                  )}
                </Group>
              </>
            )}
          </>
        ) : (
          <Text size={'sm'} fs={'italic'}>
            请稍等，正在加载。。。
          </Text>
        )}
      </Stack>
    </Card>
  );
}
