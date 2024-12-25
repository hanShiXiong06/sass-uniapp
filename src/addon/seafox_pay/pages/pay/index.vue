<template>
	<text class="text-[20px]"></text>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { getPayInfo } from '@/app/api/pay'
	import { redirect } from '@/utils/common'
	import wechat from '@/utils/wechat'
	import { getToken, isWeixinBrowser, getSiteId, currRoute } from '@/utils/common'

	// #ifdef H5
	if (isWeixinBrowser()) wechat.init();
	// #endif

	const payInfo = ref<any>({
		trade_type: '',
		trade_id: ''
	})

	onLoad((query : any) => {
		console.log(query, query.paySign, 'query');
		payInfo.value.trade_type = query.trade_type || ''
		payInfo.value.trade_id = query.trade_id

		/* {
		  "appId": "wxc5ef0bb03ad789eb",
		  "timeStamp": "1727225547",
		  "nonceStr": "0462f397d80742158ca586fe9874a3dc",
		  "signType": "RSA",
		  "paySign": "vKFneX8GXP40nF7N58nLFnfyvm45e+7pyhiKf6EwFUXZRYFy0N2kLMeyyb9t+AgMuEdsJWIYOAJNZXzfiEACThLsSyLkpbs5YorWH97rxM8HItNMfd4WPjHhrhhdR+kcb55SI/yJq0Uqt0ix/CQwPWgIKTNAhPaIB2qjycT/GgkmG3SZZljIyCcbYkaHJlslMGcKfpXqHgzJlac2ZNQ774ppBpU12kcUR3TP6ExtyHUoBQnuO7tRnyZowo2W4fqMgLL0CsB+aaqnYPebmdrNULT8cPRB5oH35I6EJMIWNqTLWCqiT3SX+DObIDVci4j6V14AdRd8biNNeb/vHNcuCA==",
		  "trade_id": 19,
		  "trade_type": "recharge",
		  "package_key": "prepay_id",
		  "package_value": "wx25085227300956e6d781d1113fe5100001"
		} */

		// query.timestamp = query.timeStamp
		// delete query.timeStamp
		// query.package='prepay_id='+query.package_value
		// console.log(query)
		// wechat.pay({
		// 	...query,
		// 	success: () => {
		//         toPayResult()
		// 	},
		// 	cancel: () => {
		// 		loading.value = false
		// 	}
		// })
		// return;




		// #ifdef H5
		if (isWeixinBrowser()) {
			query.timestamp = query.timeStamp
			delete query.timeStamp
			query.package = 'prepay_id=' + query.package_value
			console.log(query)
			wechat.pay({
				...query,
				success: () => {
					toPayResult()
				},
				cancel: () => {
					loading.value = false
				}
			})
		} else {
			uni.setStorageSync('paymenting', { trade_type: payInfo.value?.trade_type, trade_id: payInfo.value?.trade_id })
			location.href = query.h5_url
		}
		// #endif

		// #ifdef MP-WEIXIN
		wx.requestPayment({
			timeStamp: query.timeStamp,
			nonceStr: query.nonceStr,
			package: query.package_key + '=' + query.package_value,
			signType: query.signType,
			paySign: query.paySign + '==',
			success: () => {
				// toPayResult()
			},
			fail: (err) => {
				console.log(err, 'err');
				// toPayResult()
			},
			complete: () => {
				toPayResult()
			}
		})
		// #endif

		// #ifdef MP-ALIPAY
		my.tradePay({
			tradeNO: query.tradeNO,
			success: (payRes) => {
				if (payRes.resultCode == '9000') {
					toPayResult()
				}
			},
			fail: (err) => { }
		})
		// #endif
	})

	/**
		 * 检测是否是支付后返回
		 */
	uni.$on('checkIsReturnAfterPayment', () => {
		const data = uni.getStorageSync('paymenting')
		if (uni.getStorageSync('paymenting')) {
			redirect({
				url: '/app/pages/pay/result',
				param: {
					trade_type: data.trade_type,
					trade_id: data.trade_id
				},
				mode: 'redirectTo',
				success() {
					uni.removeStorageSync('paymenting')
				}
			})
		}
	})
	const repeat = ref(false)
	const open = (tradeType : string, tradeId : number, payReturn : string = '') => {
		if (repeat.value) return
		repeat.value = true
		// 设置支付后跳转页面
		uni.setStorageSync('payReturn', encodeURIComponent(payReturn))

		getPayInfo(tradeType, tradeId)
			.then((res : any) => {
				let { data } = res
				payInfo.value = data

				if (uni.$u.test.isEmpty(data)) {
					uni.showToast({ title: t('pay.notObtainedInfo'), icon: 'none' })
					return
				}
				if (data.money == 0) {
					toPayResult()
					return
				}
				type.value = data.pay_type_list[0] ? data.pay_type_list[0].key : ''
				show.value = true
				repeat.value = false

			})
			.catch(() => {
				repeat.value = false
			})
	}

	const toPayResult = () => {
		redirect({ url: '/app/pages/pay/result', param: { trade_type: payInfo.value?.trade_type, trade_id: payInfo.value?.trade_id }, mode: 'redirectTo' })
	}

	const emits = defineEmits(['close'])

	const handleClose = () => {
		uni.removeStorageSync('paymenting')
		show.value = false
		// emits('close')
		redirect({ url: '/app/pages/pay/result', param: { trade_type: payInfo.value?.trade_type, trade_id: payInfo.value?.trade_id }, mode: 'redirectTo' })
	}

	defineExpose({
		open
	})
</script>
<style lang="scss" scoped>

</style>