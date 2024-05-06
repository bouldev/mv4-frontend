import { createContext } from 'react';

export enum ColorStylesEnum {
  DefaultFBGreen,
  BiliPink,
  XiaomiOrange,
  LemonYellow,
  SpringGreen,
  ZhihuBlue,
}

export const ColorStyleContext = createContext<ColorStylesEnum>(
  ColorStylesEnum.DefaultFBGreen,
);
