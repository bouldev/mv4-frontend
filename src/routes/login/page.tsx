import {
  Box,
  Flex,
  Paper,
  RemoveScroll,
  Stack,
  Text,
  Transition,
  useMantineColorScheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useLocalModel, useModel } from '@modern-js/runtime/model';
import { modals } from '@mantine/modals';
import { useColorScheme } from '@mantine/hooks';
import css from './page.module.css';
import RegisterForm from './component/RegisterForm';
import BindEmailForm from './component/BindEmailForm';
import {
  LoginActionType,
  LoginActionTypeSwitchModel,
} from '@/routes/login/model/loginActionTypeSwitchModel';
import bgCss from '@/ui/css/background.module.css';
import LoginForm from '@/routes/login/component/LoginForm';
import ForgotPasswordForm from '@/routes/login/component/ForgotPasswordForm';
import { getThemeStyleCssName, ThemeSwitchModel } from '@/model/UIModel';
import { mv4RequestApi } from '@/api/mv4Client';
import ResetPasswordForm from '@/routes/login/component/ResetPasswordForm';
import BindEmailSuccessForm from '@/routes/login/component/BindEmailSuccessForm';
import { MV4RequestError } from '@/api/base';
import ChangePasswordForm from '@/routes/login/component/ChangePasswordForm';
import { GlobalUserModel } from '@/model/globalUserModel';
import { ThemeButtons } from '@/ui/component/ThemeButtons';

export default function LoginPage() {
  const [paperOpened, setPaperOpened] = useState(false);
  const [formShowed, setFormShowed] = useState(true);

  const { colorScheme } = useMantineColorScheme();
  const systemColorScheme = useColorScheme();

  const [state, actions] = useLocalModel(LoginActionTypeSwitchModel);

  const [themeState] = useModel(ThemeSwitchModel);
  const [userModelState] = useModel(GlobalUserModel);

  function getCurrentCS() {
    switch (colorScheme) {
      case 'auto': {
        return systemColorScheme;
      }
      default:
        return colorScheme;
    }
  }

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (userModelState.loggedIn) {
        if (action === 'set_new_email') {
          actions.setState(LoginActionType.BIND_EMAIL);
          return;
        }
        if (action === 'change_password') {
          actions.setState(LoginActionType.CHANGE_PASSWORD);
          return;
        }
      }
      if (params.get('username') !== null && params.get('ticket') !== null) {
        switch (action) {
          case 'reset_password': {
            try {
              await mv4RequestApi({
                path: '/forgot-password/verify-ticket',
                data: {
                  username: params.get('username'),
                  ticket: params.get('ticket'),
                },
              });
              actions.setState(LoginActionType.RESET_PASSWORD);
            } catch (e) {
              if (e instanceof Error || e instanceof MV4RequestError) {
                console.error(e);
                fuckNewModal(e.message);
              }
            }
            break;
          }
          case 'bind_email': {
            if (params.get('email') === null) {
              fuckNewModal('参数错误');
              return;
            }
            try {
              await mv4RequestApi({
                path: '/bind-email/bind-with-ticket',
                data: {
                  username: params.get('username'),
                  email: params.get('email'),
                  ticket: params.get('ticket'),
                },
              });
              actions.setState(LoginActionType.BIND_EMAIL_SUCCESS);
            } catch (e) {
              if (e instanceof Error || e instanceof MV4RequestError) {
                console.error(e);
                fuckNewModal(e.message);
              }
            }
            break;
          }
          default:
            window.location.search = '';
        }
      }
    })();
    setTimeout(() => {
      setPaperOpened(true);
    }, 100);
  }, []);

  function fuckNewModal(reason: string) {
    modals.open({
      title: '错误',
      children: (
        <Box>
          <Text>{reason}</Text>
        </Box>
      ),
      closeOnEscape: false,
      closeOnClickOutside: false,
      onClose: () => {
        window.location.href = '/';
      },
    });
  }

  function setLoginActionType(type: LoginActionType) {
    setFormShowed(false);
    actions.setPendingNewState(type);
  }

  return (
    <RemoveScroll>
      <Stack
        className={`${bgCss.bg} ${bgCss.bgFixer} ${getThemeStyleCssName(
          themeState.style,
        )} ${
          getCurrentCS() === 'light' &&
          themeState.style === 'anime' &&
          bgCss.bgAnimeLight
        }`}
      >
        <Flex justify={'flex-end'} m={4} gap={'xs'}>
          <ThemeButtons />
        </Flex>
        <Box className={css.wrapper}>
          <div id="tac-box" className={css.tacBoxStyles} />
          <Transition mounted={paperOpened} transition="fade-up">
            {styles => (
              <Paper
                style={styles}
                className={`${css.loginCard} ${
                  getCurrentCS() === 'light' && css.loginCardLight
                }`}
                shadow="xl"
                withBorder
              >
                <Box p="xl">
                  <Transition
                    mounted={formShowed}
                    transition="fade"
                    onExited={() => {
                      actions.setState(state.pendingNewState);
                      setFormShowed(true);
                    }}
                  >
                    {formStyles => (
                      <Box style={formStyles}>
                        {state.state === LoginActionType.LOGIN ? (
                          <LoginForm switchFunc={setLoginActionType} />
                        ) : null}
                        {state.state === LoginActionType.REGISTER ? (
                          <RegisterForm switchFunc={setLoginActionType} />
                        ) : null}
                        {state.state === LoginActionType.FORGOT_PASSWORD ? (
                          <ForgotPasswordForm switchFunc={setLoginActionType} />
                        ) : null}
                        {state.state === LoginActionType.RESET_PASSWORD ? (
                          <ResetPasswordForm switchFunc={setLoginActionType} />
                        ) : null}
                        {state.state === LoginActionType.CHANGE_PASSWORD ? (
                          <ChangePasswordForm switchFunc={setLoginActionType} />
                        ) : null}
                        {state.state === LoginActionType.BIND_EMAIL ? (
                          <BindEmailForm />
                        ) : null}
                        {state.state === LoginActionType.BIND_EMAIL_SUCCESS ? (
                          <BindEmailSuccessForm />
                        ) : null}
                      </Box>
                    )}
                  </Transition>
                </Box>
              </Paper>
            )}
          </Transition>
        </Box>
      </Stack>
    </RemoveScroll>
  );
}
