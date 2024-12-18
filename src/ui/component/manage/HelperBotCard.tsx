import {
  Alert,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangleFilled, IconUser } from '@tabler/icons-react';
import { HelperBotStatus } from '@/api/helper_bot';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import MV4Card from '@/ui/component/app/MV4Card';
import EmailLoginModal from '@/ui/component/manage/helperBotLoginModals/EmailLoginModal';
import PhoneLoginModal from '@/ui/component/manage/helperBotLoginModals/PhoneLoginModal';

export interface HelperBotCardState {
  loaded: boolean;
  helperBotStatus: HelperBotStatus;
  nickname: string;
  dailySigned: boolean;
  level: number;
  exp: number;
  need_exp: number;
  enableSkin: boolean;
}

export interface DisclosureInterface {
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
}

export default function HelperBotCard({
  isUserAccount = false,
}: {
  isUserAccount?: boolean;
}) {
  const [helperBotState, setHelperBotState] = useState<HelperBotCardState>({
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

  const [captchaModalOpened, captchaModalActions] = useDisclosure(false);
  const [captchaInitSuccess, setCaptchaInitSuccess] = useState(false);

  const [emailLoginOpened, emailLoginActions] = useDisclosure(false);
  const [phoneLoginOpened, phoneLoginActions] = useDisclosure(false);

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
        modals.open({
          title: `获取${CARD_NAME}状态失败`,
          children: <Text size="sm">{e.message}</Text>,
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
    emailLoginActions.open();
  }

  async function helperBotPhoneLoginAccount() {
    setHasErr(false);
    phoneLoginActions.open();
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
            leftSection={<IconUser />}
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
      <EmailLoginModal
        opened={emailLoginOpened}
        onClose={emailLoginActions.close}
        setHasErr={setHasErr}
        setErrReason={setErrReason}
        helperBotState={helperBotState}
        setHelperBotState={setHelperBotState}
        realnameUrl={realnameUrl}
        BasePath={BASE_PATH}
      />
      <PhoneLoginModal
        opened={phoneLoginOpened}
        onClose={phoneLoginActions.close}
        setHasErr={setHasErr}
        setErrReason={setErrReason}
        helperBotState={helperBotState}
        setHelperBotState={setHelperBotState}
        setCaptchaInitSuccess={setCaptchaInitSuccess}
        captchaModalActions={captchaModalActions}
        realnameUrl={realnameUrl}
        BasePath={BASE_PATH}
      />
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
            icon={<IconAlertTriangleFilled />}
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
