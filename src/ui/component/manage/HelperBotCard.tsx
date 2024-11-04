import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Caution, Key, MessageSecurity, Phone, User } from '@icon-park/react';
import { useEffect, useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { MD5 } from 'crypto-js';
import { useDisclosure } from '@mantine/hooks';
import { HelperBotStatus } from '@/api/helper_bot';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import MV4Card from '@/ui/component/app/MV4Card';
import { awaitSleep } from '@/utils/asyncUtils';
import initTianAiCaptcha from '@/utils/tianAiCaptcha';

export default function HelperBotCard({
  isUserAccount = false,
}: {
  isUserAccount?: boolean;
}) {
  const [helperBotState, setHelperBotState] = useState<{
    loaded: boolean;
    helperBotStatus: HelperBotStatus;
    nickname: string;
    dailySigned: boolean;
    level: number;
    exp: number;
    need_exp: number;
    enableSkin: boolean;
  }>({
    loaded: false,
    helperBotStatus: HelperBotStatus.NEED_INIT,
    nickname: '',
    dailySigned: false,
    level: 0,
    exp: 0,
    need_exp: 0,
    enableSkin: false,
  });
  const [isPageInit, setIsPageInit] = useState(false);
  const [hasErr, setHasErr] = useState(false);
  const [errReason, setErrReason] = useState('');

  const realnameUrl = useRef('');

  const gameNickname = useRef('');
  const gameAccount = useRef('');
  const gamePassword = useRef('');

  const gamePhoneNum = useRef('');
  const gameVerifySMSCode = useRef('');

  const [captchaModalOpened, captchaModalActions] = useDisclosure(false);
  const [captchaInitSuccess, setCaptchaInitSuccess] = useState(false);

  const BASE_PATH = isUserAccount ? '/game-account' : '/helper-bot';
  const CARD_NAME = isUserAccount ? '游戏账号' : '辅助用户';

  async function refreshHelperBotStatus() {
    setHelperBotState({
      loaded: false,
      helperBotStatus: HelperBotStatus.NEED_INIT,
      nickname: '',
      dailySigned: false,
      level: 0,
      exp: 0,
      need_exp: 0,
      enableSkin: false,
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
          enableSkin: boolean;
        }
      >({
        path: `${BASE_PATH}/info`,
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
        enableSkin: ret.data.enableSkin,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: `获取${CARD_NAME}状态失败`,
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
        path: `/${BASE_PATH}/setup/init`,
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
        path: `/${BASE_PATH}/setup/gen-new-account`,
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
        enableSkin: helperBotState.enableSkin,
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
      title: '邮箱登录',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <TextInput
            label="账号"
            leftSection={<User />}
            placeholder="example@example.com"
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

  async function helperBotPhoneLoginAccount() {
    setHasErr(false);
    modals.open({
      title: '手机号登录',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <Grid gutter="xs" justify="flex-start" align="stretch">
            <Grid.Col span={12}>
              <TextInput
                label="手机号"
                leftSection={<Phone />}
                onChange={e => {
                  gamePhoneNum.current = e.currentTarget.value;
                }}
              />
            </Grid.Col>
            <Grid.Col span={8}>
              <TextInput
                label="验证码"
                leftSection={<MessageSecurity />}
                onChange={e => {
                  gameVerifySMSCode.current = e.currentTarget.value;
                }}
              />
            </Grid.Col>
            <Grid.Col span={4} display="flex">
              <Button
                size="sm"
                onClick={() => {
                  onClickPhoneLoginSendSMS();
                }}
                style={{
                  alignSelf: 'flex-end',
                }}
              >
                获取验证码
              </Button>
            </Grid.Col>
          </Grid>
          <Button
            fullWidth
            onClick={() => {
              onClickPhoneLoginAccount();
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
    if (gameAccount.current.length === 0) {
      notifications.show({
        message: '账号不得为空',
        color: 'red',
      });
    }
    if (gamePassword.current.length === 0) {
      notifications.show({
        message: '密码不得为空',
        color: 'red',
      });
    }
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
          enableSkin: boolean;
        }
      >({
        path: `${BASE_PATH}/setup/login-account`,
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
        enableSkin: helperBotState.enableSkin,
      });
      gameAccount.current = '';
      gamePassword.current = '';
      modals.closeAll();
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        setHasErr(true);
        setErrReason(e.message);
      }
      modals.closeAll();
    }
  }

  async function onClickPhoneLoginSendSMS() {
    if (gamePhoneNum.current.length === 0) {
      notifications.show({
        message: '手机号不得为空',
        color: 'red',
      });
      return;
    }
    setCaptchaInitSuccess(false);
    captchaModalActions.open();
    await awaitSleep(100);
    initTianAiCaptcha('#tac-box-shop', {
      onSuccess: async token => {
        captchaModalActions.close();
        try {
          const ret = await mv4RequestApi<
            any,
            {
              reqSucc: boolean;
              msg: string;
              sms_content: string;
              need_code: boolean;
            }
          >({
            path: `${BASE_PATH}/setup/phone-request-sms`,
            data: {
              phoneNumber: gamePhoneNum.current,
              captcha_token: token,
            },
          });
          if (!ret.data.reqSucc) {
            onRequestSMSFailed(
              ret.data.msg,
              ret.data.sms_content,
              ret.data.need_code,
            );
            return;
          }
          notifications.show({
            message: '已请求验证码，请注意查收',
          });
        } catch (e) {
          console.error(e);
          if (e instanceof MV4RequestError || e instanceof Error) {
            modals.open({
              title: '验证码请求失败',
              closeOnEscape: false,
              closeOnClickOutside: false,
              children: (
                <Box>
                  <Text>{e.message}</Text>
                </Box>
              ),
            });
          }
        }
      },
      onClickClose: () => {
        captchaModalActions.close();
      },
      onInitialize: () => {
        setCaptchaInitSuccess(true);
      },
    });
  }

  async function onRequestSMSFailed(
    msg: string,
    sms_content: string,
    need_code: boolean,
  ) {
    modals.openConfirmModal({
      title: '验证码请求失败',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Box>
          <Text size="sm">{msg}</Text>
        </Box>
      ),
      labels: { confirm: '我已发送', cancel: '取消' },
      onConfirm: async () => {
        if (need_code) {
          return;
        }
        const _state = helperBotState;
        _state.loaded = false;
        setHelperBotState(_state);
        notifications.show({
          message: '请稍等',
        });
        modals.closeAll();
        await basePhoneLoginAccount(gamePhoneNum.current, 'NULL', sms_content);
      },
    });
  }

  async function onClickPhoneLoginAccount() {
    if (gamePhoneNum.current.length === 0) {
      notifications.show({
        message: '手机号不得为空',
        color: 'red',
      });
      return;
    }
    if (gameVerifySMSCode.current.length === 0) {
      notifications.show({
        message: '验证码不得为空',
        color: 'red',
      });
      return;
    }
    await basePhoneLoginAccount(
      gamePhoneNum.current,
      gameVerifySMSCode.current,
    );
  }

  async function basePhoneLoginAccount(
    phoneNum: string,
    smsCode: string,
    smsContent = '',
  ) {
    const _DATA: {
      phoneNumber: string;
      code: string;
      sms_content?: string;
    } = {
      phoneNumber: phoneNum,
      code: smsCode,
    };
    if (smsContent.length > 0) {
      _DATA.sms_content = smsContent;
    }
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
          enableSkin: boolean;
        }
      >({
        path: `${BASE_PATH}/setup/phone-verify-sms`,
        data: _DATA,
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
        enableSkin: helperBotState.enableSkin,
      });
      gamePhoneNum.current = '';
      gameVerifySMSCode.current = '';
      modals.closeAll();
    } catch (e) {
      const _state = helperBotState;
      _state.loaded = true;
      setHelperBotState(_state);
      modals.closeAll();
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
      title: `设置${CARD_NAME}的昵称`,
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
    if (gameNickname.current.length < 2) {
      setHasErr(true);
      setErrReason('昵称需要大于2个字符');
      return;
    }
    try {
      const ret = await mv4RequestApi<
        any,
        {
          status: HelperBotStatus;
          nickname: string;
          dailySigned: boolean;
        }
      >({
        path: `${BASE_PATH}/set-nickname`,
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
        enableSkin: helperBotState.enableSkin,
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
      title: `${CARD_NAME}签到`,
      children: (
        <Box>
          {!isUserAccount && (
            <>
              <Text size="sm">
                签到可提升{CARD_NAME}的游戏等级，使其能进入更高等级的租赁服。
              </Text>
              <Text size="sm">
                {CARD_NAME}每日首次登录时，将自动尝试领取在线奖励。
              </Text>
            </>
          )}
          <Text size="sm">
            您可以使用签到功能，自动完成任务，并手动尝试领取任务/在线奖励。
          </Text>
          <Text size="sm">为减少资源压力，该功能设置了 10 分钟冷却期。</Text>
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
              enableSkin: boolean;
            }
          >({
            path: `${BASE_PATH}/daily-sign`,
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
            enableSkin: ret.data.enableSkin,
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

  async function helperBotSwitchEnableSkin(needEnable: boolean) {
    modals.openConfirmModal({
      title: `${needEnable ? '启用' : '关闭'}皮肤支持`,
      children: (
        <Box>
          <Text size="sm">
            若您的{CARD_NAME}
            已在游戏设定使用某个特定的皮肤，启用该支持后，您的辅助用户在游戏内将显示对应皮肤。
          </Text>
          <Text size="sm">
            如果关闭，您的辅助用户在游戏内将显示为史蒂夫/艾莉克斯。
          </Text>
          <Text size="sm">
            一般情况下，您无需开启该开关。启用后有可能会降低您的进服速度。
          </Text>
        </Box>
      ),
      labels: { confirm: `${needEnable ? '启用' : '关闭'}`, cancel: '取消' },
      onConfirm: async () => {
        try {
          const ret = await mv4RequestApi<
            any,
            {
              enableSkin: boolean;
            }
          >({
            path: `${BASE_PATH}/switch-enable-skin`,
            methodGet: true,
          });
          notifications.show({
            message: '操作成功',
          });
          setHelperBotState({
            loaded: true,
            helperBotStatus: helperBotState.helperBotStatus,
            nickname: helperBotState.nickname,
            dailySigned: helperBotState.dailySigned,
            level: helperBotState.level,
            exp: helperBotState.exp,
            need_exp: helperBotState.need_exp,
            enableSkin: ret.data.enableSkin,
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

  async function dropUserGameAccount() {
    modals.openConfirmModal({
      title: '确定退出登录吗？',
      children: (
        <Box>
          <Text size="sm">您可以使用其他账号重新登录。</Text>
        </Box>
      ),
      labels: { confirm: '退出登录', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await mv4RequestApi({
            path: `${BASE_PATH}/drop`,
            methodGet: true,
          });
          notifications.show({
            message: '操作成功',
          });
          await refreshHelperBotStatus();
        } catch (e) {
          console.error(e);
          if (e instanceof MV4RequestError || e instanceof Error) {
            notifications.show({
              title: '退出登录失败',
              message: e.message,
            });
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
    <Box>
      <CaptchaModal
        opened={captchaModalOpened}
        onClose={captchaModalActions.close}
        initSuccess={captchaInitSuccess}
      />
      <MV4Card>
        <Stack gap={'md'}>
          <Title order={4}>您的{CARD_NAME}</Title>
          <Box>
            {isUserAccount ? (
              <>
                <Text size={'sm'}>
                  游戏账号用于调用 OpenAPI
                  的部分特殊能力（例如管理租赁服状态）。
                </Text>
                <Text size={'sm'}>
                  不登录游戏账号，也能使用 OpenAPI 的绝大多数能力。
                </Text>
                <Text size={'sm'}>
                  游戏账号与绑定服主账号不冲突，您可以登录任意您需要使用的账号。
                </Text>
              </>
            ) : (
              <>
                <Text size={'sm'}>
                  辅助用户是用于进入您的租赁服完成操作的
                  <Text span fw={700}>
                    机器人用户
                  </Text>
                  。
                </Text>
                <Text size={'sm'}>
                  辅助用户的创建是 PhoenixBuilder 正常工作的
                  <Text span fw={700}>
                    必要条件
                  </Text>
                  ，请确保您已设置完毕。
                </Text>
              </>
            )}
          </Box>
          <Alert
            color="red"
            title="出现错误"
            icon={<Caution />}
            hidden={!hasErr}
          >
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
                    {!isUserAccount && (
                      <Button onClick={helperBotGenAccount}>自动生成</Button>
                    )}
                    <Button
                      bg={'orange'}
                      onClick={() => {
                        helperBotLoginAccount();
                      }}
                    >
                      邮箱登录
                    </Button>
                    <Button
                      bg={'grape'}
                      onClick={() => {
                        helperBotPhoneLoginAccount();
                      }}
                    >
                      手机号登录
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
                    {helperBotState.nickname
                      ? helperBotState.nickname
                      : '（未设置昵称）'}{' '}
                    <Text span>
                      (Lv.
                      {helperBotState.level > 0
                        ? `${helperBotState.level}, ${helperBotState.exp}/${helperBotState.need_exp}`
                        : '-'}
                      )
                    </Text>
                    {!isUserAccount && (
                      <Text>
                        皮肤支持：已
                        {helperBotState.enableSkin ? '启用' : '关闭'}
                      </Text>
                    )}
                  </Text>
                  <Group gap={'sm'} pt={'sm'}>
                    <Button onClick={refreshHelperBotStatus}>刷新状态</Button>
                    {!isUserAccount && (
                      <Button
                        onClick={() => {
                          helperBotSetNickname();
                        }}
                      >
                        设置昵称
                      </Button>
                    )}
                    {helperBotState.helperBotStatus === HelperBotStatus.OK && (
                      <>
                        {helperBotState.dailySigned ? (
                          <Button disabled>功能冷却中</Button>
                        ) : (
                          <Button onClick={helperBotDailySign}>签到</Button>
                        )}
                      </>
                    )}
                    {!isUserAccount &&
                      helperBotState.helperBotStatus === HelperBotStatus.OK && (
                        <Button
                          bg="indigo"
                          onClick={() =>
                            helperBotSwitchEnableSkin(
                              !helperBotState.enableSkin,
                            )
                          }
                        >
                          {!helperBotState.enableSkin ? '启用' : '关闭'}皮肤支持
                        </Button>
                      )}
                    {isUserAccount && (
                      <Button
                        bg="red"
                        onClick={() => {
                          dropUserGameAccount();
                        }}
                      >
                        退出登录
                      </Button>
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
      </MV4Card>
    </Box>
  );
}

function CaptchaModal({
  opened,
  onClose,
  initSuccess,
}: {
  opened: boolean;
  onClose: () => void;
  initSuccess: boolean;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="请完成验证码"
      centered={true}
    >
      <Stack align="center" justify="center">
        {!initSuccess && <Text size="sm">验证码加载中</Text>}
        <div id="tac-box-shop" />
      </Stack>
    </Modal>
  );
}
