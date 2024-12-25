import request from '@/utils/request'
/**
 * 买单信息
 */
export function getMaidanInfo(data: AnyObject) {
    return request.get('seafox_pay/maidan/info', data, {showErrorMessage: true})
}
/**
 * 发起买单
 */
export function createMaidan(data: AnyObject) {
    return request.post('seafox_pay/maidan/order', data, {showErrorMessage: true})
}

/**
 * 买单记录列表
 */
export function getMaidanList(data: AnyObject) {
    return request.get('seafox_pay/maidan/order', data, {showErrorMessage: true})
}

/**
 * 买单记录详情
 */
export function getMaidanDetail(id: number) {
    return request.get(`seafox_pay/maidan/order/${id}`, {}, {showErrorMessage: true})
}