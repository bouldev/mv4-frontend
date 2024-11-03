import {
  Box,
  Button,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import CopyToClipboard from 'copy-to-clipboard';
import { useModel } from '@modern-js/runtime/model';
import PageTitle from '@/ui/component/app/PageTitle';
import HelperBotCard from '@/ui/component/manage/HelperBotCard';
import MV4Card from '@/ui/component/app/MV4Card';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import { GlobalUserModel } from '@/model/globalUserModel';

export default function OpenAPIPage() {
  const [userModelState, userModelActions] = useModel(GlobalUserModel);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [apiKeyText, setApiKeyText] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await userModelActions.update();
        setApiKeyText(userModelState.user.apiKey);
        setApiKeyLoading(false);
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  function onClickCopy(str: string) {
    CopyToClipboard(str);
    notifications.show({
      message: '已将内容复制到剪贴板',
    });
  }

  return (
    <Stack>
      <PageTitle>OpenAPI</PageTitle>
      <Stack gap={'sm'}>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>介绍</Title>
            <Text size={'sm'}>
              OpenAPI 是用户中心提供的一系列实用的HTTP
              API，它能更好地帮助您完成某些扩展的开发，节省开发周期。
            </Text>
            <Group gap={'sm'}>
              <Button
                onClick={async () => {
                  window.open(
                    'https://user.fastbuilder.pro/openapi-doc/',
                    '_blank',
                  );
                }}
              >
                查看文档
              </Button>
            </Group>
          </Stack>
        </MV4Card>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>OpenAPI Key</Title>
            <Box>
              <Text size={'sm'}>调用OpenAPI需要用到的凭证。</Text>
              <Text size={'sm'}>
                OpenAPI Key拥有控制您账号的权限，因此请不要泄露给他人。
              </Text>
            </Box>
            {apiKeyLoading && (
              <Text size={'sm'} fs={'italic'}>
                请稍等，正在加载。。。
              </Text>
            )}
            {!apiKeyLoading && (
              <Stack gap={'sm'}>
                {apiKeyText.length === 0 ? (
                  <Text size={'sm'} fs={'italic'}>
                    未创建，点击“重置”以获取
                  </Text>
                ) : (
                  <Grid gutter="xs">
                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                      <TextInput value={showApiKey ? apiKeyText : '******'} />
                    </Grid.Col>
                  </Grid>
                )}
                <Group gap={'sm'}>
                  {apiKeyText.length > 0 && (
                    <>
                      <Button
                        onClick={() => {
                          setShowApiKey(!showApiKey);
                        }}
                      >
                        {showApiKey ? '隐藏' : '显示'}
                      </Button>
                      <Button
                        onClick={() => {
                          onClickCopy(apiKeyText);
                        }}
                      >
                        复制
                      </Button>
                    </>
                  )}
                  <Button
                    bg={'red'}
                    onClick={async () => {
                      modals.openConfirmModal({
                        title: '确定重置OpenAPI Key？',
                        children: (
                          <Box>
                            <Text size="sm">
                              重置后，旧的OpenAPI Key将立刻失效。
                            </Text>
                          </Box>
                        ),
                        labels: { confirm: '确定重置', cancel: '取消' },
                        confirmProps: { color: 'red' },
                        onConfirm: async () => {
                          try {
                            const ret = await mv4RequestApi<
                              any,
                              {
                                key: string;
                              }
                            >({
                              path: '/user/reset-openapi-key',
                              methodGet: true,
                            });
                            setApiKeyText(ret.data.key);
                            notifications.show({
                              message: '已重置OpenAPI Key',
                            });
                          } catch (e) {
                            console.error(e);
                            if (
                              e instanceof MV4RequestError ||
                              e instanceof Error
                            ) {
                              notifications.show({
                                title: '重置OpenAPI Key失败',
                                message: e.message,
                                color: 'red',
                              });
                            }
                          }
                        },
                      });
                    }}
                  >
                    重置
                  </Button>
                </Group>
              </Stack>
            )}
          </Stack>
        </MV4Card>
        <HelperBotCard isUserAccount={true} />
      </Stack>
    </Stack>
  );
}
