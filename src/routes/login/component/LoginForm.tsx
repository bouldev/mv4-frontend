import {
  Anchor,
  Box,
  Button,
  Flex,
  PasswordInput,
  Space,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { Key, Login, User } from '@icon-park/react';
import css from '@/routes/login/page.module.css';
import {
  LoginActionType,
  LoginSwitchStateFunc,
} from '@/routes/login/model/loginActionTypeSwitchModel';

export default function LoginForm({
  switchFunc,
}: {
  switchFunc: LoginSwitchStateFunc;
}) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
    },

    validate: {
      username: value => (value.length > 0 ? null : '用户名不得为空'),
      password: value => (value.length > 0 ? null : '密码不得为空'),
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
      form.setFieldError('password', '密码长度至少为6位及以上');
      return;
    }
    if (!/^[^_0-9][0-9a-z_]+$/.test(values.username)) {
      form.setFieldError(
        'username',
        '用户名只能包含数字、字母、下划线，必须以字母开头',
      );
    }
  }

  return (
    <Box>
      <Title order={4}>登录到 FBUC Next</Title>
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
          <Flex justify={'space-between'} align={'center'}>
            <Flex>
              <Anchor
                type={'button'}
                underline="hover"
                component={'button'}
                onClick={() => {
                  switchFunc(LoginActionType.REGISTER);
                }}
              >
                注册
              </Anchor>
              <Space w="xs" />
              <Anchor
                type={'button'}
                underline="hover"
                component={'button'}
                onClick={() => {
                  switchFunc(LoginActionType.FORGOT_PASSWORD);
                }}
              >
                忘记密码
              </Anchor>
            </Flex>
            <Button
              leftSection={<Login />}
              type={'submit'}
              variant="filled"
              disabled={!btnEnabled}
            >
              登录
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
