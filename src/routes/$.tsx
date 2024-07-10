import { Text, Anchor, Flex, Box } from '@mantine/core';
import css from '@/ui/css/background.module.css';

export default function NotFoundPage() {
  return (
    <Box className={`${css.bg} ${css.bgDefault}`}>
      <Flex
        h={'100vh'}
        direction={'column'}
        gap="lg"
        justify={'center'}
        align={'center'}
      >
        <Text>这里没有任何东西</Text>
        <Anchor href={'/'}>返回主页</Anchor>
      </Flex>
    </Box>
  );
}
