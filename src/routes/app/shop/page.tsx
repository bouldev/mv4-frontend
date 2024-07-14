import {
  Card,
  LoadingOverlay,
  NavLink,
  Space,
  Stack,
  Tabs,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useModel } from '@modern-js/runtime/model';
import PageTitle from '@/ui/component/app/PageTitle';
import eleCss from '@/ui/css/elements.module.css';
import { MV4RequestError } from '@/api/base';
import { MV4Product, MV4ProductCategory } from '@/api/product';
import { mv4RequestApi } from '@/api/mv4Client';
import { GlobalUserModel } from '@/model/globalUserModel';

export default function ShopPage() {
  const { colorScheme } = useMantineColorScheme();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [categoryList, setCategoryList] = useState<MV4ProductCategory[]>([]);
  const [productList, setProductList] = useState<MV4Product[]>([]);
  const [userModelState] = useModel(GlobalUserModel);

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
    modals.openConfirmModal({
      title: <Title order={6}>{product.name}</Title>,
      children: (
        <Stack>
          <Text size="sm">价格：￥ {product.price}</Text>
          <Text size="sm">介绍：{product.desc}</Text>
          <Space h={20} />
          {(!product.canUseBalance || !product.canUseFBCoins) && (
            <Text size="xs" c="dimmed">
              注意：该商品不可使用
              {!product.canUseFBCoins && 'FBCoin'}
              {!product.canUseBalance && !product.canUseFBCoins && '、'}
              {!product.canUseBalance && '余额'}
              进行抵扣。
            </Text>
          )}
        </Stack>
      ),
      labels: { confirm: '购买', cancel: '取消' },
      onConfirm: async () => {
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
              productId: product.productId,
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
      },
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
    </Stack>
  );
}
