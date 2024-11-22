
import request from '@/utils/request'

/***************************************************** hello world ****************************************************/
export function getHelloWorld() {
    return request.get(`hsx_yinsheng_pay/hello_world`)
}

