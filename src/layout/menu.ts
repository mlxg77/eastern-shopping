// 后台侧边菜单配置：新增/调整菜单只改这里，模板不用动
// 每个节点带 code 字段：与后端 info.routes 权限码对齐，用于动态过滤

export interface MenuLeaf {
  title: string
  path: string
  code: string // 权限码（与 info.routes 对齐）
}

export interface MenuNode {
  title: string
  icon?: string
  path?: string
  code?: string // 父菜单也有 code（如 "Product"）
  children?: MenuLeaf[]
}

export const menuConfig: MenuNode[] = [
  { title: '首页', icon: 'HomeFilled', path: '/' },
  {
    title: '商品管理',
    icon: 'Goods',
    path: '/product',
    code: 'Product',
    children: [
      { title: '品牌管理', path: '/product/trademark', code: 'Trademark' },
      { title: '平台属性', path: '/product/attr', code: 'Attr' },
      { title: 'SPU 管理', path: '/product/spu', code: 'Spu' },
      { title: 'SKU 管理', path: '/product/sku', code: 'Sku' },
    ],
  },
  {
    title: '权限管理',
    icon: 'Lock',
    path: '/acl',
    code: 'Acl',
    children: [
      { title: '用户管理', path: '/acl/user', code: 'User' },
      { title: '角色管理', path: '/acl/role', code: 'Role' },
      { title: '菜单管理', path: '/acl/menu', code: 'Permission' },
    ],
  },
  // 订单 / 客户 / 优惠等菜单暂只配静态占位，code 对齐后端菜单树
  { title: '订单管理', icon: 'Tickets', path: '/order', code: 'Order', children: [
    { title: '订单列表', path: '/order/list', code: 'OrderList' },
    { title: '退单管理', path: '/order/refund', code: 'Refund' },
  ]},
  { title: '客户管理', icon: 'User', path: '/client', code: 'ClientUser', children: [
    { title: '客户列表', path: '/client/user', code: 'UserList' },
  ]},
  { title: '优惠管理', icon: 'Present', path: '/discount', code: 'Discount', children: [
    { title: '优惠活动', path: '/discount/activity', code: 'Activity' },
    { title: '优惠券', path: '/discount/coupon', code: 'Coupon' },
  ]},
]