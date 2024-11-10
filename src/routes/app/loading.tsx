import { Loader, LoadingOverlay, Stack, Text } from '@mantine/core';

export function LoadingPage() {
  return (
    <Stack>
      <LoadingOverlay
        visible={true}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{
          children: (
            <Stack gap="xl" align="center">
              <Loader color="blue" size="lg" />
              <Text>正在加载</Text>
            </Stack>
          ),
        }}
      />
    </Stack>
  );
}
