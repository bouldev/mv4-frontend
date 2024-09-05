import {
  Alert,
  Anchor,
  Box,
  Button,
  Flex,
  LoadingOverlay,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
// import Turnstile from 'react-turnstile';
import { useState } from 'react';
import { Caution, Mail, SendEmail, User } from '@icon-park/react';
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
      // cf_captcha: '',
    },

    validate: {
      username: value => (value.length > 0 ? null : '用户名不得为空'),
      email: value => (value.length > 0 ? null : '邮箱不得为空'),
    },
  });

  const [btnEnabled, setBtnEnabled] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [hasErr, setHasErr] = useState(false);
  const [errReason, setErrReason] = useState('');

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
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(values.email)) {
      form.setFieldError('email', '邮箱格式错误');
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
    initTianAiCaptcha('#tac-box', async token => {
      setShowLoading(true);
      try {
        await mv4RequestApi({
          path: '/forgot-password/send-email',
          data: {
            username: values.username,
            email: values.email,
            // cf_captcha: values.cf_captcha,
            captcha_token: token,
          },
        });
        modals.open({
          title: '提示',
          children: (
            <Box>
              <Text>
                一封重置密码邮件已发送至您绑定的邮箱 {values.email}{' '}
                ，请及时查看邮件，邮件有效期为5分钟。
              </Text>
              <Text>
                若没有看到邮件，请检查垃圾箱、以及是否拦截了来自
                no-reply@user.fastbuilder.pro 的邮件。
              </Text>
            </Box>
          ),
        });
      } catch (e) {
        if (e instanceof Error || e instanceof MV4RequestError) {
          setErrReason(e.message);
          setHasErr(true);
        }
      }
      setShowLoading(false);
      setBtnEnabled(true);
    });
  }

  return (
    <Box>
      <LoadingOverlay
        visible={showLoading}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
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
          <div id="tac-box" className={css.tacBoxStyles} />
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
          <Text size="sm">注意：您需要事先绑定邮箱，本功能才会起作用。</Text>
          <TextInput
            label="用户名"
            disabled={showLoading}
            leftSection={<User />}
            key={form.key('username')}
            {...form.getInputProps('username')}
          />
          <TextInput
            label="邮箱"
            disabled={showLoading}
            leftSection={<Mail />}
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          {/* <Turnstile
            sitekey={MV4_CLOUDFLARE_TURNSTILE_SITE_KEY}
            className={css.loginCaptcha}
            action={'forgot_password'}
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
