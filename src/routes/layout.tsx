import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import {
  createTheme,
  localStorageColorSchemeManager,
  MantineProvider,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Outlet } from '@modern-js/runtime/router';
import ReactGA from 'react-ga4';
import { Notifications } from '@mantine/notifications';
import { DefaultFBGreen } from '@/ui/themes/colors';

ReactGA.initialize('G-C15VXR93XX');

export default function Layout() {
  const theme = createTheme({
    fontFamily: 'Open Sans, sans-serif',
    colors: {
      DefaultFBGreen,
    },
  });

  const colorSchemeManager = localStorageColorSchemeManager({
    key: 'mv4ColorScheme',
  });

  // const { colorScheme, setColorScheme, toggleColorScheme, clearColorScheme } = useMantineColorScheme();

  return (
    <MantineProvider
      theme={theme}
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme={'auto'}
    >
      <ModalsProvider>
        <Outlet />
      </ModalsProvider>
      <Notifications />
    </MantineProvider>
  );
}
