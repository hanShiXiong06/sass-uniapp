import request from "@/utils/request";

// 发送当前订单的回收信息
export function sendOrderInfo(data: any) {
  return request.post("recycle_price/phone_shop_recycle_order", data);
}

export function getOrderList(data: any) {
  return request.get("recycle_price/phone_shop_recycle_order/list", data);
}
// 获取状态
export function getStatus(data: any) {
  return request.get("recycle_price/order/status", data);
}
