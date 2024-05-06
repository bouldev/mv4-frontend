import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Flex,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import Turnstile from 'react-turnstile';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { Check, Key, User } from '@icon-park/react';
import css from '@/routes/login/page.module.css';
import {
  LoginActionType,
  LoginSwitchStateFunc,
} from '@/routes/login/model/loginActionTypeSwitchModel';
import { MV4_CLOUDFLARE_TURNSTILE_SITE_KEY } from '@/MV4GlobalConfig';

export default function RegisterForm({
  switchFunc,
}: {
  switchFunc: LoginSwitchStateFunc;
}) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
      password_again: '',
      cf_captcha: '',
    },

    validate: {
      username: value => (value.length > 0 ? null : '用户名不得为空'),
      password: value => (value.length > 0 ? null : '密码不得为空'),
      password_again: value => (value.length > 0 ? null : '密码不得为空'),
    },
  });

  const [btnEnabled, setBtnEnabled] = useState(true);

  async function onSubmit(values: typeof form.values) {
    setBtnEnabled(false);
    if (values.username.length > 24 || values.username.length < 3) {
      form.setFieldError('username', '用户名长度只能在 3 ~ 24 位之间');
      return;
    }
    if (values.password.length < 6) {
      form.setFieldError('password', '为确保安全，密码长度至少为6位及以上');
      return;
    }
    if (values.password !== values.password_again) {
      form.setFieldError('password_again', '两次输入的密码不一致');
      return;
    }
    if (!/^[^_0-9][0-9a-z_]+$/.test(values.username)) {
      form.setFieldError(
        'username',
        '用户名只能包含数字、字母、下划线，必须以字母开头',
      );
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
      <Title order={4}>注册</Title>
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
          <TextInput
            label="用户名"
            leftSection={<User />}
            key={form.key('username')}
            {...form.getInputProps('username')}
          />
          <PasswordInput
            label="密码"
            leftSection={<Key />}
            key={form.key('password')}
            {...form.getInputProps('password', { type: 'input' })}
          />
          <PasswordInput
            label="再次输入密码"
            leftSection={<Key />}
            key={form.key('password_again')}
            {...form.getInputProps('password_again', { type: 'input' })}
          />
          <Checkbox
            mt="md"
            label={
              <Flex>
                <Text size="xs">我已阅读并同意遵守</Text>
                <Anchor
                  underline="hover"
                  size="xs"
                  href="https://fastbuilder.pro/enduser-license.html"
                >
                  用户协议
                </Anchor>
                <Text size="xs">以及认可</Text>
                <Anchor
                  underline="hover"
                  size="xs"
                  href="https://fastbuilder.pro/privacy-policy.html"
                >
                  隐私策略
                </Anchor>
              </Flex>
            }
            key={form.key('termsOfService')}
            {...form.getInputProps('termsOfService', { type: 'checkbox' })}
          />
          <Turnstile
            sitekey={MV4_CLOUDFLARE_TURNSTILE_SITE_KEY}
            theme={'dark'}
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
              leftSection={<Check />}
              type={'submit'}
              variant="filled"
              disabled={!btnEnabled}
            >
              注册
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
