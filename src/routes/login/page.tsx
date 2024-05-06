import {
  ActionIcon,
  Box,
  Flex,
  Paper,
  Transition,
  useMantineColorScheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useLocalModel } from '@modern-js/runtime/model';
import { Moon, SunOne, Theme } from '@icon-park/react';
import { useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import css from './page.module.css';
import RegisterForm from './component/RegisterForm';
import {
  LoginActionType,
  LoginActionTypeSwitchModel,
} from '@/routes/login/model/loginActionTypeSwitchModel';
import LoginForm from '@/routes/login/component/LoginForm';
import ForgotPasswordForm from '@/routes/login/component/ForgotPasswordForm';

export default function LoginPage() {
  const [paperOpened, setPaperOpened] = useState(false);
  const [formShowed, setFormShowed] = useState(true);

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [nowTheme, setTheme] = useLocalStorage<'default' | 'anime'>({
    key: 'mv4Theme',
    defaultValue: 'default',
  });

  const [state, actions] = useLocalModel(LoginActionTypeSwitchModel);

  useEffect(() => {
    setTimeout(() => {
      setPaperOpened(true);
    }, 50);
  }, []);

  function setLoginActionType(type: LoginActionType) {
    setFormShowed(false);
    actions.setPendingNewState(type);
  }

  function onChangeBg() {
    notifications.clean();
    if (nowTheme === 'anime') {
      setTheme('default');
      notifications.show({ message: '已切换到默认主题' });
    } else {
      setTheme('anime');
      notifications.show({ message: '已切换到花里胡哨主题' });
    }
  }

  function getBgCss() {
    switch (nowTheme) {
      case 'anime':
        return css.bgAnime;
      case 'default':
      default:
        return css.bgDefault;
    }
  }

  return (
    <Box className={`${css.bg} ${getBgCss()}`}>
      <Flex justify={'flex-end'} m={4} gap={'xs'}>
        <ActionIcon variant="default" size="xl" onClick={() => onChangeBg()}>
          <Theme />
        </ActionIcon>
        <ActionIcon
          variant="default"
          size="xl"
          onClick={() => toggleColorScheme()}
        >
          {colorScheme === 'light' ? <Moon /> : <SunOne />}
        </ActionIcon>
      </Flex>
      <Box className={css.wrapper}>
        <Transition mounted={paperOpened} transition="fade-up">
          {styles => (
            <Paper
              style={styles}
              className={`${css.loginCard} ${
                colorScheme === 'light' && nowTheme === 'anime'
                  ? css.loginCardLight
                  : ''
              }`}
              shadow="xl"
              p="xl"
              withBorder
            >
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
                  </Box>
                )}
              </Transition>
            </Paper>
          )}
        </Transition>
      </Box>
    </Box>
  );
}
