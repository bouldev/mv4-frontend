import {
  Box,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Stack,
  Checkbox,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import PageTitle from '@/ui/component/app/PageTitle';
import { MV4ProductCategoryFull, MV4ProductFull } from '@/api/product';
import { permissionToString, productTypeToString } from '@/utils/stringUtils';
import { MV4RequestError } from '@/api/base';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4UserPermissionLevel, MV4UserProductType } from '@/api/user';
import MV4Card from '@/ui/component/app/MV4Card';

export default function ManagePage() {
  const [productList, setProductList] = useState<MV4ProductFull[]>([]);
  const [categoryList, setCategoryList] = useState<MV4ProductCategoryFull[]>(
    [],
  );
  const [itemIdList, setItemIdList] = useState<string[]>([]);
  const [showCategoryLoading, setShowCategoryLoading] = useState(true);
  const [showProductLoading, setShowProductLoading] = useState(true);

  const [categoryFormOpened, categoryFormActions] = useDisclosure(false);
  const [productFormOpened, productFormActions] = useDisclosure(false);
  const [isCreate, setIsCreate] = useState(false);

  const subProductForm = useForm({
    initialValues: {
      targetChangeProductId: '',
      name: '',
      desc: '',
      categoryId: '',
      price: 0,
      discount: 100,
      needPlanStr: '0',
      showForAnotherPlans: false,
      needPermissionStr: '0',
      canPayDirectly: true,
      canUseBalance: false,
      canUseFBCoins: false,
      itemId: '',
      itemAmount: 1,
    },
  });

  const subCategoryForm = useForm({
    initialValues: {
      targetChangeCategoryId: '',
      name: '',
      needPlanStr: '0',
      needPermissionStr: '0',
    },
  });

  async function refreshCategoryList() {
    setShowCategoryLoading(true);
    try {
      const ret = await mv4RequestApi<
        any,
        {
          categoryList: MV4ProductCategoryFull[];
        }
      >({
        path: '/shop/get-product-categories-full',
        methodGet: true,
      });
      setCategoryList(ret.data.categoryList);
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: '获取商品分区失败',
          message: e.message,
          color: 'red',
        });
      }
    }
    setShowCategoryLoading(false);
  }

  async function refreshProductList() {
    setShowProductLoading(true);
    try {
      const ret = await mv4RequestApi<
        any,
        {
          productList: MV4ProductFull[];
        }
      >({
        path: '/shop/get-products-full',
        methodGet: true,
      });
      setProductList(ret.data.productList);
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: '获取商品列表失败',
          message: e.message,
          color: 'red',
        });
      }
    }
    setShowProductLoading(false);
  }

  async function refreshItemIdList() {
    try {
      const ret = await mv4RequestApi<
        any,
        {
          items: string[];
        }
      >({
        path: '/shop/get-item-id-list',
        methodGet: true,
      });
      setItemIdList(ret.data.items);
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: '获取itemId列表失败',
          message: e.message,
          color: 'red',
        });
      }
    }
  }

  useEffect(() => {
    async function init() {
      await refreshCategoryList();
      await refreshProductList();
      await refreshItemIdList();
    }
    init();
  }, []);

  function getProductCategoryName(product: MV4ProductFull): string {
    const arr = categoryList.filter(
      item => item.categoryId === product.categoryId,
    );
    if (arr.length === 0) {
      return `??? (${product.categoryId})`;
    }
    return arr[0].name;
  }

  function getProductCategoryNameListForSelect() {
    const ret = [];
    for (const item of categoryList) {
      ret.push({
        label: item.name,
        value: item.categoryId,
      });
    }
    return ret;
  }

  async function onClickCreateOrChangeCategory(
    isCreate: boolean,
    index: number,
  ) {
    setIsCreate(isCreate);
    let targetChangeCategory: MV4ProductCategoryFull;
    if (!isCreate) {
      targetChangeCategory = categoryList[index];
      subCategoryForm.setValues({
        targetChangeCategoryId: targetChangeCategory.categoryId,
        name: targetChangeCategory.name,
        needPlanStr: String(targetChangeCategory.needPlan),
        needPermissionStr: String(targetChangeCategory.needPermission),
      });
    } else {
      subCategoryForm.setValues({
        targetChangeCategoryId: '',
        name: '',
        needPlanStr: '0',
        needPermissionStr: '0',
      });
    }
    categoryFormActions.open();
  }

  async function onClickCreateOrChangeProduct(
    isCreate: boolean,
    index: number,
  ) {
    setIsCreate(isCreate);
    let targetChangeProduct: MV4ProductFull;
    if (!isCreate) {
      targetChangeProduct = productList[index];
      subProductForm.setValues({
        targetChangeProductId: targetChangeProduct.productId,
        name: targetChangeProduct.name,
        desc: targetChangeProduct.desc,
        categoryId: targetChangeProduct.categoryId,
        price: targetChangeProduct.price,
        discount: targetChangeProduct.discount,
        needPlanStr: String(targetChangeProduct.needPlan),
        showForAnotherPlans: targetChangeProduct.showForAnotherPlans,
        needPermissionStr: String(targetChangeProduct.needPermission),
        canPayDirectly: targetChangeProduct.canPayDirectly,
        canUseBalance: targetChangeProduct.canUseBalance,
        canUseFBCoins: targetChangeProduct.canUseFBCoins,
        itemId: targetChangeProduct.itemId,
        itemAmount: targetChangeProduct.itemAmount,
      });
    } else {
      subProductForm.setValues({
        targetChangeProductId: '',
        name: '',
        desc: '',
        categoryId: '',
        price: 0,
        discount: 100,
        needPlanStr: '0',
        showForAnotherPlans: false,
        needPermissionStr: '0',
        canPayDirectly: true,
        canUseBalance: false,
        canUseFBCoins: false,
        itemId: '',
        itemAmount: 1,
      });
    }
    productFormActions.open();
  }

  async function setProductCanBuy(id: string, canBuy: boolean) {
    try {
      await mv4RequestApi({
        path: '/admin/product/set-product-can-buy',
        data: {
          productId: id,
          canBuy,
        },
      });
      await refreshProductList();
    } catch (e) {
      console.error(e);
      if (e instanceof MV4RequestError || e instanceof Error) {
        notifications.show({
          title: '设置商品上架状态失败',
          message: e.message,
          color: 'red',
        });
      }
    }
  }

  async function deleteProduct(product: MV4ProductFull) {
    modals.openConfirmModal({
      title: '确定删除这个商品吗？',
      children: <Text size="sm">商品名称：{product.name}</Text>,
      labels: { confirm: '确定', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await mv4RequestApi({
            path: '/admin/product/delete-product',
            data: {
              productId: product.productId,
            },
          });
          await refreshProductList();
        } catch (e) {
          console.error(e);
          if (e instanceof MV4RequestError || e instanceof Error) {
            notifications.show({
              title: '删除商品失败',
              message: e.message,
              color: 'red',
            });
          }
        }
      },
    });
  }

  async function deleteCategory(category: MV4ProductCategoryFull) {
    modals.openConfirmModal({
      title: '确定删除这个分区吗？',
      children: <Text size="sm">分区名称：{category.name}</Text>,
      labels: { confirm: '确定', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await mv4RequestApi({
            path: '/admin/product/delete-category',
            data: {
              categoryId: category.categoryId,
            },
          });
          await refreshCategoryList();
        } catch (e) {
          console.error(e);
          if (e instanceof MV4RequestError || e instanceof Error) {
            notifications.show({
              title: '删除分区失败',
              message: e.message,
              color: 'red',
            });
          }
        }
      },
    });
  }

  return (
    <Stack>
      <Modal
        opened={categoryFormOpened}
        onClose={categoryFormActions.close}
        title={isCreate ? '创建新分区' : '修改分区'}
        closeOnEscape={false}
        closeOnClickOutside={false}
      >
        <form
          onSubmit={subCategoryForm.onSubmit(async values => {
            try {
              await mv4RequestApi<any, any>({
                path: `/admin/product${
                  isCreate ? '/create' : '/change'
                }-category`,
                data: {
                  categoryId: isCreate
                    ? undefined
                    : values.targetChangeCategoryId,
                  name: values.name,
                  needPlan: Number(values.needPlanStr),
                  needPermission: Number(values.needPermissionStr),
                },
              });
              await refreshCategoryList();
              categoryFormActions.close();
            } catch (e) {
              console.error(e);
              if (e instanceof MV4RequestError || e instanceof Error) {
                notifications.show({
                  title: `${isCreate ? '创建新分区' : '修改分区'}失败`,
                  message: e.message,
                  color: 'red',
                });
              }
            }
          })}
        >
          <Stack>
            <TextInput
              label="分区名称"
              key={subCategoryForm.key('name')}
              {...subCategoryForm.getInputProps('name')}
            />
            <Select
              label="限制计划"
              allowDeselect={false}
              key={subCategoryForm.key('needPlanStr')}
              {...subCategoryForm.getInputProps('needPlanStr')}
              data={[
                {
                  label: '无计划',
                  value: String(MV4UserProductType.NO_SERVICES),
                },
                {
                  label: 'Premium',
                  value: String(MV4UserProductType.PREMIUM),
                },
                {
                  label: 'Business',
                  value: String(MV4UserProductType.BUSINESS),
                },
                {
                  label: 'Commercial',
                  value: String(MV4UserProductType.COMMERCIAL),
                },
                {
                  label: 'Developer',
                  value: String(MV4UserProductType.DEVELOPER),
                },
              ]}
              maxDropdownHeight={200}
            />
            <Select
              label="限制权限"
              allowDeselect={false}
              key={subCategoryForm.key('needPermissionStr')}
              {...subCategoryForm.getInputProps('needPermissionStr')}
              data={[
                {
                  label: '用户',
                  value: String(MV4UserPermissionLevel.USER),
                },
                {
                  label: '授权经销商',
                  value: String(MV4UserPermissionLevel.DEALER),
                },
                {
                  label: '管理员',
                  value: String(MV4UserPermissionLevel.ADMIN),
                },
                {
                  label: '所有者',
                  value: String(MV4UserPermissionLevel.OWNER),
                },
              ]}
              maxDropdownHeight={200}
            />
          </Stack>
          <Group justify="flex-end" mt="md">
            <Button type="submit">{isCreate ? '创建' : '修改'}</Button>
          </Group>
        </form>
      </Modal>
      <Modal
        opened={productFormOpened}
        onClose={productFormActions.close}
        title={isCreate ? '创建新商品' : '修改商品'}
        closeOnEscape={false}
        closeOnClickOutside={false}
      >
        <form
          onSubmit={subProductForm.onSubmit(async values => {
            try {
              await mv4RequestApi<any, any>({
                path: `/admin/product${
                  isCreate ? '/create' : '/change'
                }-product`,
                data: {
                  productId: isCreate
                    ? undefined
                    : values.targetChangeProductId,
                  name: values.name,
                  desc: values.desc,
                  categoryId: values.categoryId,
                  price: values.price,
                  discount: values.discount,
                  needPlan: Number(values.needPlanStr),
                  showForAnotherPlans: values.showForAnotherPlans,
                  needPermission: Number(values.needPermissionStr),
                  canPayDirectly: values.canPayDirectly,
                  canUseBalance: values.canUseBalance,
                  canUseFBCoins: values.canUseFBCoins,
                  itemId: values.itemId,
                  itemAmount: values.itemAmount,
                },
              });
              await refreshProductList();
              productFormActions.close();
            } catch (e) {
              console.error(e);
              if (e instanceof MV4RequestError || e instanceof Error) {
                notifications.show({
                  title: `${isCreate ? '创建新商品' : '修改商品'}失败`,
                  message: e.message,
                  color: 'red',
                });
              }
            }
          })}
        >
          <Stack>
            <Group>
              <TextInput
                label="商品名称"
                key={subProductForm.key('name')}
                {...subProductForm.getInputProps('name')}
              />
              <Select
                label="分区"
                allowDeselect={false}
                key={subProductForm.key('categoryId')}
                {...subProductForm.getInputProps('categoryId')}
                data={getProductCategoryNameListForSelect()}
                maxDropdownHeight={200}
              />
            </Group>
            <Group>
              <NumberInput
                label="价格"
                decimalScale={2}
                allowNegative={false}
                key={subProductForm.key('price')}
                {...subProductForm.getInputProps('price')}
              />
              <NumberInput
                label="折扣力度（100为不打折）"
                suffix="%"
                decimalScale={0}
                allowNegative={false}
                key={subProductForm.key('discount')}
                {...subProductForm.getInputProps('discount')}
              />
            </Group>
            <Group>
              <Select
                label="实际提供物品"
                allowDeselect={false}
                key={subProductForm.key('itemId')}
                {...subProductForm.getInputProps('itemId')}
                data={itemIdList}
                maxDropdownHeight={200}
              />
              <NumberInput
                label="物品数量（计划、卡槽为秒数，其余为数量）"
                allowNegative={false}
                decimalScale={0}
                key={subProductForm.key('itemAmount')}
                {...subProductForm.getInputProps('itemAmount')}
              />
            </Group>
            <Textarea
              label="商品介绍"
              autosize
              minRows={2}
              key={subProductForm.key('desc')}
              {...subProductForm.getInputProps('desc')}
            />
            <Select
              label="限制计划"
              allowDeselect={false}
              key={subProductForm.key('needPlanStr')}
              {...subProductForm.getInputProps('needPlanStr')}
              data={[
                {
                  label: '无计划',
                  value: String(MV4UserProductType.NO_SERVICES),
                },
                {
                  label: 'Premium',
                  value: String(MV4UserProductType.PREMIUM),
                },
                {
                  label: 'Business',
                  value: String(MV4UserProductType.BUSINESS),
                },
                {
                  label: 'Commercial',
                  value: String(MV4UserProductType.COMMERCIAL),
                },
                {
                  label: 'Developer',
                  value: String(MV4UserProductType.DEVELOPER),
                },
              ]}
              maxDropdownHeight={200}
            />
            <Select
              label="限制权限"
              allowDeselect={false}
              key={subProductForm.key('needPermissionStr')}
              {...subProductForm.getInputProps('needPermissionStr')}
              data={[
                {
                  label: '用户',
                  value: String(MV4UserPermissionLevel.USER),
                },
                {
                  label: '授权经销商',
                  value: String(MV4UserPermissionLevel.DEALER),
                },
                {
                  label: '管理员',
                  value: String(MV4UserPermissionLevel.ADMIN),
                },
                {
                  label: '所有者',
                  value: String(MV4UserPermissionLevel.OWNER),
                },
              ]}
              maxDropdownHeight={200}
            />
            <Checkbox
              key={subProductForm.key('showForAnotherPlans')}
              checked={subProductForm.getValues().showForAnotherPlans}
              {...subProductForm.getInputProps('showForAnotherPlans')}
              label="显示给未达到该计划用户"
            />
            <Checkbox
              key={subProductForm.key('canPayDirectly')}
              checked={subProductForm.getValues().canPayDirectly}
              {...subProductForm.getInputProps('canPayDirectly')}
              label="可直接通过支付购买"
            />
            <Checkbox
              key={subProductForm.key('canUseFBCoins')}
              checked={subProductForm.getValues().canUseFBCoins}
              {...subProductForm.getInputProps('canUseFBCoins')}
              label="可使用FBCoin"
            />
            <Checkbox
              key={subProductForm.key('canUseBalance')}
              checked={subProductForm.getValues().canUseBalance}
              {...subProductForm.getInputProps('canUseBalance')}
              label="可使用余额"
            />
          </Stack>
          <Group justify="flex-end" mt="md">
            <Button type="submit">{isCreate ? '创建' : '修改'}</Button>
          </Group>
        </form>
      </Modal>
      <PageTitle>商品管理</PageTitle>
      <Stack gap={'sm'}>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>分区列表</Title>
            <Group>
              <Button
                size="sm"
                onClick={() => onClickCreateOrChangeCategory(true, -1)}
              >
                创建
              </Button>
              <Button size="sm" bg="teal" onClick={refreshCategoryList}>
                刷新
              </Button>
            </Group>
            <Divider my="xs" />
            <Box>
              <LoadingOverlay
                visible={showCategoryLoading}
                overlayProps={{ radius: 'sm', blur: 2 }}
              />
              <Table highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>名称</Table.Th>
                    <Table.Th>可见性-计划</Table.Th>
                    <Table.Th>可见性-权限</Table.Th>
                    <Table.Th>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {categoryList.map((item, i) => (
                    <Table.Tr key={item.categoryId}>
                      <Table.Td>{item.name}</Table.Td>
                      <Table.Td>{productTypeToString(item.needPlan)}</Table.Td>
                      <Table.Td>
                        {permissionToString(item.needPermission)}
                      </Table.Td>
                      <Table.Td>
                        <Group>
                          <Button
                            bg="gray"
                            size="xs"
                            onClick={() => {
                              modals.open({
                                title: <Text>分区 {item.name}</Text>,
                                children: (
                                  <Text>分区ID：{item.categoryId}</Text>
                                ),
                              });
                            }}
                          >
                            查看
                          </Button>
                          <Button
                            size="xs"
                            onClick={() =>
                              onClickCreateOrChangeCategory(false, i)
                            }
                          >
                            编辑
                          </Button>
                          <Button
                            size="xs"
                            bg="red"
                            onClick={() => deleteCategory(item)}
                          >
                            删除
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Stack>
        </MV4Card>
        <MV4Card>
          <Stack gap={'md'}>
            <Title order={4}>商品列表</Title>
            <Group>
              <Button
                size="sm"
                onClick={() => onClickCreateOrChangeProduct(true, -1)}
              >
                创建
              </Button>
              <Button size="sm" bg="teal" onClick={refreshProductList}>
                刷新
              </Button>
            </Group>
            <Divider my="xs" />
            <Box>
              <LoadingOverlay
                visible={showProductLoading}
                overlayProps={{ radius: 'sm', blur: 2 }}
              />

              <Table highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>名称</Table.Th>
                    <Table.Th>分区</Table.Th>
                    <Table.Th>价格</Table.Th>
                    <Table.Th>提供物品</Table.Th>
                    <Table.Th>数量</Table.Th>
                    <Table.Th>上架状态</Table.Th>
                    <Table.Th>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {productList.map((item, i) => (
                    <Table.Tr key={item.productId}>
                      <Table.Td>{item.name}</Table.Td>
                      <Table.Td>{getProductCategoryName(item)}</Table.Td>
                      <Table.Td>{item.price}</Table.Td>
                      <Table.Td>{item.itemId}</Table.Td>
                      <Table.Td>{item.itemAmount}</Table.Td>
                      <Table.Td>{item.canBuy ? '上架' : '未上架'}</Table.Td>
                      <Table.Td>
                        <Group>
                          <Button
                            bg="gray"
                            size="xs"
                            onClick={() => {
                              modals.open({
                                title: <Text>商品 {item.name}</Text>,
                                children: (
                                  <Stack>
                                    <Text>商品ID：{item.productId}</Text>
                                    <Text>价格：{item.price}</Text>
                                    <Text>折扣力度：{item.discount}%</Text>
                                    <Text>
                                      上架状态：
                                      {item.canBuy ? '上架' : '未上架'}
                                    </Text>
                                    <Text>
                                      分区：{getProductCategoryName(item)}
                                    </Text>
                                    <Text size="sm">介绍：</Text>
                                    <Text
                                      size="sm"
                                      dangerouslySetInnerHTML={{
                                        __html: item.desc.replaceAll(
                                          '\n',
                                          '<br/>',
                                        ),
                                      }}
                                    />
                                    <Divider my="xs" />
                                    <Title order={5}>实际提供商品</Title>
                                    <Text>提供的物品：{item.itemId}</Text>
                                    <Text>提供的数量：{item.itemAmount}</Text>
                                    <Divider my="xs" />
                                    <Title order={5}>附加限制条件</Title>
                                    <Text>
                                      限制计划：
                                      {productTypeToString(item.needPlan)}
                                    </Text>
                                    <Text>
                                      是否显示给未达到该计划用户：
                                      {item.showForAnotherPlans ? '是' : '否'}
                                    </Text>
                                    <Text>
                                      限制权限：
                                      {permissionToString(item.needPermission)}
                                    </Text>
                                    <Text>
                                      允许直接支付购买：
                                      {item.canPayDirectly ? '是' : '否'}
                                    </Text>
                                    <Text>
                                      可使用FBCoin：
                                      {item.canUseFBCoins ? '是' : '否'}
                                    </Text>
                                    <Text>
                                      可使用余额：
                                      {item.canUseBalance ? '是' : '否'}
                                    </Text>
                                  </Stack>
                                ),
                              });
                            }}
                          >
                            查看
                          </Button>
                          <Button
                            size="xs"
                            bg={item.canBuy ? 'pink' : 'orange'}
                            onClick={() =>
                              setProductCanBuy(item.productId, !item.canBuy)
                            }
                          >
                            {item.canBuy ? '下架' : '上架'}
                          </Button>
                          <Button
                            size="xs"
                            onClick={() =>
                              onClickCreateOrChangeProduct(false, i)
                            }
                          >
                            编辑
                          </Button>
                          <Button
                            size="xs"
                            bg="red"
                            onClick={() => deleteProduct(item)}
                          >
                            删除
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Stack>
        </MV4Card>
      </Stack>
    </Stack>
  );
}
