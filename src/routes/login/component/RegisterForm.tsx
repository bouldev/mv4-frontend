import {
  Alert,
  Anchor,
  Box,
  Button,
  Checkbox,
  Flex,
  LoadingOverlay,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
// import Turnstile from 'react-turnstile';
import { useState } from 'react';
import { Caution, Check, Key, User } from '@icon-park/react';
import SHA256 from 'crypto-js/sha256';
import { notifications } from '@mantine/notifications';
import css from '@/routes/login/page.module.css';
import {
  LoginActionType,
  LoginSwitchStateFunc,
} from '@/routes/login/model/loginActionTypeSwitchModel';
// import { MV4_CLOUDFLARE_TURNSTILE_SITE_KEY } from '@/MV4GlobalConfig';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import initTianAiCaptcha from '@/utils/tianAiCaptcha';

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
      // cf_captcha: '',
      termsOfService: false,
    },

    validate: {
      username: value => (value.length > 0 ? null : '用户名不得为空'),
      password: value => (value.length > 0 ? null : '密码不得为空'),
      password_again: value => (value.length > 0 ? null : '密码不得为空'),
    },
  });

  const [btnEnabled, setBtnEnabled] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [hasErr, setHasErr] = useState(false);
  const [errReason, setErrReason] = useState('');

  async function onSubmit(values: typeof form.values) {
    if (!values.termsOfService) {
      setErrReason('请先同意用户协议与隐私条款');
      setHasErr(true);
      return;
    }
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
        console.log(values);
        try {
          await mv4RequestApi({
            path: '/user/register',
            data: {
              username: values.username,
              password: SHA256(values.password).toString(),
              // cf_captcha: values.cf_captcha,
              captcha_token: token,
            },
          });
          notifications.show({
            title: '提示',
            message: `注册成功，请登录`,
          });
          switchFunc(LoginActionType.LOGIN);
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
          <TextInput
            label="用户名"
            disabled={showLoading}
            leftSection={<User />}
            key={form.key('username')}
            {...form.getInputProps('username')}
          />
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
          <Checkbox
            mt="md"
            label={
              <Flex direction={'column'}>
                <Text size="xs">
                  我已阅读并同意遵守
                  <Anchor
                    target={'_blank'}
                    rel={'noreferrer'}
                    size="xs"
                    href="https://fastbuilder.pro/enduser-license.html"
                  >
                    用户协议
                  </Anchor>
                  ，并且认可
                  <Anchor
                    target={'_blank'}
                    rel={'noreferrer'}
                    size="xs"
                    href="https://fastbuilder.pro/privacy-policy.html"
                  >
                    隐私策略
                  </Anchor>
                </Text>
              </Flex>
            }
            key={form.key('termsOfService')}
            {...form.getInputProps('termsOfService', { type: 'checkbox' })}
          />
          {/* <Turnstile
            sitekey={MV4_CLOUDFLARE_TURNSTILE_SITE_KEY}
            className={css.loginCaptcha}
            action={'register'}
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
              注册
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
