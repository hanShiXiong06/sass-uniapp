<template>
	<view class="tk-card">
		<u-row gutter="12" class="flex item-center">
			<u-col span="2">
				<view class="">
					<text class="tag">寄</text>
				</view>

				<view class="mt-[4rpx] mb-[4rpx]">
					<u-line color="#2979ff" direction="col" length="98rpx" border-style="dotted"></u-line>
				</view>
				<view class="">
					<text class="tag" style="background: #2979ff;color: #ffffff;">收</text>
				</view>
			</u-col>
			<u-col span="10">
				<view class="fb flex item-center">
					<view class="w-[380rpx]">
						<text v-if="form.startAddress==[]" class="font-bold">从哪里寄？</text>
						<text v-if="form.startAddress==[]" class="tk-sltext">请选择寄件地址</text>

						<text v-if="form.startAddress"
							class="font-bold tk-sltext text-sm"> {{ form.startAddress.name }}  <text class="font-light text-xs"> {{ form.startAddress.mobile }} </text> </text>
						<text v-if="form.startAddress"
							class=" text-xs">{{form.startAddress.address}}{{form.startAddress.full_address}}</text>
					</view>
					<view class="">
						<text class="bt text-sm" @click="toSelectAddress('startaddress')">地址簿</text>
					</view>

				</view>
				<view class="fb fb flex item-center mt-[28rpx]">
					<view class="w-[380rpx]">
						<view v-if="form.endAddress==[]" class="font-bold">收件人信息？</view>
						<text v-if="form.endAddress==[]" class="tk-sltext">请选择收件地址</text>
            <text v-if="form.endAddress"
                  class="font-bold tk-sltext text-sm"> {{ form.endAddress.name }}  <text class="font-light text-xs"> {{ form.endAddress.mobile }} </text> </text>
            <text v-if="form.endAddress"
                  class=" text-xs">{{form.endAddress.address}}{{form.endAddress.full_address}}</text>
          </view>
					<view class="">
						<text class="bt text-sm" @click="toSelectAddress('endaddress')">地址簿</text>
					</view>

				</view>
			</u-col>
		</u-row>
		<view class="text-sm mt-2 text-[#686868]">
			请认真核实地址,填写实际重量再下单！
		</view>
	</view>
	<view class="tk-card">
		<view class="fb">
			<view class="fl items-center">
				<view class="text-xs tk-tag mr-1">必填</view>
				<view class="mr-2">物品信息</view>
				<view class="font-weight text-[#272822] text-sm">{{form.goods}},{{form.weight}}kg</view>
			</view>
			<u-icon size="22" name="edit-pen" @click="writeGood()"></u-icon>
		</view>
	</view>
	<view class="pl-2 pr-2">
		<u-alert :title="tip.title" type="info" :closable="tip.closable" :description="tip.description"></u-alert>
	</view>
	<view v-if="preData"
        class="tk-card mt-[40rpx] overflow-y-auto "
  >
		<block v-for="(item,index) in preData" :key=index>

			<view class="fb p-[12rpx]"
            :class="currentIndex == index ? 'bg-red-200 text-red-500 rounded ':''"
            @click="selectPre(index)" v-if="item.onlinePay=='Y'">
				<view class="fl">
					<image style="width: 68rpx;height: 68rpx;border-radius: 8rpx;" :src="img(item.logo)" mode="">
					</image>
					<view class="ml-[18rpx] w-[340rpx]">
						<view class="font-weight text-xs w-[440rpx]">{{item.channelName}}</view>
						<view class="text-xs text-[#272822]">限重:{{item.limitWeight}}kg</view>
					</view>
				</view>
				<view class="font-weight text-sm">{{item.showPrice}}元
				</view>
			</view>
		</block>
	</view>
	<view class="tk-card" v-if="jhkdservice">

		<checkbox-group class="uni-list" @change="checkboxChange">
			<label class="text-xs fl items-center uni-list-cell uni-list-cell-pd">
				<view>
					<checkbox color="#3c4cde" style="transform:scale(0.6)" value="true" :checked="isOpenAgreement">
					</checkbox>
				</view>
				<view @click="redirect({url:'/addon/tk_jhkd/pages/agreement?type=jhkdyesgoods'})">
					阅读并同意《{{jhkdservice.title?jhkdservice.title:'寄件服务协议'}}》</view>
			</label>
		</checkbox-group>
	</view>
	<view class="mt-[380rpx] mb-[260rpx] flex items-center"></view>
	<!-- 物品信息弹出框 -->
	<u-popup class="safe-area-inset-bottom" :round="10" @close="close" closeable="true" :show="goodshow" mode="bottom"
		width="640" border-radius="12">
		<view class="tk-card h-[760rpx] overflow-y-auto">
			<view class="flex items-center">
				<view class="senddetail">
					物品名称
				</view>
				<u-input clearable="true" border="bottom" class="mt-[8rpx] text-sm" v-model="form.goods"
					placeholder="如:生活用品,点击标签快速填写" />

			</view>
			<view class="fl flex-wrap mt-2">
				<block v-for="(item,index) in goods" key=index>
					<view class="mt-1 mr-1">
						<u-tag borderColor="#444444" color="#1d1d1d" :text="item" type="success" plain
							@click="goodswrite(index)"></u-tag>
					</view>

				</block>
			</view>
			<view class="font-bold text-xs mt-2"
				@click="redirect({url:'/addon/tk_jhkd/pages/agreement?type=jhkdyesgoods'})">
				《违禁品查询》</view>
			<view class="flex items-center mt-[24rpx]">
				<view class="senddetail">
					物品重量
				</view>
				<u-number-box button-size="24" color="#0000ff" bgColor="#e6e6e6" iconStyle="color: #0000ff" integer
					:min="form.customerType=='kd'?1:30" :max="10000" class="text-sm"
					v-model="form.weight"></u-number-box>
				<text class="ml-4 text-[#a3a3a3]">kg</text>
			</view>
			<view class="flex items-center mt-[24rpx]">
				<view class="senddetail">
					包裹数量
				</view>
				<u-number-box button-size="24" color="#0000ff" bgColor="#e6e6e6" iconStyle="color: #0000ff" integer
					:min="1" :max="100" class="text-sm" v-model="form.packageCount"></u-number-box>
				<text class="ml-4 text-[#a3a3a3]">个</text>
			</view>
			<view class="flex items-center mt-[24rpx]">
				<view class="senddetail">
					物品体积
				</view>
				<view class="w-48px">
					<u-input border="bottom" maxlength="3" v-model="form.vloumLong"></u-input>
				</view>
				<text class="text-[#a3a3a3] mr-[8rpx]">x</text>
				<view class="w-48px">
					<u-input border="bottom" maxlength="3" v-model="form.vloumWidth"></u-input>
				</view>
				<text class="text-[#a3a3a3] mr-[8rpx]">x</text>
				<view class="w-48px">
					<u-input border="bottom" maxlength="3" v-model="form.vloumHeight"></u-input>
				</view>
				<text class="ml-4 text-[#a3a3a3]">单位：cm</text>
			</view>
			<view class="flex items-center mt-[24rpx]">
				<view class="senddetail">
					保价金额
				</view>
				<u-input placeholder="不保价可不填" type="number" v-model="form.guaranteeValueAmount"></u-input>

				<text class="ml-4 text-[#a3a3a3]">元</text>
			</view>
			<view class="mt-4 text-sm text-[#a3a3a3]">订单备注</view>
			<u-input class="mt-[14px]" v-model="form.remark" placeholder="小哥辛苦了!"></u-input>
		</view>
		<view class="pl-2 pr-2">
			<u-alert :title="atip.title" type="warning" :closable="atip.closable"
				:description="atip.description"></u-alert>
		</view>
		<u-loading-icon class="mt-4" duration="1000" mode="circle" timing-function="linear" color="#1984f7"
			v-if="bjshow==true" :vertical="true"></u-loading-icon>
		<view v-if="bjshow==false" class="tk-card butto text-xl" @click="closeShow()">获取报价</view>
		<view v-if="bjshow==true" class="tk-card butto text-xl" @click=" ">正在计算</view>

	</u-popup>
	<view class="mt-[98rpx]"></view>

	<view class="b-tabbar safe-area-inset-bottom">
		<view class="b-tabbar-back fb items-center p-2">
			<view class="">
				<view class="text-sm tk-sltext w-[400rpx]">快递：{{selectData?selectData.channelName:'请选择快递'}}</view>
				<view class="text-sm font-weight">快递费：{{selectData?selectData.showPrice:'请先选择快递'}}</view>
			</view>

			<text class="tt-bbut text-center" @click="submitOrder()">立即下单</text>
		</view>
		<u-safe-bottom></u-safe-bottom>
	</view>
	<button @click="shareEvent()" class="fixed bottom-48 right-4 z-50 rounded-full p-2 text-white hover:bg-blue-700">

		<u-icon name="share" color="#000000" size="24"></u-icon>
	</button>
	<share-poster ref="sharePosterRef" posterType="tk_jhkd_poster" :posterId="poster_id" :posterParam="posterParam"
		:copyUrlParam="copyUrlParam" />
	<pay ref="payRef" @close="payLoading = false"></pay>
