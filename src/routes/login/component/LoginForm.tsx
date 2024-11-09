import {
  Alert,
  Anchor,
  Box,
  Button,
  Flex,
  LoadingOverlay,
  PasswordInput,
  Space,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import SHA256 from 'crypto-js/sha256';
import { useNavigate } from '@modern-js/runtime/router';
import { notifications } from '@mantine/notifications';
import { useModel } from '@modern-js/runtime/model';
import {
  IconAlertTriangleFilled,
  IconLogin,
  IconPassword,
  IconUser,
} from '@tabler/icons-react';
import css from '@/routes/login/page.module.css';
import {
  LoginActionType,
  LoginSwitchStateFunc,
} from '@/routes/login/model/loginActionTypeSwitchModel';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import { GlobalUserModel } from '@/model/globalUserModel';

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
  const [showLoading, setShowLoading] = useState(false);
  const [hasErr, setHasErr] = useState(false);
  const [errReason, setErrReason] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userModelState, userModelActions] = useModel(GlobalUserModel);

  const navigate = useNavigate();

  async function onSubmit(values: typeof form.values) {
    setHasErr(false);
    setBtnEnabled(false);
    if (values.username.length < 1) {
      form.setFieldError('username', '请输入用户名');
      return;
    }
    if (!/^\S+$/.test(values.username)) {
      form.setFieldError('username', '用户名不得包含空格');
      return;
    }
    if (values.username.length > 24) {
      form.setFieldError('username', '用户名长度最大24位');
      return;
    }
    if (values.password.length < 1) {
      form.setFieldError('password', '请输入密码');
      return;
    }
    if (values.password.length > 128) {
      form.setFieldError('password', '密码太长');
      return;
    }
    setShowLoading(true);
    try {
      await mv4RequestApi({
        path: '/user/login',
        data: {
          username: values.username,
          password: SHA256(values.password).toString(),
        },
      });
      notifications.show({
        title: '提示',
        message: `欢迎 ${values.username}`,
      });
      navigate('/app');
      await userModelActions.update();
    } catch (e) {
      if (e instanceof Error || e instanceof MV4RequestError) {
        setErrReason(e.message);
        setHasErr(true);
      }
    }
    setShowLoading(false);
    setBtnEnabled(true);
  }

  return (
    <Box>
      <LoadingOverlay
        visible={showLoading}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Title order={4}>登录到 FastBuilder 用户中心</Title>
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
            title="登录失败"
            icon={<IconAlertTriangleFilled />}
            hidden={!hasErr}
          >
            <Text size={'sm'} fw={700}>
              {errReason}
            </Text>
          </Alert>
          <TextInput
            label="用户名"
            disabled={showLoading}
            leftSection={<IconUser />}
            key={form.key('username')}
            {...form.getInputProps('username')}
          />
          <PasswordInput
            label="密码"
            disabled={showLoading}
            leftSection={<IconPassword />}
            key={form.key('password')}
            {...form.getInputProps('password', { type: 'input' })}
          />
          <Flex justify={'space-between'} align={'center'}>
            <Flex>
              <Anchor
                type={'button'}
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
                component={'button'}
                onClick={() => {
                  switchFunc(LoginActionType.FORGOT_PASSWORD);
                }}
              >
                忘记密码
              </Anchor>
            </Flex>
            <Button
              leftSection={<IconLogin />}
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
