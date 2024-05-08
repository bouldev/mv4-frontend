import {
  Anchor,
  Box,
  Button,
  Flex,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import Turnstile from 'react-turnstile';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import { Mail, SendEmail, User } from '@icon-park/react';
import {
  LoginActionType,
  LoginSwitchStateFunc,
} from '@/routes/login/model/loginActionTypeSwitchModel';
import css from '@/routes/login/page.module.css';
import { MV4_CLOUDFLARE_TURNSTILE_SITE_KEY } from '@/MV4GlobalConfig';

export default function ForgotPasswordForm({
  switchFunc,
}: {
  switchFunc: LoginSwitchStateFunc;
}) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      email: '',
      cf_captcha: '',
    },

    validate: {
      username: value => (value.length > 0 ? null : '用户名不得为空'),
      email: value => (value.length > 0 ? null : '邮箱不得为空'),
    },
  });

  const [btnEnabled, setBtnEnabled] = useState(true);

  async function onSubmit(values: typeof form.values) {
    setBtnEnabled(false);
    if (values.username.length > 24 || values.username.length < 3) {
      form.setFieldError('username', '用户名长度只能在 3 ~ 24 位之间');
      return;
    }
    if (!/^[^_0-9][0-9a-z_]+$/.test(values.username)) {
      form.setFieldError(
        'username',
        '用户名只能包含数字、字母、下划线，必须以字母开头',
      );
      return;
    }
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(values.email)) {
      form.setFieldError('email', '邮箱格式错误');
      return;
    }
    if (values.cf_captcha.length === 0) {
      modals.open({
        title: '错误',
        children: (
          <Box>
            <Text>请先完成 Cloudflare 验证码。</Text>
            <Text>若仍然收到此提示，请刷新页面。</Text>
          </Box>
        ),
        onClose: () => {
          setBtnEnabled(true);
        },
      });
    }
  }

  return (
    <Box>
      <Title order={4}>找回账号</Title>
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
          <Text size="sm">注意：您需要事先绑定邮箱，本功能才会起作用。</Text>
          <TextInput
            label="用户名"
            leftSection={<User />}
            key={form.key('username')}
            {...form.getInputProps('username')}
          />
          <TextInput
            label="邮箱"
            leftSection={<Mail />}
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <Turnstile
            sitekey={MV4_CLOUDFLARE_TURNSTILE_SITE_KEY}
            className={css.loginCaptcha}
            onVerify={token => {
              form.setFieldValue('cf_captcha', token);
            }}
          />
          <Flex justify={'space-between'} align={'center'}>
            <Anchor
              type={'button'}
              underline="hover"
              component={'button'}
              onClick={() => {
                switchFunc(LoginActionType.LOGIN);
              }}
            >
              返回登录
            </Anchor>
            <Button
              leftSection={<SendEmail />}
              type={'submit'}
              variant="filled"
              disabled={!btnEnabled}
            >
              找回密码
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