</template>-
<script setup lang="ts">
	import useDiyStore from '@/app/stores/diy';
	import { ref, reactive, computed } from 'vue'
	import { goto } from '@/addon/tk_jhkd/utils/ts/goto';
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import {
		preOrder, createOrder, getJhkdAddressInfo, getAgreement, checkFenxiao
	} from '@/addon/tk_jhkd/api/tkjhkd'
	import { redirect, img, handleOnloadParams } from '@/utils/common';
	import { getAddressInfo } from '@/app/api/member'
	import { useSubscribeMessage } from '@/hooks/useSubscribeMessage'
	import { useLogin } from '@/hooks/useLogin'
	import useMemberStore from '@/stores/member'
	const memberStore = useMemberStore()
	const userInfo = computed(() => memberStore.info)
	import { getToken, isWeixinBrowser, getSiteId } from '@/utils/common'
	const list = ref([''])
	const startaddress = ref(null)
	const endaddress = ref(null)
	const preData = ref()
	const selectIndex = ref()
	const selectData = ref()
	const payRef = ref(null)
	const payLoading = ref(false)
	const isReadJhkdService = ref(false)
	const isOpenAgreement = ref(true)
	const bjshow = ref(false)
  const currentIndex = ref(null)
	const tip = ref({
		title: '快速下单必读',
		description: '先地址簿添加/编辑地址，选择取/收货地址，填写物品信息，选择渠道下单',
		closable: false
	})
	const goods = ref([
		'普货',
		'文件',
		'美妆用品',
		'数码产品',
		'服装鞋帽',
		'珠宝首饰',
		'零食特产',
		'办公用品'
	])


	/************* 分享海报-start **************/
	let sharePosterRef = ref(null);
	let copyUrlParam = ref('');
	let posterParam = {};
	const poster_id = ref(0)
	// 分享海报链接
	const copyUrlFn = () => {

		if (userInfo.value && userInfo.value.member_id) copyUrlParam.value += '?mid=' + userInfo.value.member_id;
	}
	const shareEvent = () => {

		// 检测是否登录
		if (!userInfo.value) {
			let pid = uni.getStorageSync('pid');
			if (pid && pid > 0) {
				useLogin().setLoginBack({ url: '/addon/tk_jhkd/pages/ordersubmit?mid=' + pid })
				return false
			} else {
				useLogin().setLoginBack({ url: '/addon/tk_jhkd/pages/ordersubmit' })
				return false
			}
		}

		if (userInfo.value && userInfo.value.member_id)
			posterParam.member_id = userInfo.value.member_id;
		copyUrlFn()
		sharePosterRef.value.openShare()
	}
	/************* 分享海报-end **************/



	const goodswrite = (index) => {
		uni.$u.toast(goods.value[index])
		form.goods = goods.value[index]
	}
	const checkboxChange = (e) => {
		if (isOpenAgreement.value == true) {
			isOpenAgreement.value = false
		} else {
			isOpenAgreement.value = true
		}
	}
	const atip = ref({
		title: '填写须知',
		description: '物品名称必须填写，物品重量需按照实际重量填写,超长物品请填写实际尺寸，如需要保价请填写保价金额',
		closable: false
	})
	const form = reactive({
		startAddress: uni.getStorageSync('startAddress'),
		endAddress: uni.getStorageSync('endAddress'),
		customerType: 'kd',//寄件渠道，快递，快运，得物
		goods: '',//托寄物名称
		packageCount: 1,//包裹数量
		weight: 1.00,//单位kg,保留两位
		vloumLong: 10,//cm
		vloumWidth: 10,
		vloumHeight: 10,
		guaranteeValueAmount: null,
		remark: "",
		showPrice: '0',
		payMethod: '',
		delivery_info: [],
		key: '',
		delivery_index: ''
	})
	const close = () => {
		goodshow.value = false
	}
	const goodshow = ref(false)
	const goodstype = ref([
		'0000', '15222'
	])
	const toSelectAddress = (type) => {
		uni.setStorage({
			key: 'selectAddressCallback',
			data: {
				back: '/addon/tk_jhkd/pages/ordersubmit',
				delivery: type,
				value: type
			},
			success() {
				redirect({ url: '/addon/tk_jhkd/pages/address/address', param: { type: 'address' } })
			}
		})
	}
	const addressInfo = async (id) => {
		if (id > 0) {
			const data = await getJhkdAddressInfo(id);
			return data.data;
		}
	};

	const selectAddress = uni.getStorageSync('selectAddressCallback');
	if (selectAddress) {
		// 赋能取件地址
		if (selectAddress.delivery == 'startaddress') {
			addressInfo(selectAddress.address_id)
				.then(data => {
					uni.setStorageSync('startAddress', data)
					form.startAddress = uni.getStorageSync('startAddress')
				})
				.catch(error => {
					console.error(error);
				});
		}
		if (selectAddress.delivery == 'endaddress') {
			addressInfo(selectAddress.address_id)
				.then(data => {
					uni.setStorageSync('endAddress', data)
					form.endAddress = uni.getStorageSync('endAddress')
				})
				.catch(error => {
					console.error(error);
				});
		}
		uni.removeStorage({ key: 'selectAddressCallback' });
	}
	const writeGood = () => {
		if (form.startAddress == []) {
			toSelectAddress('startaddress')
			uni.$u.toast('请填写取件地址')
			return
		}
		if (form.endAddress == []) {
			toSelectAddress('endaddress')
			uni.$u.toast('请填写送件地址')
			return
		}
		useSubscribeMessage().request('tk_jhkd_order_sign')
		goodshow.value = true
		form.delivery_info = []
	}
	const closeShow = async () => {
		if (form.goods == '') {
			uni.$u.toast('请填写物品名称')
			return
		}
		if (form.startAddress == []) {
			toSelectAddress('startaddress')
			uni.$u.toast('请填写取件地址')
			return
		}
		if (form.endAddress == []) {
			toSelectAddress('endaddress')
			uni.$u.toast('请填写送件地址')
			return
		}
		bjshow.value = true
		const data = await preOrder(form)
		form.key = data.data.key
		preData.value = data.data.list
		bjshow.value = false
		goodshow.value = false
		form.delivery_info = []
	}
	const submitOrder = async () => {
		if (form.goods == '') {
			goodshow.value = true
			uni.$u.toast('请填写物品名称')
			return
		}
		if (form.startAddress == []) {
			toSelectAddress('startaddress')
			uni.$u.toast('请填写取件地址')
			return
		}
		if (form.endAddress == []) {
			toSelectAddress('endaddress')
			uni.$u.toast('请填写送件地址')
			return
		}
		if (preData.value == null) {
			uni.$u.toast('请完善信息再获取报价')
			return
		}
		if (selectData.value == null) {
			uni.$u.toast('请选择发货渠道')
			return
		}
		if (isOpenAgreement.value == false) {
			uni.$u.toast('请先阅读并同意协议')
			return
		}

		useSubscribeMessage().request('tk_jhkd_order_pay,tk_jhkd_order_pick,tk_jhkd_order_add')
		const data = await createOrder(form)
		form.delivery_info = []
		selectData.value = null
		preData.value = null
		payLoading.value = true
		payRef.value?.open(data.data.trade_type, data.data.trade_id, '/addon/tk_jhkd/pages/orderlist')
	}
	const selectPre = (e) => {
    currentIndex.value = e
		selectData.value = preData.value[e]
		form.showPrice = selectData.value.showPrice
		form.delivery_info = selectData.value
		form.delivery_index = e
	}
	const jhkdservice = ref()
	const checkServiceAgreement = async () => {
		const data = await getAgreement('jhkdservice')
		jhkdservice.value = data.data
	}
	onLoad((option) => {

		// #ifdef MP-WEIXIN
		// 处理小程序场景值参数
		option = handleOnloadParams(option);
		// #endif
		if (option.mid) {
			uni.setStorageSync('pid', option.mid)

		}

		// 判断是否已登录
		let data = {
			type: ''
		};
		if (!getToken()) {
			const login = useLogin()
			// 第三方平台自动登录
			// #ifdef MP
			login.getAuthCode()
			// #endif
			// #ifdef H5
			if (isWeixinBrowser()) {
				data.query.code ? login.authLogin(data.query.code) : login.getAuthCode('snsapi_userinfo')
			}
			// #endif
		}
		setTimeout(() => {
			if (!userInfo.value) {
				let pid = uni.getStorageSync('pid');
				if (pid && pid > 0) {
					useLogin().setLoginBack({ url: '/addon/tk_jhkd/pages/ordersubmit?mid=' + pid })
					return false
				} else {
					useLogin().setLoginBack({ url: '/addon/tk_jhkd/pages/ordersubmit' })
					return false
				}
			}
		}, 500)
		let pid = uni.getStorageSync('pid');
		if (pid && pid > 0) {
			checkFenxiao({ pid: pid })
		}

		//传入判断，type,寄件
		form.customerType = option.type ? option.type : 'kd'
		if (form.customerType == 'ky') {
			form.weight = 30
		}
		checkServiceAgreement()

	})
