import { modals } from '@mantine/modals';
import { Avatar, Group, Stack, Text, Title } from '@mantine/core';
import { SimplePlayerInfo } from '@/api/nemcQueryPlayer';

export function ModalConfirmPlayerWithAvatar(
  title: string,
  message: string,
  playerInfo: SimplePlayerInfo,
  nextFunction: any,
) {
  modals.openConfirmModal({
    title: <Title order={4}>{title}</Title>,
    children: (
      <Stack>
        <Text size="sm">{message}</Text>
        <Group align="center">
          <Avatar
            variant="filled"
            radius="sm"
            size="xl"
            src={playerInfo.avatar_image_url}
          />
          <Stack>
            <Text size="sm">昵称：{playerInfo.name}</Text>
            <Text size="sm">UID：{playerInfo.entity_id}</Text>
          </Stack>
        </Group>
      </Stack>
    ),
    labels: { confirm: '确定', cancel: '取消' },
    onConfirm: async () => nextFunction(),
  });
}
