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
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Outlet, useNavigate } from '@modern-js/runtime/router';
import ReactGA from 'react-ga4';
import { Notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useModel } from '@modern-js/runtime/model';
import { DefaultFBGreen } from '@/ui/themes/colors';
import { GlobalUserModel } from '@/model/globalUserModel';
import PendingLoadPage from '@/routes/pendingLoadPage';
import { ThemeSwitchModel } from '@/model/UIModel';

ReactGA.initialize('G-C15VXR93XX');

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
        await userModelActions.init();
        if (window.location.pathname === '/') {
          navigate('/app');
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
        {userModelState.loaded ? <Outlet /> : <PendingLoadPage />}
      </ModalsProvider>
      <Notifications />
    </MantineProvider>
  );
}
