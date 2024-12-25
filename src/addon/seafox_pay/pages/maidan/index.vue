<template>

	<view style="position:relative;z-index:3">
		<view style="display: flex;flex-direction: column;margin: 100rpx 0 50rpx;align-items: center;">
			<image :src="info.logo||''" style="border-radius: 50%;width: 150rpx;height: 150rpx;" mode="aspectFill">
			</image>
			<view style="margin-top: 20rpx;font-size: 16px;">{{info.name||''}}</view>
		</view>
		
		<!-- <view style="background: #fff;margin: 50rpx 3%;padding: 20rpx 3%;flex:1;font-size: 20px;" @click="openKeyboard()">
			<span style="margin-right: 20rpx;">￥</span>
			<span v-if="amount" style="font-weight: bold;">{{amount}}</span>
			<span v-else style="color: #999;">输入金额</span>
		</view> -->
		
		<fx-amountInput  :confirmText="'支付'" placeholder='请输入金额' :fontSize="30" :isFilter="true" @confirm="topay" @change="changemoney"></fx-amountInput>
		
		<navigator url="/addon/seafox_pay/pages/maidan/order" style="text-align: center;margin-top:150rpx;color:#1677ff;font-size: 14px;	">买单记录</navigator>
	</view>
	<!-- <button @click="openKeyboard" v-if="!loading&&!showKeyboard">支付</button> -->
	<!-- <tn-keyboard mode="digit" z-index="0" :vibrate="false" :overlay-closeable="false" v-model="amount" v-model:show="showKeyboard" @confirm="topay" /> -->
	
  
	<pay ref="payRef" @close="payClose" />
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { getPayInfo } from '@/app/api/pay'
	import { redirect } from '@/utils/common'
	import { getMaidanInfo,createMaidan } from '@/addon/seafox_pay/api/maidan'
import fxAmountInput from '@/addon/seafox_pay/components/fx-amountInput/fx-amountInput.vue';
	const payInfo = ref<any>({
		trade_type: '',
		trade_id: ''
	})
	const payRef = ref()
	const merchant_id = ref('')
	const info = ref({
		logo:'',
		name:''
	})
	

	onLoad((query : any) => {
		console.log(query, query.merchant_id, 'query');
		merchant_id.value = query.merchant_id || 1;
		amount.value = query.amount || '';
		getinfo();
	})
	
	const getinfo = () => {
		getMaidanInfo({merchant_id:merchant_id.value}).then((res:any) => {
			info.value = res.data
		}).catch(() => {
		})
	}
	
	
	const amount = ref('')
	const loading = ref(true)
	const showKeyboard = ref(false)
	setTimeout(function () {
		loading.value = false;
		showKeyboard.value = true
	}, 600)


	const openKeyboard = () => {
		showKeyboard.value = true
	}
	const changemoney=(e)=>{
		console.log(e)
		amount.value = e+''
	}
	watch(amount, (newValue, oldValue) => {
		var value = newValue;
		if (Number(value) > 1e8) {
			amount.value = value.slice(0, 8);
			return;
		}
		if (value.slice(0, 1) == ".") {
			value = "";
		}
		value = value.replace(/\.{2,}/g, ".");
		//只保留第一个. 清除多余的
		value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
		value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3");
		//只能输入两个小数
		if (value.indexOf(".") < 0 && value != "") {
			//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
			// value = parseFloat(value);
		}
		amount.value = value;
	});

	let orderId = 0;
	const topay = () => {
		showKeyboard.value = true
		console.log(amount.value);
		if (!verify()) return
		createMaidan({money: amount.value,merchant_id:merchant_id.value}).then((res:any) => {
			orderId = res.order_id
			payRef.value?.open(res.data.trade_type, res.data.trade_id,'/addon/seafox_pay/pages/maidan/index')
		}).catch(() => {
		})
	}

	/**
	 * 下单校验
	 */
	const verify = () => {
		const data = amount.value
		let verify = true
		if (!Number(amount.value) || Number(amount.value) < 0.01) {
			uni.showToast({ title: '请输入金额', icon: 'none' })
			return false
		}

		return verify
	}

	/**
	 * 支付弹窗关闭
	 */
	const payClose = (res) => {
		console.log(res);
		// redirect({ url: '/addon/seafox_pay/pages/maidan/index', param: {  }, mode: 'redirectTo' })
	}
</script>
<style>
	page {
		background: #f6f7fb;
	}

	.tn-keyboard__normal-container .normal-item.confirm::v-deep{
		background: #0068ff!important;
		color: #fff!important;
	}
	/deep/.tn-keyboard__normal-container .normal-item.confirm.data-v-bfb25328{
		background-color: #0068ff!important;
		color: #fff!important;
	}

	button {
		background: #0068ff;
		color: #fff;
		margin: 50rpx 3%;
	}
</style>
<style lang="scss" scoped>

</style>