import {
  ActionIcon,
  Box,
  Flex,
  Paper,
  Transition,
  useMantineColorScheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useModel, useLocalModel } from '@modern-js/runtime/model';
import { Moon, SunOne, Theme } from '@icon-park/react';
import css from './page.module.css';
import RegisterForm from './component/RegisterForm';
import {
  LoginActionType,
  LoginActionTypeSwitchModel,
} from '@/routes/login/model/loginActionTypeSwitchModel';
import bgCss from '@/ui/css/background.module.css';
import LoginForm from '@/routes/login/component/LoginForm';
import ForgotPasswordForm from '@/routes/login/component/ForgotPasswordForm';
import { getThemeStyleCssName, ThemeSwitchModel } from '@/context/UIContext';

export default function LoginPage() {
  const [paperOpened, setPaperOpened] = useState(false);
  const [formShowed, setFormShowed] = useState(true);

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const [state, actions] = useLocalModel(LoginActionTypeSwitchModel);

  const [themeState, themeActions] = useModel(ThemeSwitchModel);

  useEffect(() => {
    themeActions.loadTheme();
    setTimeout(() => {
      setPaperOpened(true);
    }, 100);
  }, []);

  function setLoginActionType(type: LoginActionType) {
    setFormShowed(false);
    actions.setPendingNewState(type);
  }

  return (
    <Box
      className={`${bgCss.bg} ${getThemeStyleCssName(themeState.style)} ${
        colorScheme === 'light' && themeState.style === 'anime'
          ? bgCss.bgAnimeLight
          : ''
      }`}
    >
      <Flex justify={'flex-end'} m={4} gap={'xs'}>
        <ActionIcon
          variant="default"
          size="xl"
          onClick={() => {
            if (themeState.style === 'default') {
              themeActions.changeStyle('anime');
            } else {
              themeActions.changeStyle('default');
            }
          }}
        >
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
                colorScheme === 'light' ? css.loginCardLight : ''
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
