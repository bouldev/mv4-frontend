import {
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  Modal,
  NavLink,
  NumberInput,
  Space,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useModel } from '@modern-js/runtime/model';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';
import { MV4RequestError } from '@/api/base';
import { MV4Product, MV4ProductCategory } from '@/api/product';
import { mv4RequestApi } from '@/api/mv4Client';
import { GlobalUserModel } from '@/model/globalUserModel';
import { MV4UserPermissionLevel } from '@/api/user';
import MV4Card from '@/ui/component/app/MV4Card';

export default function ShopPage() {
  const { colorScheme } = useMantineColorScheme();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [categoryList, setCategoryList] = useState<MV4ProductCategory[]>([]);
  const [productList, setProductList] = useState<MV4Product[]>([]);
  const [userModelState] = useModel(GlobalUserModel);
  const [enableSetBuyAmount, setEnableSetBuyAmount] = useState<boolean>(false);
  const [enableUseFBCoin, setEnableUseFBCoin] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<MV4Product>({
    productId: '',
    name: '',
    desc: '',
    categoryId: '',
    price: 0,
    discount: 0,
    canPayDirectly: false,
    canUseBalance: false,
    canUseFBCoins: false,
  });
  const [buyModalOpened, buyModalActions] = useDisclosure(false);
  const [currentSetBuyAmountInput, setCurrentSetBuyAmountInput] = useState<
    string | number
  >(1);
  const [enableGenerateRedeemCode, setEnableGenerateRedeemCode] =
    useState(false);
  const currentRedeemCode = useRef('');
  const [captchaModalOpened, captchaModalActions] = useDisclosure(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [captchaInitSuccess, setCaptchaInitSuccess] = useState(false);

  async function refreshShopList() {
    setShowLoading(true);
    try {
      const categoryRet = await mv4RequestApi<
        any,
        {
          categoryList: MV4ProductCategory[];
        }
      >({
        path: '/shop/get-product-categories',
        methodGet: true,
      });
      const productRet = await mv4RequestApi<
        any,
        {
          productList: MV4Product[];
        }
      >({
        path: '/shop/get-products',
        methodGet: true,
      });
      if (categoryRet.data.categoryList.length !== 0) {
        setCategoryList(categoryRet.data.categoryList);
        setActiveTab(categoryRet.data.categoryList[0].categoryId);
      }
      setProductList(productRet.data.productList);
      setShowLoading(false);
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: '获取商店列表失败，请刷新页面',
          message: e.message,
          color: 'red',
        });
      }
    }
  }

  async function onClickProduct(product: MV4Product) {
    setCurrentProduct(product);
    setEnableGenerateRedeemCode(false);
    setEnableUseFBCoin(false);
    setEnableSetBuyAmount(false);
    setCurrentSetBuyAmountInput(1);
    buyModalActions.open();
  }

  async function onClickUseRedeemCode() {
    currentRedeemCode.current = '';
    modals.open({
      title: '使用兑换码',
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: (
        <Stack>
          <TextInput
            label="兑换码"
            placeholder="请输入兑换码"
            onChange={e => {
              currentRedeemCode.current = e.currentTarget.value;
            }}
          />
          <Button
            fullWidth
            onClick={async () => {
              modals.closeAll();
              try {
                const ret = await mv4RequestApi<any, { name: string }>({
                  path: '/redeem-code/get-status',
                  data: {
                    code: currentRedeemCode.current,
                  },
                });
                modals.openConfirmModal({
                  title: '确定使用该兑换码吗？',
                  children: (
                    <Text size="sm">该兑换码可兑换：{ret.data.name}</Text>
                  ),
                  labels: { confirm: '确定', cancel: '取消' },
                  onConfirm: async () => {
                    try {
                      await mv4RequestApi({
                        path: '/redeem-code/use',
                        data: {
                          code: currentRedeemCode.current,
                        },
                      });
                      notifications.show({
                        message: '成功使用兑换码',
                      });
                    } catch (e) {
                      console.error(e);
                      if (e instanceof MV4RequestError || e instanceof Error) {
                        notifications.show({
                          title: '兑换码使用失败',
                          message: e.message,
                          color: 'red',
                        });
                      }
                    }
                    /*
                    setCaptchaInitSuccess(false);
                    captchaModalActions.open();
                    await awaitSleep(100);
                    initTianAiCaptcha('#tac-box-shop', {
                      onSuccess: async token => {
                        captchaModalActions.close();
                        try {
                          await mv4RequestApi({
                            path: '/redeem-code/use',
                            data: {
                              code: currentRedeemCode.current,
                              captcha_token: token,
                            },
                          });
                          notifications.show({
                            message: '成功使用兑换码',
                          });
                        } catch (e) {
                          console.error(e);
                          if (
                            e instanceof MV4RequestError ||
                            e instanceof Error
                          ) {
                            notifications.show({
                              title: '兑换码使用失败',
                              message: e.message,
                              color: 'red',
                            });
                          }
                        }
                      },
                      onClickClose: () => {
                        captchaModalActions.close();
                      },
                      onInitialize: () => {
                        setCaptchaInitSuccess(true);
                      },
                    });
                    */
                  },
                });
              } catch (e) {
                console.error(e);
                if (e instanceof MV4RequestError || e instanceof Error) {
                  notifications.show({
                    title: '兑换码使用失败',
                    message: e.message,
                    color: 'red',
                  });
                }
              }
            }}
            mt="md"
          >
            使用
          </Button>
        </Stack>
      ),
    });
  }

  useEffect(() => {
    async function init() {
      await refreshShopList();
    }
    init();
  }, []);

  return (
    <Stack>
      <Modal
        opened={captchaModalOpened}
        onClose={captchaModalActions.close}
        title="请完成验证码"
        centered={true}
      >
        <Stack align="center" justify="center">
          {!captchaInitSuccess && <Text size="sm">验证码加载中</Text>}
          <div id="tac-box-shop" />
        </Stack>
      </Modal>
      <Modal
        opened={buyModalOpened}
        onClose={buyModalActions.close}
        title={currentProduct.name}
      >
        <Stack>
          <Text size="sm">价格：￥ {currentProduct.price}</Text>
          <Text size="sm">介绍：</Text>
          <Text
            size="sm"
            dangerouslySetInnerHTML={{
              __html: currentProduct.desc.replaceAll('\n', '<br/>'),
            }}
          />
          <Space h={20} />
          {(!currentProduct.canUseBalance || !currentProduct.canUseFBCoins) && (
            <Box>
              <Text size="xs" c="dimmed">
                该商品不可使用
                {!currentProduct.canUseFBCoins && 'FBCoin'}
                {!currentProduct.canUseBalance &&
                  !currentProduct.canUseFBCoins &&
                  '、'}
                {!currentProduct.canUseBalance && '余额'}
                进行抵扣。
              </Text>
              {!currentProduct.canPayDirectly && (
                <Text size="xs" c="dimmed">
                  该商品不可通过直接支付获得。
                </Text>
              )}
            </Box>
          )}
          <Stack>
            {currentProduct.canUseBalance &&
              userModelState.user.permission >=
                MV4UserPermissionLevel.DEALER && (
                <Checkbox
                  label="改为获取该商品兑换码（只能使用余额）"
                  checked={enableGenerateRedeemCode}
                  onChange={event => {
                    setEnableGenerateRedeemCode(event.currentTarget.checked);
                  }}
                />
              )}
            {enableUseFBCoin && (
              <Box>
                <Text size={'xs'}>
                  您当前持有 {userModelState.user.fbCoins} FBCoin
                </Text>
                {userModelState.user.fbCoins > 0 ? (
                  <>
                    {userModelState.user.fbCoins -
                      (currentProduct.price *
                        Number(currentSetBuyAmountInput)) /
                        2 >=
                      0 && (
                      <Text size="xs">
                        本次将消耗{' '}
                        {userModelState.user.fbCoins -
                          Number(currentSetBuyAmountInput) *
                            Math.floor(currentProduct.price / 2) >=
                        0
                          ? Number(currentSetBuyAmountInput) *
                            Math.floor(currentProduct.price / 2)
                          : userModelState.user.fbCoins}{' '}
                        FBCoin
                      </Text>
                    )}
                    {currentProduct.canPayDirectly ? (
                      <Text size={'xs'}>
                        使用FBCoin抵扣后，
                        {/* eslint-disable-next-line no-nested-ternary */}
                        {userModelState.user.fbCoins -
                          (currentProduct.price *
                            Number(currentSetBuyAmountInput)) /
                            2 >=
                        0
                          ? (currentProduct.price *
                              Number(currentSetBuyAmountInput)) %
                              2 ===
                            0
                            ? '您无需支付费用'
                            : `您还需支付 ￥ ${currentProduct.price % 2}`
                          : `您还需支付 ￥ ${
                              currentProduct.price *
                                Number(currentSetBuyAmountInput) -
                              userModelState.user.fbCoins * 2
                            }`}
                        。
                      </Text>
                    ) : (
                      <Text size={'xs'}>
                        {/* eslint-disable-next-line no-nested-ternary */}
                        {userModelState.user.fbCoins -
                          (currentProduct.price *
                            Number(currentSetBuyAmountInput)) /
                            2 >=
                        0
                          ? (currentProduct.price *
                              Number(currentSetBuyAmountInput)) %
                              2 ===
                            0
                            ? '使用FBCoin抵扣后，您无需支付费用'
                            : '注意：因无法正确抵扣价格，无法购买该商品'
                          : '注意：您当前的FBCoin余额不足以购买该商品'}
                        。
                      </Text>
                    )}
                  </>
                ) : (
                  <Text size={'xs'}>无法使用FBCoin抵扣。</Text>
                )}
              </Box>
            )}
            {currentProduct.canUseFBCoins && !enableGenerateRedeemCode && (
              <Checkbox
                label="使用FBCoin (1:2)"
                checked={enableUseFBCoin}
                onChange={event => {
                  setEnableUseFBCoin(event.currentTarget.checked);
                }}
              />
            )}
            <Checkbox
              label="批量购买"
              checked={enableSetBuyAmount}
              onChange={event => {
                if (!event.currentTarget.checked) {
                  setCurrentSetBuyAmountInput(1);
                }
                setEnableSetBuyAmount(event.currentTarget.checked);
              }}
            />
            {enableSetBuyAmount && (
              <NumberInput
                label="购买件数"
                min={1}
                max={
                  userModelState.user.permission >=
                  MV4UserPermissionLevel.DEALER
                    ? 100
                    : 5
                }
                allowDecimal={false}
                allowNegative={false}
                value={currentSetBuyAmountInput}
                onChange={setCurrentSetBuyAmountInput}
              />
            )}
          </Stack>
          <Group justify="flex-end">
            <Button
              size="sm"
              variant="default"
              onClick={() => buyModalActions.close()}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const ret = await mv4RequestApi<
                    any,
                    {
                      orderNo: string;
                    }
                  >({
                    path: '/shop/buy-product',
                    data: {
                      buyForUsername: userModelState.user.username,
                      productId: currentProduct.productId,
                      amount: currentSetBuyAmountInput
                        ? currentSetBuyAmountInput
                        : 1,
                      gen: enableGenerateRedeemCode,
                      useCoin: enableUseFBCoin,
                    },
                  });
                  window.location.href = `/app/pay-order?orderNo=${ret.data.orderNo}`;
                } catch (e) {
                  console.error(e);
                  if (e instanceof MV4RequestError || e instanceof Error) {
                    notifications.show({
                      title: '下单失败',
                      message: e.message,
                      color: 'red',
                    });
                  }
                }
              }}
            >
              购买
            </Button>
          </Group>
        </Stack>
      </Modal>
      <PageTitle>商店</PageTitle>
      <Card
        shadow="xl"
        padding="sm"
        radius="md"
        withBorder
        className={`${eleCss.appShellBg} ${
          colorScheme === 'light' ? eleCss.appShellBgLight : ''
        }`}
        mih={'450px'}
      >
        <LoadingOverlay
          visible={showLoading}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            {categoryList.map(item => {
              return (
                <Tabs.Tab value={item.categoryId} key={item.categoryId}>
                  {item.name}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
          <Stack mt={'xs'} gap={'sm'}>
            {categoryList.map(c => {
              return (
                <Tabs.Panel value={c.categoryId} key={c.categoryId}>
                  {productList
                    .filter(v => v.categoryId === c.categoryId)
                    .map(p => {
                      return (
                        <NavLink
                          key={p.productId}
                          label={p.name}
                          onClick={() => onClickProduct(p)}
                        />
                      );
                    })}
                </Tabs.Panel>
              );
            })}
          </Stack>
        </Tabs>
      </Card>
      <MV4Card>
        <Stack gap={'md'}>
          <Title order={4}>兑换码</Title>
          <Stack gap={'sm'}>
            <Text size={'sm'}>可在此处使用获得的兑换码。</Text>
            <Group gap={'sm'}>
              <Button onClick={onClickUseRedeemCode}>使用兑换码</Button>
            </Group>
          </Stack>
        </Stack>
      </MV4Card>
    </Stack>
  );
}
