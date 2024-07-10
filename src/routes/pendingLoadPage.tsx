import {
  Box,
  RemoveScroll,
  useMantineColorScheme,
  LoadingOverlay,
} from '@mantine/core';
import { useModel } from '@modern-js/runtime/model';
import bgCss from '@/ui/css/background.module.css';
import { getThemeStyleCssName, ThemeSwitchModel } from '@/model/UIModel';

export default function PendingLoadPage() {
  const { colorScheme } = useMantineColorScheme();

  const [themeState] = useModel(ThemeSwitchModel);

  return (
    <RemoveScroll>
      <Box
        className={`${bgCss.bg} ${bgCss.bgFixer} ${getThemeStyleCssName(
          themeState.style,
        )} ${
          colorScheme === 'light' && themeState.style === 'anime'
            ? bgCss.bgAnimeLight
            : ''
        }`}
      >
        <LoadingOverlay
          visible={true}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
      </Box>
    </RemoveScroll>
  );
}
