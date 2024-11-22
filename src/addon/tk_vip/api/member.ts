import request from '@/utils/request'

/**
 * 获取支持等级
 */
export function getMemberLevel() {
	return request.get(`tk_vip/member/level`);
}
export function getVipInfo() {
	return request.get(`tk_vip/vip/levelinfo`);
}