import request from '@/utils/request'

// 接口返回数据的类型：和后端给的字段一一对应
export interface Hitokoto {
  hitokoto: string // 句子正文
  from: string // 出处
}

// 一言：随机返回一条句子
// 两个泛型都写 Hitokoto：第一个是响应数据类型，第二个是"最终返回值"类型——
// 因为响应拦截器已经把结果拆包成 data，所以最终拿到的就是 Hitokoto 本身
export function getHitokoto() {
  return request.get<Hitokoto, Hitokoto>('/')
}
