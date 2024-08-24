import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/tiptap/styles.css';
import {
  Anchor,
  createTheme,
  localStorageColorSchemeManager,
  MantineProvider,
  Stack,
  Text,
} from '@mantine/core';
import { modals, ModalsProvider } from '@mantine/modals';
import { Outlet, useNavigate } from '@modern-js/runtime/router';
import ReactGA from 'react-ga4';
import { Notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useModel } from '@modern-js/runtime/model';
import DisableDevTool from 'disable-devtool';
import { Watermark } from '@pansy/react-watermark';
import { DefaultFBGreen } from '@/ui/themes/colors';
import { GlobalUserModel } from '@/model/globalUserModel';
import PendingLoadPage from '@/routes/pendingLoadPage';
import { ThemeSwitchModel } from '@/model/UIModel';

ReactGA.initialize('G-C15VXR93XX');

if (process.env.NODE_ENV !== 'development') {
  DisableDevTool({
    md5: '046075e35e84142df39698dcf552a8a0',
  });
}

export default function Layout() {
  const theme = createTheme({
    fontFamily: 'Open Sans, sans-serif',
    colors: {
      DefaultFBGreen,
    },
    components: {
      Anchor: Anchor.extend({
        defaultProps: {
          underline: 'hover',
        },
      }),
    },
  });

  const [userModelState, userModelActions] = useModel(GlobalUserModel);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [themeState, themeActions] = useModel(ThemeSwitchModel);
  const navigate = useNavigate();

  useEffect(() => {
    themeActions.loadTheme();
    async function init() {
      try {
        const ret = await userModelActions.init();
        if (window.location.pathname === '/') {
          navigate('/app');
          return;
        }
        if (window.location.pathname === '/login') {
          const params = new URLSearchParams(window.location.search);
          const action = params.get('action');
          if (
            action !== 'set_new_email' &&
            action !== 'bind_email' &&
            action !== 'change_password'
          ) {
            navigate('/app');
          }
          return;
        }
        if (ret.user.email.length === 0) {
          modals.openConfirmModal({
            title: '安全警告',
            children: (
              <Stack>
                <Text size="sm">
                  我们发现您还未绑定邮箱，这是您找回账号的唯一途径。
                </Text>
                <Text size="sm">为确保账号安全，请绑定您的邮箱。</Text>
              </Stack>
            ),
            labels: { confirm: '前往绑定', cancel: '取消' },
            onConfirm: () => {
              window.location.href = '/login?action=set_new_email';
            },
          });
        }
      } catch (e) {
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
    }
    init();
  }, []);

  const colorSchemeManager = localStorageColorSchemeManager({
    key: 'mv4ColorScheme',
  });

  return (
    <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager}>
      <ModalsProvider>
        <Watermark
          isBody
          text={userModelState.wm}
          opacity={8e-3}
          fontWeight={400}
        />
        {userModelState.loaded ? <Outlet /> : <PendingLoadPage />}
      </ModalsProvider>
      <Notifications />
    </MantineProvider>
  );
}
