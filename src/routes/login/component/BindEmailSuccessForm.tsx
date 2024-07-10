import { Box, Flex, Text, Title } from '@mantine/core';
import css from '@/routes/login/page.module.css';

export default function BindEmailSuccessForm() {
  return (
    <Box>
      <Title order={4}>绑定成功</Title>
      <Flex
        className={css.loginCardForm}
        gap="lg"
        direction="column"
        wrap="wrap"
      >
        <Text size={'sm'}>
          您已成功绑定邮箱{' '}
          {new URLSearchParams(window.location.search).get('email')} 。
        </Text>
        <Text size={'sm'}>现在您可以关闭这个页面了。</Text>
      </Flex>
    </Box>
  );
}
