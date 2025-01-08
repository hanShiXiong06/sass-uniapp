import request from "@/utils/request";

// 获取回收订单列表
export function getOrderList(data: any) {
  return request.get("phone_shop_price/recycle_order/lists", data);
}

// 获取回收订单详情
export function getOrderDetail(id: number) {
  return request.get(`phone_shop_price/recycle_order/detail/${id}`);
}

// 添加回收订单
export function createOrder(data: any) {
  return request.post("phone_shop_price/recycle_order/add", data);
}

// getOrderStatusCount 获取 订单菜单及统计
export function getOrderStatusCount() {
  return request.get("phone_shop_price/recycle_order/status_count");
}

// 定义接口类型
export interface RecycleOrder {
  id: number;
  order_no: string;
  member_id: number;
  site_id: number;
  count: number;
  express_id: string;
  send_username: string;
  telphone: string;
  pay_type: "微信" | "支付宝" | "银行卡";
  account: string;
  delivery_type: "mail" | "self";
  return_type: "mail" | "self";
  qrcode_image: string;
  return_address: string;
  status: string;
  create_at: number;
  update_at: number;
  over_at: number;
  comment: string;
  close_express_id: string;
  devices?: RecycleOrderDevice[];
  device_stats?: {
    total: number;
    pending: number;
    checking: number;
    checked: number;
    completed: number;
    returned: number;
    total_amount: number;
  };
}

export interface RecycleOrderDevice {
  id: number;
  order_id: number;
  imei: string;
  model: string;
  status: number;
  check_status: number;
  check_result: string;
  initial_price: number;
  final_price: number;
  price_remark: string;
  create_at: number;
  update_at: number;
  check_at: number;
}

// 获取订单状态列表
export function getOrderStatus() {
  return request.get("phone_shop_price/recycle_order/status_count");
}
// 获取设备状态列表
export function getDeviceStatus() {
  return request.get("phone_shop_price/recycle_order/device_status/list");
}

// 更新订单状态
export function updateOrderStatus(data: {
  order_id: number | string;
  status: string;
  action:
    | "cancel"
    | "reject"
    | "confirm"
    | "complete"
    | "delete"
    | "update_delivery"
    | "update_express";
  delivery_type?: "mail" | "self";
  express_id?: string;
}) {
  return request.put(
    "phone_shop_price/recycle_order/update_status/" + data.order_id,
    data
  );
}
// 确认设备
export function deviceConfirm(id: number) {
  return request.put(`phone_shop_price/recycle_order/device_confirm/${id}`);
}
// 取消设备
export function deviceCancel(id: number) {
  return request.put(`phone_shop_price/recycle_order/device_cancel/${id}`);
}
