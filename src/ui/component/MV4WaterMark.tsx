import { useModel } from '@modern-js/runtime/model';
import { useMantineColorScheme } from '@mantine/core';
import { Watermark } from '@pansy/react-watermark';
import { GlobalUserModel } from '@/model/globalUserModel';

export default function MV4WaterMark({
  force = false,
  disable = false,
}: {
  force?: boolean;
  disable?: boolean;
}) {
  const [userModelState] = useModel(GlobalUserModel);
  const { colorScheme } = useMantineColorScheme();

  return (
    <Watermark
      isBody
      text={
        !disable && (force || userModelState.user.isLifetimePlan)
          ? userModelState.wm
          : ['']
      }
      fontColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
      opacity={0.23}
      fontWeight={400}
      fontSize={19}
      rotate={-15}
    />
  );
}
