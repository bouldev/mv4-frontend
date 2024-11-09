import React, { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import {
  Box,
  Button,
  Grid,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconDeviceMobile, IconDeviceMobileMessage } from '@tabler/icons-react';
import { awaitSleep } from '@/utils/asyncUtils';
import initTianAiCaptcha from '@/utils/tianAiCaptcha';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import { HelperBotStatus } from '@/api/helper_bot';
import {
  DisclosureInterface,
  HelperBotCardState,
} from '@/ui/component/manage/HelperBotCard';

export default function PhoneLoginModal({
  opened,
  onClose,
  setHasErr,
  setErrReason,
  helperBotState,
  setHelperBotState,
  setCaptchaInitSuccess,
  captchaModalActions,
  realnameUrl,
  BasePath,
}: {
  opened: boolean;
  onClose: () => void;
  setHasErr: (arg: boolean) => void;
  setErrReason: (arg: string) => void;
  helperBotState: HelperBotCardState;
  setHelperBotState: (arg: HelperBotCardState) => void;
  setCaptchaInitSuccess: (arg: boolean) => void;
  captchaModalActions: DisclosureInterface;
  realnameUrl: React.MutableRefObject<string>;
  BasePath: string;
}) {
  const [gamePhoneNum, setGamePhoneNum] = useState('');
  const [gameVerifySMSCode, setGameVerifySMSCode] = useState('');

  async function onClickPhoneLoginSendSMS() {
    if (gamePhoneNum.length === 0) {
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
            path: `${BasePath}/setup/phone-request-sms`,
            data: {
              phoneNumber: gamePhoneNum,
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
      title: '短信验证码请求失败',
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
        onClose();
        await basePhoneLoginAccount(gamePhoneNum, 'NULL', sms_content);
      },
    });
  }

  async function onClickPhoneLoginAccount() {
    if (gamePhoneNum.length === 0) {
      notifications.show({
        message: '手机号不得为空',
        color: 'red',
      });
      return;
    }
    if (gameVerifySMSCode.length === 0) {
      notifications.show({
        message: '验证码不得为空',
        color: 'red',
      });
      return;
    }
    await basePhoneLoginAccount(gamePhoneNum, gameVerifySMSCode);
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
        path: `${BasePath}/setup/phone-verify-sms`,
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
      setGamePhoneNum('');
      setGameVerifySMSCode('');
      onClose();
    } catch (e) {
      const _state = helperBotState;
      _state.loaded = true;
      setHelperBotState(_state);
      onClose();
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        setHasErr(true);
        setErrReason(e.message);
      }
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="手机号登录"
      centered={true}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack>
        <Grid gutter="xs" justify="flex-start" align="stretch">
          <Grid.Col span={12}>
            <TextInput
              label="手机号"
              leftSection={<IconDeviceMobile />}
              value={gamePhoneNum}
              onChange={e => {
                setGamePhoneNum(e.currentTarget.value);
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 7, sm: 8 }}>
            <TextInput
              label="验证码"
              leftSection={<IconDeviceMobileMessage />}
              value={gameVerifySMSCode}
              onChange={e => {
                setGameVerifySMSCode(e.currentTarget.value);
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 5, sm: 4 }} display="flex">
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
    </Modal>
  );
}
