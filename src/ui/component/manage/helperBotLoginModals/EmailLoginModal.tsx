import React, { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { MD5 } from 'crypto-js';
import { Button, Modal, PasswordInput, Stack, TextInput } from '@mantine/core';
import { IconLock, IconUser } from '@tabler/icons-react';
import { mv4RequestApi } from '@/api/mv4Client';
import { HelperBotStatus } from '@/api/helper_bot';
import { MV4RequestError } from '@/api/base';
import { HelperBotCardState } from '@/ui/component/manage/HelperBotCard';

export default function EmailLoginModal({
  opened,
  onClose,
  setHasErr,
  setErrReason,
  helperBotState,
  setHelperBotState,
  realnameUrl,
  BasePath,
}: {
  opened: boolean;
  onClose: () => void;
  setHasErr: (arg: boolean) => void;
  setErrReason: (arg: string) => void;
  helperBotState: HelperBotCardState;
  setHelperBotState: (arg: HelperBotCardState) => void;
  realnameUrl: React.MutableRefObject<string>;
  BasePath: string;
}) {
  const [gameAccount, setGameAccount] = useState('');
  const [gamePassword, setGamePassword] = useState('');

  async function onClickLoginAccount() {
    if (gameAccount.length === 0) {
      notifications.show({
        message: '账号不得为空',
        color: 'red',
      });
    }
    if (gamePassword.length === 0) {
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
        path: `${BasePath}/setup/login-account`,
        data: {
          account: gameAccount,
          password_md5: MD5(gamePassword).toString(),
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
      setGameAccount('');
      setGamePassword('');
      onClose();
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        setHasErr(true);
        setErrReason(e.message);
      }
      onClose();
    }
  }
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="邮箱登录"
      centered={true}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack>
        <TextInput
          label="账号"
          leftSection={<IconUser />}
          value={gameAccount}
          placeholder="example@example.com"
          onChange={e => {
            setGameAccount(e.currentTarget.value);
          }}
        />
        <PasswordInput
          label="密码"
          leftSection={<IconLock />}
          value={gamePassword}
          onChange={e => {
            setGamePassword(e.currentTarget.value);
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
    </Modal>
  );
}
