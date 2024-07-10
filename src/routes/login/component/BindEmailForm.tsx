import {
  Alert,
  Anchor,
  Box,
  Button,
  Flex,
  LoadingOverlay,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import Turnstile from 'react-turnstile';
import { useState } from 'react';
import { Caution, Key, Mail, SendEmail } from '@icon-park/react';
import { modals } from '@mantine/modals';
import { useNavigate } from '@modern-js/runtime/router';
import SHA256 from 'crypto-js/sha256';
import css from '@/routes/login/page.module.css';
import { MV4_CLOUDFLARE_TURNSTILE_SITE_KEY } from '@/MV4GlobalConfig';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';

export default function BindEmailForm() {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      cf_captcha: '',
    },

    validate: {
      email: value => (value.length > 0 ? null : '邮箱不得为空'),
      password: value => (value.length > 0 ? null : '密码不得为空'),
    },
  });

  const [btnEnabled, setBtnEnabled] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [hasErr, setHasErr] = useState(false);
  const [errReason, setErrReason] = useState('');
  const navigate = useNavigate();

  async function onSubmit(values: typeof form.values) {
    setHasErr(false);
    setBtnEnabled(false);
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(values.email)) {
      form.setFieldError('email', '邮箱格式错误');
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
    if (values.cf_captcha.length === 0) {
      setErrReason(
        '请先完成 Cloudflare 验证码。若仍然收到此提示，请刷新页面。',
      );
      setHasErr(true);
      return;
    }
    setShowLoading(true);
    try {
      await mv4RequestApi({
        path: '/bind-email/send-email',
        data: {
          email: values.email,
          password: SHA256(values.password).toString(),
          cf_captcha: values.cf_captcha,
        },
      });
      modals.open({
        title: '提示',
        children: (
          <Box>
            <Text>
              一封验证邮件已发送至您提供的邮箱 {values.email}{' '}
              ，请及时查看邮件，有效期为5分钟。
            </Text>
            <Text>
              若没有看到邮件，请检查垃圾箱、以及是否拦截了来自 no-reply@boul.dev
              的邮件。
            </Text>
          </Box>
        ),
        onClose: () => {
          navigate('/app/user');
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
  }

  return (
    <Box>
      <LoadingOverlay
        visible={showLoading}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Title order={4}>绑定邮箱</Title>
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
            label="邮箱"
            disabled={showLoading}
            leftSection={<Mail />}
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="输入密码以确认"
            disabled={showLoading}
            leftSection={<Key />}
            key={form.key('password')}
            {...form.getInputProps('password', { type: 'input' })}
          />
          <Turnstile
            sitekey={MV4_CLOUDFLARE_TURNSTILE_SITE_KEY}
            className={css.loginCaptcha}
            action={'bind_email'}
            onVerify={token => {
              form.setFieldValue('cf_captcha', token);
            }}
          />
          <Flex justify={'space-between'} align={'center'}>
            <Anchor
              type={'button'}
              component={'button'}
              onClick={() => {
                navigate('/app/user');
              }}
            >
              返回
            </Anchor>
            <Button
              leftSection={<SendEmail />}
              type={'submit'}
              variant="filled"
              disabled={!btnEnabled}
            >
              发送邮件
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
