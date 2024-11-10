import { model } from '@modern-js/runtime/model';
import { notifications } from '@mantine/notifications';
import bgCss from '@/ui/css/background.module.css';

export interface MV4ThemeContextState {
  style: 'default' | 'anime';
}

export function getThemeStyleCssName(
  nowTheme: MV4ThemeContextState['style'],
): string {
  switch (nowTheme) {
    case 'anime':
      return bgCss.bgAnime;
    case 'default':
    default:
      return bgCss.bgDefault;
  }
}

export const ThemeSwitchModel = model<MV4ThemeContextState>(
  'mv4ThemeSwitchModel',
).define({
  state: {
    style: 'default',
  },
  actions: {
    loadTheme: {
      fulfilled: (state, value: MV4ThemeContextState) => {
        state.style = value.style;
      },
    },
    changeStyle: {
      fulfilled: (state, value: MV4ThemeContextState['style']) => {
        state.style = value;
        notifications.clean();
        notifications.show({
          message: `已切换到${value === 'default' ? '默认' : '花里胡哨'}主题`,
        });
      },
    },
  },
  effects: {
    async loadTheme(): Promise<MV4ThemeContextState> {
      const getStyle = localStorage.getItem('mv4ThemeStyle');
      return {
        style: (getStyle
          ? getStyle
          : 'default') as MV4ThemeContextState['style'],
      };
    },
    async changeStyle(
      style: MV4ThemeContextState['style'],
    ): Promise<MV4ThemeContextState['style']> {
      localStorage.setItem('mv4ThemeStyle', style);
      return style;
    },
  },
});
