import request from '@/utils/request'

// 签到是否开启
export function getSignState() {
	return request.get(`dailysignin/isSignInOpen`)
}
//获取签到规则
export function getSignInAwardRules() { 
	return request.get(`dailysignin/rewardRules`)
}
//获取累加之和
export function getAccumulationSum(data : AnyObject) { 
	return request.get(`dailysignin/sum`,data)
}
//是否已签到
export function checkSignInStatusApi(){
	return request.get(`/dailysignin/checkSignInStatus`)
}
//签到
export function signinApi() { 
	return request.post(`dailysignin/signIn`)
}