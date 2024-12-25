
import request from '@/utils/request'

/***************************************************** CPS联盟 ****************************************************/
/**
 * 活动信息
 * @param {Record<string, any>} params 
 * @return 
 */
export function getActInfo(params : Record<string, any>) {
	return request.get(`tk_cps/bwc/actinfo`, params)
}
/**
 * 活动列表
 * @param {Record<string, any>} params 
 * @return 
 */
export function getActList(params : Record<string, any>) {
	return request.get(`tk_cps/bwc/actlist`, params)
}
/**
 * 新版小程序
 * @param {Record<string, any>} params 
 * @return 
 */
export function getNewActList(params : Record<string, any>) {
	return request.get(`tk_cps/bwc/newactlist`, params)
}
/**
 * 活动报名
 * @param {Record<string, any>} params 
 * @return 
 */
export function signUp(params : Record<string, any>) {
	return request.post(`tk_cps/bwc/signup`, params)
}

/**
 * 取消报名
 * @param {Record<string, any>} params 
 * @return 
 */
export function cancelEvent(params : Record<string, any>) {
	return request.post(`tk_cps/bwc/cancelevent`, params)
}
/**
 * 活动列表
 * @param {Record<string, any>} params 
 * @return 
 */
export function orderList(params : Record<string, any>) {
	return request.get(`tk_cps/bwc/list`, params)
}
/**
 * 获取订单状态
 * @return 
 */
export function orderStatus() {
	return request.get(`tk_cps/bwc/orderstatus`, { showSuccessMessage: true, showErrorMessage: true })
}
export function getOrderInfo(id) {
	return request.get(`tk_cps/bwc/orderinfo/${id}`)
}
export function checkFenxiao(params : Record<string, any>) {
	return request.post(`tk_cps/bwc/checkfenxiao`, params)
}