</script>

<style lang="scss" scoped>
	@import '@/addon/tk_jhkd/utils/styles/common.scss';

	.b-tabbar {
		position: fixed;
		bottom: 12rpx;
		left: 0;
		right: 0;
		margin: 0rpx 24rpx;
		border-radius: 12rpx;
		padding: 12rpx;
	}

	.b-tabbar-back {
		background: rgba(214, 234, 248, 0.9);
		ox-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.5);
	}

	.tag {
		background: #dddddd;
		padding: 6rpx 12rpx;
		text-align: center;
		border-radius: 8rpx;
		font-weight: bold;
	}

	.bt {
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
		border: #cfddce solid 2rpx;
	}

	.butto {
		background: linear-gradient(-90deg, #3c4cde 0%, #44c1f7 100%);
		text-align: center;
		width: 680rpx;
		border-radius: 12rpx;
		color: #ffffff;
		font-size: 32rpx;
		padding: 16rpx auto;
		margin-top: 48rpx;
		margin-bottom: 16rpx;
		margin-left: 12rpx;
	}

	.senddetail {
		background: linear-gradient(-90deg, #65bade 0%, #1984f7 100%);
		margin: 8rpx 0rpx;
		margin-right: 14rpx;
		padding: 8rpx 16rpx;
		border-radius: 12rpx;
		font-size: 24rpx;
		color: #ffffff;
	}

	.tt-bbut {
		background: linear-gradient(-90deg, #3a6ddc 1%, #26b5f1 100%);
		padding: 12rpx 34rpx;
		border-radius: 8rpx;
		color: #ffffff;
		font-size: 28rpx;
	}

</style>