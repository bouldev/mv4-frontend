import {
  Alert,
  Anchor,
  Box,
  Button,
  Flex,
  LoadingOverlay,
  PasswordInput,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
// import Turnstile from 'react-turnstile';
import { useState } from 'react';
import { Caution, Check, Key } from '@icon-park/react';
import SHA256 from 'crypto-js/sha256';
import { modals } from '@mantine/modals';
import {
  LoginActionType,
  LoginSwitchStateFunc,
} from '@/routes/login/model/loginActionTypeSwitchModel';
import css from '@/routes/login/page.module.css';
// import { MV4_CLOUDFLARE_TURNSTILE_SITE_KEY } from '@/MV4GlobalConfig';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import initTianAiCaptcha from '@/utils/tianAiCaptcha';

export default function ResetPasswordForm({
  switchFunc,
}: {
  switchFunc: LoginSwitchStateFunc;
}) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      password: '',
      password_again: '',
      // cf_captcha: '',
    },

    validate: {
      password: value => (value.length > 0 ? null : '密码不得为空'),
      password_again: value => (value.length > 0 ? null : '密码不得为空'),
    },
  });

  const [btnEnabled, setBtnEnabled] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [hasErr, setHasErr] = useState(false);
  const [errReason, setErrReason] = useState('');

  async function onSubmit(values: typeof form.values) {
    setHasErr(false);
    setBtnEnabled(false);
    if (values.password.length < 1) {
      form.setFieldError('password', '请输入密码');
      return;
    }
    if (values.password.length > 128) {
      form.setFieldError('password', '密码太长');
      return;
    }
    if (values.password !== values.password_again) {
      form.setFieldError('password_again', '两次输入的密码不一致');
      return;
    }
    /*
    if (values.cf_captcha.length === 0) {
      setErrReason(
        '请先完成 Cloudflare 验证码。若仍然收到此提示，请刷新页面。',
      );
      setHasErr(true);
      return;
    }
    */
    setShowLoading(true);
    initTianAiCaptcha('#tac-box', {
      onSuccess: async token => {
        const search = new URLSearchParams(window.location.search);
        try {
          await mv4RequestApi({
            path: '/forgot-password/reset-password',
            data: {
              username: search.get('username'),
              new_password: SHA256(values.password).toString(),
              ticket: search.get('ticket'),
              // cf_captcha: values.cf_captcha,
              captcha_token: token,
            },
          });
          modals.open({
            title: '提示',
            children: (
              <Box>
                <Text>密码重置成功，请使用新密码进行登录。</Text>
                <Text>日后请注意不要遗失或忘记您的密码。</Text>
              </Box>
            ),
            onClose: () => {
              window.location.search = '';
              switchFunc(LoginActionType.LOGIN);
            },
          });
        } catch (e) {
          if (e instanceof Error || e instanceof MV4RequestError) {
            setErrReason(e.message);
            setHasErr(true);
          }
        }
        setShowLoading(false);
        setBtnEnabled(true);
      },
      onClickClose: () => {
        setShowLoading(false);
        setBtnEnabled(true);
      },
    });
  }

  return (
    <Box>
      <LoadingOverlay
        visible={showLoading}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Title order={4}>重设密码</Title>
      <form
        onSubmit={form.onSubmit(values => onSubmit(values))}
        onInput={() => {
          setBtnEnabled(true);
        }}
      >
        <Flex
          className={css.loginCardForm}
          gap="lg"
          direction="column"
          wrap="wrap"
        >
          <Alert
            color="red"
            title="操作失败"
            icon={<Caution />}
            hidden={!hasErr}
          >
            <Text size={'sm'} fw={700}>
              {errReason}
            </Text>
          </Alert>
          <Text size="sm">
            您正在重设用户{' '}
            {new URLSearchParams(window.location.search).get('username')}{' '}
            的密码。
          </Text>
          <PasswordInput
            label="密码"
            disabled={showLoading}
            leftSection={<Key />}
            key={form.key('password')}
            {...form.getInputProps('password', { type: 'input' })}
          />
          <PasswordInput
            label="再次输入密码"
            disabled={showLoading}
            leftSection={<Key />}
            key={form.key('password_again')}
            {...form.getInputProps('password_again', { type: 'input' })}
          />
          {/* <Turnstile
            sitekey={MV4_CLOUDFLARE_TURNSTILE_SITE_KEY}
            className={css.loginCaptcha}
            action={'forgot_password_reset'}
            onVerify={token => {
              form.setFieldValue('cf_captcha', token);
            }}
          /> */}
          <Flex justify={'space-between'} align={'center'}>
            <Anchor
              type={'button'}
              component={'button'}
              onClick={() => {
                switchFunc(LoginActionType.LOGIN);
              }}
            >
              返回登录
            </Anchor>
            <Button
              leftSection={<Check />}
              type={'submit'}
              variant="filled"
              disabled={!btnEnabled}
            >
              提交
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
