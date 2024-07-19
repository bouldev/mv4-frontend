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

export default function ShopPage() {
  const { colorScheme } = useMantineColorScheme();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [categoryList, setCategoryList] = useState<MV4ProductCategory[]>([]);
  const [productList, setProductList] = useState<MV4Product[]>([]);
  const [userModelState] = useModel(GlobalUserModel);
  const [enableSetBuyAmount, setEnableSetBuyAmount] = useState<boolean>(false);
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
  const [shouldGenerateRedeemCode, setShouldGenerateRedeemCode] =
    useState(false);
  const currentRedeemCode = useRef('');

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
            onChange={e => {
              currentRedeemCode.current = e.currentTarget.value;
            }}
          />
          <Button
            fullWidth
            onClick={async () => {
              modals.closeAll();
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
        opened={buyModalOpened}
        onClose={buyModalActions.close}
        title={<Title order={6}>{currentProduct.name}</Title>}
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
            {userModelState.user.permission >=
              MV4UserPermissionLevel.DEALER && (
              <Checkbox
                label="改为获取该商品兑换码（只能使用余额）"
                checked={shouldGenerateRedeemCode}
                onChange={event => {
                  setShouldGenerateRedeemCode(event.currentTarget.checked);
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
                max={100}
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
                      gen: shouldGenerateRedeemCode,
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
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className={`${eleCss.appShellBg} ${
          colorScheme === 'light' ? eleCss.appShellBgLight : ''
        }`}
      >
        <Stack gap={'md'}>
          <Title order={4}>兑换码</Title>
          <Stack gap={'sm'}>
            <Text size={'sm'}>可在此处使用获得的兑换码。</Text>
            <Group gap={'sm'}>
              <Button onClick={onClickUseRedeemCode}>使用兑换码</Button>
            </Group>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
