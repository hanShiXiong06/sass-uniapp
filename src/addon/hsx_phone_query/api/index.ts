import request from "@/utils/request";

/***************************************************** hello world ****************************************************/
export function getHelloWorld() {
  return request.get(`hsx_phone_query/hello_world`);
}
// category

export function getCategoryTree() {
  return request.get(`hsx_phone_query/category`);
}

export function getQueryModelList(params: any) {
  return request.get(`hsx_phone_query/query`, params);
}

//
export function getModelList(params: any) {
  return request.get("hsx_phone_query/list", params);
}

// 获取单条详情
export function getModelDetail(id: number) {
  return request.get(`hsx_phone_query/detail/` + id);
}

// 获取水印配置
export function getWatermark() {
  return request.get("hsx_phone_query/config/watermark");
}
