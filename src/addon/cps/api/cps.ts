import request from '@/utils/request'

/**
 * 获取cps联盟的链接
 */

 export function getCpsLink(data : AnyObject) {
     return request.post(`cps/index`, data)
    //  return request.get(`cps/index/${type}/${channel}`)
 }
 