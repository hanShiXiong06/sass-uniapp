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
export function getModelList() {
  return request.get(`hsx_phone_query/list`);
}

// 获取单条详情
export function getModelDetail(id: number) {
  return request.get(`hsx_phone_query/detail/` + id);
}
