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
import { useNavigate } from '@modern-js/runtime/router';
import { useModel } from '@modern-js/runtime/model';
import {
  LoginActionType,
  LoginSwitchStateFunc,
} from '@/routes/login/model/loginActionTypeSwitchModel';
import css from '@/routes/login/page.module.css';
// import { MV4_CLOUDFLARE_TURNSTILE_SITE_KEY } from '@/MV4GlobalConfig';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import { GlobalUserModel } from '@/model/globalUserModel';
import initTianAiCaptcha from '@/utils/tianAiCaptcha';

export default function ChangePasswordForm({
  switchFunc,
}: {
  switchFunc: LoginSwitchStateFunc;
}) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      password: '',
      new_password: '',
      new_password_again: '',
      // cf_captcha: '',
    },

    validate: {
      password: value => (value.length > 0 ? null : '密码不得为空'),
      new_password: value => (value.length > 0 ? null : '密码不得为空'),
      new_password_again: value => (value.length > 0 ? null : '密码不得为空'),
    },
  });

  const [btnEnabled, setBtnEnabled] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [hasErr, setHasErr] = useState(false);
  const [errReason, setErrReason] = useState('');
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userModelState, userModelActions] = useModel(GlobalUserModel);

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
    if (values.new_password.length < 1) {
      form.setFieldError('password', '请输入密码');
      return;
    }
    if (values.new_password.length > 128) {
      form.setFieldError('password', '密码太长');
      return;
    }
    if (values.new_password !== values.new_password_again) {
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
    initTianAiCaptcha('#tac-box', async token => {
      setShowLoading(true);
      try {
        await mv4RequestApi({
          path: '/user/change-password',
          data: {
            password: SHA256(values.password).toString(),
            new_password: SHA256(values.new_password).toString(),
            // cf_captcha: values.cf_captcha,
            captcha_token: token,
          },
        });
        modals.open({
          title: '提示',
          children: (
            <Box>
              <Text>密码修改成功，请使用新密码进行登录。</Text>
            </Box>
          ),
          onClose: async () => {
            switchFunc(LoginActionType.LOGIN);
            await userModelActions.update();
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
    });
  }

  return (
    <Box>
      <LoadingOverlay
        visible={showLoading}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Title order={4}>修改密码</Title>
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
          <PasswordInput
            label="原密码"
            disabled={showLoading}
            leftSection={<Key />}
            key={form.key('password')}
            {...form.getInputProps('password', { type: 'input' })}
          />
          <PasswordInput
            label="新密码"
            disabled={showLoading}
            leftSection={<Key />}
            key={form.key('new_password')}
            {...form.getInputProps('new_password', { type: 'input' })}
          />
          <PasswordInput
            label="再次输入新密码"
            disabled={showLoading}
            leftSection={<Key />}
            key={form.key('new_password_again')}
            {...form.getInputProps('new_password_again', { type: 'input' })}
          />
          {/* <Turnstile
            sitekey={MV4_CLOUDFLARE_TURNSTILE_SITE_KEY}
            className={css.loginCaptcha}
            action={'change_password'}
            onVerify={token => {
              form.setFieldValue('cf_captcha', token);
            }}
          /> */}
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
