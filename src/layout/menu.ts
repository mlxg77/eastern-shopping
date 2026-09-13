// 后台侧边菜单配置：新增/调整菜单只改这里，模板不用动
export interface MenuLeaf {
  title: string
  path: string
}

export interface MenuNode {
  title: string
  icon?: string // Element 图标组件名（main.ts 已全局注册）
  path?: string // 无子菜单时必填
  children?: MenuLeaf[]
}

export const menuConfig: MenuNode[] = [
  { title: '首页', icon: 'HomeFilled', path: '/' },
  {
    title: '商品管理',
    icon: 'Goods',
    children: [
      { title: '品牌管理', path: '/product/trademark' },
      { title: '平台属性', path: '/product/attr' },
      { title: 'SPU 管理', path: '/product/spu' },
      { title: 'SKU 管理', path: '/product/sku' },
    ],
  },
  {
    title: '权限管理',
    icon: 'Lock',
    children: [
      { title: '用户管理', path: '/acl/user' },
      { title: '角色管理', path: '/acl/role' },
      { title: '菜单管理', path: '/acl/permission' },
    ],
  },
]