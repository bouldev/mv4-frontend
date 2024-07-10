import { model } from '@modern-js/runtime/model';
import { notifications } from '@mantine/notifications';
import bgCss from '@/ui/css/background.module.css';

export enum ColorStylesEnum {
  DefaultFBGreen = 'default',
  BiliPink = 'bili-pink',
  XiaomiOrange = 'xiaomi-orange',
  LemonYellow = 'lemon-yellow',
  SpringGreen = 'spring-green',
  ZhihuBlue = 'zhihu-blue',
}

export interface MV4ThemeContextState {
  style: 'default' | 'anime';
  color: ColorStylesEnum;
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
    color: ColorStylesEnum.DefaultFBGreen,
  },
  actions: {
    loadTheme: {
      fulfilled: (state, value: MV4ThemeContextState) => {
        state.style = value.style;
        state.color = value.color;
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
    changeColor: {
      fulfilled: (state, value: MV4ThemeContextState['color']) => {
        state.color = value;
      },
    },
  },
  effects: {
    async loadTheme(): Promise<MV4ThemeContextState> {
      const getStyle = localStorage.getItem('mv4ThemeStyle');
      const getColor = localStorage.getItem('mv4ThemeColor');
      return {
        style: (getStyle
          ? getStyle
          : 'default') as MV4ThemeContextState['style'],
        color: (getColor
          ? getColor
          : ColorStylesEnum.DefaultFBGreen) as MV4ThemeContextState['color'],
      };
    },
    async changeStyle(
      style: MV4ThemeContextState['style'],
    ): Promise<MV4ThemeContextState['style']> {
      localStorage.setItem('mv4ThemeStyle', style);
      return style;
    },
    async changeColor(
      color: MV4ThemeContextState['color'],
    ): Promise<MV4ThemeContextState['color']> {
      localStorage.setItem('mv4ThemeColor', color);
      return color;
    },
  },
});
