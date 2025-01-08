<template>
	<view class="tk-card1  min-h-[100vh]">
		<!-- 寄件人信息 -->
		<view class="order-card">
			<!-- 寄件人信息 -->
			<view class="address-item">
				<view class="address-content">
					<view class="left-area">
						<text class="tag-icon send">寄</text>
						<view class="dot-line"></view>
					</view>
					<view class="info-area" @click="toSelectAddress('startaddress')">
						<block v-if="form.startAddress">
							<view class="contact-info">
								<text class="name">{{ form.startAddress.name }}</text>

								<text class="phone">{{ maskPhone(form.startAddress?.mobile) }}</text>
								<text class="tag verified">已核验</text>
							</view>
							<view class="address-text">{{ form.startAddress.address }}</view>
						</block>
						<block v-else>
							<view class="empty-state">
								<text class="primary-text">从哪里寄?</text>
								<view class="flex items-center">
									<text class="secondary-text">点击选择寄件地址</text>
									<text class="tag required">必填</text>
								</view>
							</view>
						</block>
					</view>
					<view class="right-area">
						<text class="nc-iconfont nc-icon-arrow-right"></text>
					</view>
				</view>
			</view>

			<!-- 连接线和图标 -->
			<view class="connection-line">
				<view class="icon-wrapper" @click="exchangeAddress">
					<view class="exchange-icon">
						<view class="arrow arrow-up"></view>
						<view class="arrow arrow-down"></view>
					</view>
				</view>
				<view class="line-left"></view>

				<view class="line-right"></view>
			</view>

			<!-- 收件人信息 -->
			<view class="address-item">
				<view class="address-content">
					<view class="left-area">
						<text class="tag-icon receive">收</text>
						<view class="dot-line"></view>
					</view>
					<view class="info-area" @click="toSelectAddress('endaddress')">
						<block v-if="form.endAddress">
							<view class="contact-info">
								<text class="name">{{ form.endAddress.name }}</text>
								<text class="phone">{{ maskPhone(form.endAddress?.mobile) }}</text>
								<text class="tag new" v-if="isNewAddress">新地址</text>
							</view>
							<view class="address-text">{{ form.endAddress.address }}</view>
						</block>
						<block v-else>
							<view class="empty-state">
								<text class="primary-text">收件人信息</text>
								<view class="flex items-center">
									<text class="secondary-text">点击选择收件地址</text>
									<text class="tag required">必填</text>
								</view>
							</view>
						</block>
					</view>
					<view class="right-area">
						<text class="nc-iconfont nc-icon-arrow-right"></text>
					</view>
				</view>
			</view>

			<!-- 提示信息 -->
			<view class="notice-bar">
				<text class="nc-iconfont nc-icon-warning"></text>
				<text class="notice-text">请认真核实地址,填写实际重量再下单</text>
				<text class="tag warning">重要</text>
			</view>
		</view>

		<view class="divider"></view>

		<!-- 物品信息卡片 -->
		<view class="goods-info-card">
			<view class="card-header">
				<view class="header-left">
					<text class="required-badge">必填</text>
					<text class="title">物品信息</text>
					<view class="info-text" v-if="form.goods || form.weight">
						<text class="goods-name">{{ form.goods }}</text>
						<text class="weight" v-if="form.weight">{{ form.weight }}kg</text>
					</view>
					<view class="empty-text" v-else>请填写物品信息</view>
				</view>
				<view class="edit-btn" @click="writeGood()">
					<u-icon name="edit-pen" size="22" color="#4541c7"></u-icon>
				</view>
			</view>
		</view>
		<view class="pl-2 pr-2">
			<u-alert :title="tip.title" type="info" :closable="tip.closable" :description="tip.description"></u-alert>
		</view>
		<view v-if="preData" class="courier-list">
			<view v-for="(item, index) in filteredCourierList" :key="index" class="courier-card"
				:class="{ 'active': currentIndex === index }" @click="selectPre(index)">
				<view class="card-content flex items-center">
					<!-- 快递logo -->
					<view>
						<image class="courier-logo" :src="img(item.logo)" mode="aspectFit" />
					</view>


					<!-- 快递信息 -->
					<view class="courier-info">
						<view class="info-header">
							<text class="courier-name">{{ item.channelName }}</text>
							<text class="price">{{ item.showPrice }}元</text>
						</view>

						<!-- 价格规则 -->
						<view v-if="item.calcFeeType == 'profit'" class="price-rules">
							<view class="rule-tag">
								首重:{{ item.price_rule.first }}元/{{ item.price_rule.start }}kg
							</view>
							<view class="rule-tag">
								续重:{{ item.price_rule.add }}元/kg
							</view>
						</view>
						<view v-else class="discount-tag">
							{{ ((item.showPrice / item.originalFee * 10).toFixed(1)) >= 10 ? '无折扣' : (item.showPrice /
								item.originalFee * 10).toFixed(1) + '折' }}
						</view>

						<!-- 优惠信息 -->
						<view v-if="item.originalFee > 0 && (item.originalFee - item.showPrice) > 0"
							class="discount-info">
							<view class="original-price">
								原价{{ item.originalFee }}元
							</view>
							<view class="save-price">
								优惠:{{ (item.originalFee - item.showPrice).toFixed(2) }}元
							</view>
						</view>

						<!-- 限重提示 -->
						<view v-if="item.limitWeight > 0" class="weight-limit">
							限重:{{ item.limitWeight }}kg
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="mt-[380rpx] mb-[260rpx] flex items-center"></view>
		<!-- 物品信息弹出框 -->
		<u-popup class="safe-area-inset-bottom" :round="10" @close="close" closeable="true" :show="goodshow"
			mode="bottom" border-radius="12">
			<view class="sticky top-0 left-0 right-0 bg-white z-50 ml-2 mt-2 mb-2">
				<view class="">
					<text class="text-lg font-medium text-gray-900">填写物品信息</text>
					<text class="block text-sm text-gray-500">请填写物品重量、体积等信息</text>
				</view>
				<view class="h-px bg-gray-100"></view>
			</view>
			<view class="goods-popup">

				<view class="pt-0">
					<!-- 物品名称 -->
					<view class="goods-section">
						<view class="section-title">
							<text class="required-tag">*</text>
							<text>物品名称</text>
						</view>
						<u-input clearable="true" class="goods-input" v-model="form.goods"
							placeholder="如:生活用品,点击标签快速填写" />
						<view class="goods-tags mt-2">
							<view v-for="(item, index) in goods" :key="index" class="tag-item"
								:class="{ 'active': form.goods === item }" @click="goodswrite(index)">{{ item }}</view>
						</view>
						<view class="forbidden-link"
							@click="redirect({ url: '/addon/tk_jhkd/pages/agreement?type=jhkdyesgoods' })">
							<text class="nc-iconfont nc-icon-warning"></text>
							<text>违禁品查询</text>
						</view>
					</view>

					<!-- 物品重量 -->
					<view class="goods-section">
						<view class="section-title">
							<text class="required-tag">*</text>
							<text>物品重量</text>
						</view>
						<view class="weight-input">
							<u-number-box button-size="28" color="#4541c7" bgColor="#f5f6fa" iconStyle="color: #4541c7"
								integer :min="form.customerType == 'kd' ? 1 : 30" :max="10000" v-model="form.weight" />
							<text class="unit">kg</text>
						</view>
						<view class="weight-tip">请填写打包完成后包裹的重量，超重需按照快递原价补差价</view>
					</view>

					<!-- 包裹数量 -->
					<view class="goods-section">
						<view class="section-title">
							<text>包裹数量</text>
						</view>
						<view class="count-input">
							<u-number-box button-size="28" color="#4541c7" bgColor="#f5f6fa" iconStyle="color: #4541c7"
								integer :min="1" :max="100" v-model="form.packageCount" />
							<text class="unit">个</text>
						</view>
					</view>

					<!-- 物品体积 -->
					<view class="goods-section">
						<view class="section-title">
							<text>物品体积</text>
						</view>
						<view class="volume-input">
							<view class="volume-item">
								<u-input border="bottom" maxlength="3" v-model="form.vloumLong" placeholder="长" />
							</view>
							<text class="multiply">x</text>
							<view class="volume-item">
								<u-input border="bottom" maxlength="3" v-model="form.vloumWidth" placeholder="宽" />
							</view>
							<text class="multiply">x</text>
							<view class="volume-item">
								<u-input border="bottom" maxlength="3" v-model="form.vloumHeight" placeholder="高" />
							</view>
							<text class="unit">cm</text>
						</view>
					</view>

					<!-- 保价金额 -->
					<view class="goods-section">
						<view class="section-title">
							<text>保价金额</text>
						</view>
						<view class="insurance-input">
							<u-input placeholder="不保价可不填" type="number" v-model="form.guaranteeValueAmount" />
							<text class="unit">元</text>
						</view>
					</view>

					<!-- 订单备注 -->
					<view class="goods-section">
						<view class="section-title">
							<text>订单备注</text>
						</view>
						<u-input class="remark-input" v-model="form.remark" placeholder="小哥辛苦了!" />
					</view>

					<!-- 提交按钮 -->
					<view class="submit-section fixed left-0 right-0 bottom-0 bg-white px-4 py-3 shadow-lg">
						<button class="submit-btn w-full py-3 rounded-lg flex items-center justify-center space-x-2"
							:class="{ 'loading': bjshow }" @click="closeShow()">
							<text>{{ bjshow ? 'AI比价中' : '获取报价' }}</text>
							<u-loading-icon v-if="bjshow" mode="circle" color="#ffffff"></u-loading-icon>
						</button>
					</view>
					<!-- 底部占位，防止内容被固定按钮遮挡 -->
					<view class="h-24"></view>
				</view>
			</view>
		</u-popup>
		<view class="mt-[98rpx]"></view>

		<view class="b-tabbar safe-area-inset-bottom">

			<view class="b-tabbar-back pl-2 pt-2">
				<view v-if="jhkdservice">
					<checkbox-group class="uni-list" @change="checkboxChange">
						<label class="text-xs fl items-center uni-list-cell uni-list-cell-pd">
							<view>
								<checkbox color="#3c4cde" style="transform: scale(0.6)" value="true"
									:checked="isOpenAgreement">
								</checkbox>
							</view>
							<view>
								阅读并同意《<text class="text-[#3c39c0]" @click="
									redirect({
										url: '/addon/tk_jhkd/pages/agreement?type=jhkdservice',
									})
									"> {{
										jhkdservice.title ? jhkdservice.title : "寄件服务协议"
									}}</text>》</view>
						</label>
					</checkbox-group>
				</view>
				<view class=" fb items-center pl-2 pr-2 pb-2 pt-1">
					<view class="w-[60%]">
						<view class="flex items-center">
							<view class="text-xs font-bold tk-sltext text-[30rpx] w-[40%]">
								{{ selectData ? selectData.channelName : "请选择快递" }}
							</view>
							<view v-if="form.goods != ''" class="ml-2 text-xs text-slate-500">{{ form.goods }}{{
								form.weight
							}}kg
							</view>
						</view>

						<view v-if="selectData" class="flex items-center mt-1">
							<view class="text-xs">快递费：</view>
							<view class="font-bold text-[36rpx] text-red">{{
								selectData ? selectData.showPrice + '元' : "请先选择快递"
							}}</view>
						</view>

					</view>
					<text class="tt-bbut text-center w-[20%]" @click="submitOrder()">立即下单</text>
				</view>

			</view>
			<u-safe-bottom></u-safe-bottom>
		</view>
		<button @click="shareEvent()"
			class="fixed bottom-48 right-4 z-50 rounded-full p-2 text-white hover:bg-blue-700">
			<u-icon name="share" color="#000000" size="24"></u-icon>
		</button>
		<share-poster ref="sharePosterRef" posterType="tk_jhkd_poster" :posterId="poster_id" :posterParam="posterParam"
			:copyUrlParam="copyUrlParam" :copyUrl="'/addon/tk_jhkd/pages/index'" />
		<pay ref="payRef" @close="payLoading = false"></pay>
	</view>
</template>

<script setup lang="ts">
import useDiyStore from "@/app/stores/diy";
import { ref, reactive, computed } from "vue";
import { goto } from "@/addon/tk_jhkd/utils/ts/goto";
import { onLoad, onShow } from "@dcloudio/uni-app";
import {
	preOrder,
	createOrder,
	getJhkdAddressInfo,
	getAgreement,
	checkFenxiao,
} from "@/addon/tk_jhkd/api/tkjhkd";

import { redirect, img, handleOnloadParams } from "@/utils/common";
import { getAddressInfo } from "@/app/api/member";
import { useSubscribeMessage } from "@/hooks/useSubscribeMessage";
import { useLogin } from "@/hooks/useLogin";
import useMemberStore from "@/stores/member";
const memberStore = useMemberStore();
const userInfo = computed(() => memberStore.info);
import { getToken, isWeixinBrowser, getSiteId } from "@/utils/common";
import { checkAddPayEvent } from "@/addon/tk_jhkd/utils/ts/common"
checkAddPayEvent()
const list = ref([""]);
const startaddress = ref(null);
const endaddress = ref(null);
const preData = ref();
const selectIndex = ref();
const selectData = ref();
const payRef = ref(null);
const payLoading = ref(false);
const isReadJhkdService = ref(false);
const isOpenAgreement = ref(false);
const bjshow = ref(false);
const currentIndex = ref(null);
const tip = ref({
	title: "快速下单必读",
	description:
		"先地址簿添加/编辑地址，选择取/收货地址，填写物品信息，选择渠道下单",
	closable: false,
});
const goods = ref([
	"普货",
	"文件",
	"美妆用品",
	"数码产品",
	"服装鞋帽",
	"珠宝首饰",
	"零食特产",
	"办公用品",
]);

/************* 分享海报-start **************/
let sharePosterRef = ref(null);
let copyUrlParam = ref("");
let posterParam = {};
const poster_id = ref(0);
// 分享海报链接
const copyUrlFn = () => {
	if (userInfo.value && userInfo.value.member_id)
		copyUrlParam.value += "?mid=" + userInfo.value.member_id;
};
const shareEvent = () => {
	// 检测是否登录
	if (!userInfo.value) {
		useLogin().setLoginBack({ url: "/addon/tk_jhkd/pages/ordersubmit" });
		return false;
	}

	if (userInfo.value && userInfo.value.member_id)
		posterParam.member_id = userInfo.value.member_id;
	copyUrlFn();
	sharePosterRef.value.openShare();
};
/************* 分享海报-end **************/

const goodswrite = (index) => {
	uni.$u.toast(goods.value[index]);
	form.goods = goods.value[index];
};
const checkboxChange = (e) => {
	if (isOpenAgreement.value == true) {
		isOpenAgreement.value = false;
	} else {
		isOpenAgreement.value = true;
	}
};
const atip = ref({
	title: "填写须知",
	description:
		"物品名称必须填写，物品重量需按照实际重量填写,超长物品请填写实际尺寸，如需要保价请填写保价金额",
	closable: false,
});
const form = reactive({
	startAddress: uni.getStorageSync("startAddress"),
	endAddress: uni.getStorageSync("endAddress"),
	customerType: "kd", //寄件渠道，快递，快运，得物
	goods: "", //托寄物名称
	packageCount: 1, //包裹数量
	weight: 1.0, //单位kg,保留两位
	vloumLong: 10, //cm
	vloumWidth: 10,
	vloumHeight: 10,
	guaranteeValueAmount: null,
	remark: "",
	showPrice: "0",
	payMethod: "",
	delivery_info: [],
	key: "",
	delivery_index: "",
	price_rule: [],
	original_rule: []
});
const close = () => {
	goodshow.value = false;
	bjshow.value = false
};
const goodshow = ref(false);
const goodstype = ref(["0000", "15222"]);
const toSelectAddress = (type) => {
	uni.setStorage({
		key: "selectAddressCallback",
		data: {
			back: "/addon/tk_jhkd/pages/ordersubmit",
			delivery: type,
			value: type,
		},
		success() {
			redirect({
				url: "/addon/tk_jhkd/pages/address/address",
				param: { type: "address" },
			});
		},
	});
};
const addressInfo = async (id) => {
	if (id > 0) {
		const data = await getJhkdAddressInfo(id);
		return data.data;
	}
};

const selectAddress = uni.getStorageSync("selectAddressCallback");
if (selectAddress) {
	// 赋能取件地址
	if (selectAddress.delivery == "startaddress") {
		addressInfo(selectAddress.address_id)
			.then((data) => {
				uni.setStorageSync("startAddress", data);
				form.startAddress = uni.getStorageSync("startAddress");
			})
			.catch((error) => {
				console.error(error);
			});
	}
	if (selectAddress.delivery == "endaddress") {
		addressInfo(selectAddress.address_id)
			.then((data) => {
				uni.setStorageSync("endAddress", data);
				form.endAddress = uni.getStorageSync("endAddress");
			})
			.catch((error) => {
				console.error(error);
			});
	}
	uni.removeStorage({ key: "selectAddressCallback" });
}
const writeGood = () => {
	if (!getToken()) {
		const login = useLogin();
		// 第三方平台自动登录
		// #ifdef MP
		login.getAuthCode();
		// #endif
		// #ifdef H5
		useLogin().setLoginBack({ url: '/addon/tk_jhkd/pages/ordersubmit' })
		// #endif
	}
	if (form.startAddress == []) {
		toSelectAddress("startaddress");
		uni.$u.toast("请填写取件地址");
		return;
	}
	if (form.endAddress == []) {
		toSelectAddress("endaddress");
		uni.$u.toast("请填写送件地址");
		return;
	}
	useSubscribeMessage().request("tk_jhkd_order_sign");
	goodshow.value = true;
	form.delivery_info = [];
};
const closeShow = async () => {

	if (form.goods == "") {
		uni.$u.toast("请填写物品名称");
		return;
	}
	if (form.startAddress == []) {
		toSelectAddress("startaddress");
		uni.$u.toast("请填写取件地址");
		return;
	}
	if (form.endAddress == []) {
		toSelectAddress("endaddress");
		uni.$u.toast("请填写送件地址");
		return;
	}
	bjshow.value = true;
	const data = await preOrder(form);
	selectData.value = null;
	selectData.value = null;
	form.key = data.data.key;
	preData.value = data.data.list;
	bjshow.value = false;
	goodshow.value = false;
	form.delivery_info = [];
};
const submitOrder = async () => {
	checkAddPayEvent()
	if (!userInfo.value) {
		useLogin().setLoginBack({ url: "/addon/tk_jhkd/pages/ordersubmit" });
		return false;
	}
	if (form.goods == "") {
		goodshow.value = true;
		uni.$u.toast("请填写物品名称");
		return;
	}
	if (form.startAddress == []) {
		toSelectAddress("startaddress");
		uni.$u.toast("请填写取件地址");
		return;
	}
	if (form.endAddress == []) {
		toSelectAddress("endaddress");
		uni.$u.toast("请填写送件地址");
		return;
	}
	if (preData.value == null) {
		uni.$u.toast("请完善信息再获取报价");
		return;
	}
	if (selectData.value == null) {
		uni.$u.toast("请选择发货渠道");
		return;
	}
	if (isOpenAgreement.value == false) {
		uni.$u.toast("请先阅读并同意协议");
		return;
	}

	useSubscribeMessage().request(
		"tk_jhkd_order_pay,tk_jhkd_order_pick,tk_jhkd_order_add"
	);
	const data = await createOrder(form);
	form.delivery_info = [];
	selectData.value = null;
	preData.value = null;
	payLoading.value = true;
	payRef.value?.open(
		data.data.trade_type,
		data.data.trade_id,
		"/addon/tk_jhkd/pages/orderlist"
	);
};
const selectPre = (index: number) => {
	currentIndex.value = index;
	selectData.value = preData.value[index];
	form.showPrice = selectData.value.showPrice;
	form.delivery_info = selectData.value;
	form.delivery_index = index;
	form.price_rule = selectData.value.price_rule;
	form.original_rule = selectData.value.original_rule;
};
const jhkdservice = ref();
const checkServiceAgreement = async () => {
	const data = await getAgreement("jhkdservice");
	jhkdservice.value = data.data;
};
onLoad((option) => {
	// #ifdef MP-WEIXIN
	// 处理小程序场景值参数
	option = handleOnloadParams(option);
	// #endif
	if (!getToken()) {
		const login = useLogin();
		// 第三方平台自动登录
		// #ifdef MP
		login.getAuthCode();
		// #endif
	}
	let pid = uni.getStorageSync("pid");
	if (pid && pid > 0) {
		checkFenxiao({ pid: pid });
	}

	//传入判断，type,寄件
	form.customerType = option.type ? option.type : "kd";
	if (form.customerType == "ky") {
		form.weight = 30;
	}
	checkServiceAgreement();
});

// 计算属性：显示所有快递列表
const filteredCourierList = computed(() => {
	if (!preData.value) return [];
	return preData.value;
});

// 交换收寄件地址
const exchangeAddress = () => {
	if (!form.startAddress || !form.endAddress) {
		uni.$u.toast('请先选择收件和寄件地址');
		return;
	}

	// 交换地址
	const temp = form.startAddress;
	form.startAddress = form.endAddress;
	form.endAddress = temp;

	// 清空快递列表和选择
	preData.value = null;
	selectData.value = null;
	form.delivery_info = [];

	// 重新获取报价
	if (form.goods && form.weight) {
		closeShow();
	}
};

// 手机号脱敏处理
const maskPhone = (phone: string | undefined) => {
	if (!phone) return '';
	return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};
</script>

<style lang="scss" scoped>
@import "@/addon/tk_jhkd/utils/styles/common.scss";

:root,
.tk-card1 {
	background-color: rgba(182, 212, 212, 0.2);
	// 

	border-radius: 12rpx;
	padding: 12rpx;
	box-shadow: 0 1px 1px 0 rgba(145, 145, 145, 0.2), 0 2px 2px 0 rgba(231, 231, 231, 0.2);
}

page {
	--primary-color: #4541c7;
	--primary-color-dark: #f26f3e;
	--primary-color-disabled: #ffb397;
	--primary-color-light: #ffeae2;
	--page-bg-color: #f7f7f7;
	--price-text-color: #ED1B26;
}



.selectitemclass {
	background-color: #d2e7e6;
	padding: 20rpx;
	/* 假设 p-2 对应 20rpx */
	color: #4541C7;
	font-size: 32rpx;
	border-radius: 8rpx;
	/* 假设 rounded 对应 8rpx */
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

.tk-tag {
	padding: 4rpx 8rpx;
	background: #4541c7;
	color: #ffffff;
	border-radius: 8rpx;
	font-size: 22rpx;
}

.butto {
	background: #4541c7;
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
	background: #dee6ff;
	margin: 8rpx 0rpx;
	margin-right: 14rpx;
	padding: 8rpx 16rpx;
	border-radius: 12rpx;
	font-size: 24rpx;
	color: #4541c7;
	border: 1px solid #4541c7;
}

.b-tabbar {
	position: fixed;
	bottom: 12rpx;
	left: 0;
	right: 0;
	margin: 0rpx 8rpx;
	border-radius: 12rpx;
	padding: 12rpx;
	background: linear-gradient(-90deg, #dde5e5 0%, #dde4ef 100%);
}

.b-tabbar-back {
	background: #f9f9f9;
	border-radius: 12rpx;
	// box-shadow: inset 1px 1px 1px rgba(0, 0, 0, 0.1), 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.tt-bbut {
	background: #4541c7;
	padding: 12rpx 34rpx;
	border-radius: 8rpx;
	color: #ffffff;
	font-size: 28rpx;
}

.address-section {
	padding: 24rpx 0;

	.address-header {
		position: relative;
	}

	.tag {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		border-radius: 8rpx;

		&.send {
			background: #f0f1f5;
			color: #333;
		}

		&.receive {
			background: #4541c7;
			color: #fff;
		}
	}

	.name-phone {
		display: flex;
		align-items: center;
		margin-bottom: 8rpx;

		.name {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-right: 16rpx;
		}

		.phone {
			font-size: 28rpx;
			color: #666;
		}
	}

	.address {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
	}

	.empty-address {
		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 4rpx;
		}

		.subtitle {
			font-size: 26rpx;
			color: #999;
		}
	}

	.address-book-btn {
		padding: 12rpx 24rpx;
		background: #f7f8fa;
		border-radius: 32rpx;
		font-size: 26rpx;
		color: #666;
		transition: all 0.3s;

		&:active {
			opacity: 0.8;
		}
	}
}

.divider {
	height: 2rpx;
	background: #f5f6f7;
	margin: 0 24rpx;
}

.tips {
	font-size: 26rpx;
	color: #666;
	padding: 24rpx;
	line-height: 1.4;
}

.order-card {
	margin: 16rpx;
	padding: 24rpx 20rpx;
	background: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.address-item {
	position: relative;
	padding: 16rpx 0;

	.address-content {
		display: flex;
		align-items: flex-start;
	}

	.left-area {
		position: relative;
		margin-right: 16rpx;
	}

	.dot-line {
		position: absolute;
		left: 50%;
		top: 56rpx;
		bottom: -16rpx;
		width: 2rpx;
		background: repeating-linear-gradient(to bottom, #ddd 0, #ddd 4rpx, transparent 4rpx, transparent 8rpx);
	}
}

.tag-icon {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: bold;
	border-radius: 12rpx;

	&.send {
		background: linear-gradient(135deg, #4541c7 0%, #5c58d9 100%);
		color: #fff;
		box-shadow: 0 4rpx 12rpx rgba(69, 65, 199, 0.2);
	}

	&.receive {
		background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
		color: #fff;
		box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.2);
	}
}

.connection-line {
	display: flex;
	align-items: center;
	padding: 4rpx 0;
	margin: 0 0rpx;

	.line-left,
	.line-right {
		flex: 1;
		height: 2rpx;
		background: linear-gradient(to right, transparent, #e0e0e0);
	}

	.line-right {
		background: linear-gradient(to left, transparent, #e0e0e0);
	}

	.icon-wrapper {
		width: 44rpx;
		height: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f6fa;
		border-radius: 50%;
		margin: 0 rpx;
		transition: all 0.3s;
		cursor: pointer;
		position: relative;

		&:active {
			transform: rotate(180deg);
			background: #4541c7;

			.arrow {
				border-color: #fff;
			}
		}

		.exchange-icon {
			width: 24rpx;
			height: 24rpx;
			position: relative;
		}

		.arrow {
			position: absolute;
			width: 12rpx;
			height: 12rpx;
			border-style: solid;
			border-color: #666;
			border-width: 0 2rpx 2rpx 0;
			transition: all 0.3s;

			&.arrow-up {
				top: 2rpx;
				left: 6rpx;
				transform: rotate(-135deg);
			}

			&.arrow-down {
				bottom: 2rpx;
				left: 6rpx;
				transform: rotate(45deg);
			}
		}
	}
}

.tag {
	display: inline-block;
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
	font-size: 22rpx;
	margin-left: 12rpx;

	&.verified {
		color: #52c41a;
		background: rgba(82, 196, 26, 0.1);
	}

	&.required {
		color: #ff4d4f;
		background: rgba(255, 77, 79, 0.1);
	}

	&.new {
		color: #1890ff;
		background: rgba(24, 144, 255, 0.1);
	}

	&.warning {
		color: #faad14;
		background: rgba(250, 173, 20, 0.1);
	}
}

.notice-bar {
	margin-top: 16rpx;
	padding: 12rpx 20rpx;
	background: #fffbe6;
	border: 1rpx solid #ffe58f;
	border-radius: 12rpx;
	display: flex;
	align-items: center;

	.nc-iconfont {
		font-size: 28rpx;
		color: #faad14;
		margin-right: 12rpx;
	}

	.notice-text {
		font-size: 26rpx;
		color: #d48806;
		flex: 1;
	}
}

.goods-popup {
	max-height: 80vh;
	overflow-y: auto;
	padding: 32rpx 24rpx;
	background: #ffffff;
	border-radius: 24rpx 24rpx 0 0;
}

.goods-section {
	margin-bottom: 10rpx;

	.section-title {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;

		.required-tag {
			color: #ff4d4f;
			margin-right: 8rpx;
		}
	}
}

.goods-input {
	background: #f5f6fa;
	border-radius: 12rpx;
	padding: 12rpx 24rpx;
	margin-bottom: 16rpx;
}

.goods-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 16rpx;

	.tag-item {
		padding: 12rpx 24rpx;
		background: #f5f6fa;
		border-radius: 32rpx;
		font-size: 26rpx;
		color: #666666;
		transition: all 0.3s;

		&.active {
			background: #4541c7;
			color: #ffffff;
		}

		&:active {
			opacity: 0.8;
		}
	}
}

.forbidden-link {
	display: flex;
	align-items: center;
	font-size: 26rpx;
	color: #ff4d4f;
	margin-top: 16rpx;

	.nc-iconfont {
		margin-right: 8rpx;
	}
}

.weight-input,
.count-input {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.volume-input {
	display: flex;
	align-items: center;
	gap: 16rpx;

	.volume-item {
		flex: 1;
		background: #f5f6fa;
		border-radius: 12rpx;
		padding: 12rpx;
	}

	.multiply {
		color: #999999;
		font-size: 24rpx;
	}
}

.insurance-input {
	display: flex;
	align-items: center;
	gap: 16rpx;
	background: #f5f6fa;
	border-radius: 12rpx;
	padding: 12rpx 24rpx;
}

.unit {
	font-size: 26rpx;
	color: #999999;
	margin-left: 8rpx;
}

.weight-tip {
	font-size: 24rpx;
	color: #ff4d4f;
	margin-top: 8rpx;
}

.remark-input {
	background: #f5f6fa;
	border-radius: 12rpx;
	padding: 12rpx 24rpx;
}

.submit-section {
	margin-top: 48rpx;
	padding: 0 24rpx 24rpx;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #4541c7 0%, #5c58d9 100%);
	border-radius: 44rpx;
	font-size: 30rpx;
	color: #ffffff;
	border: none;
	transition: all 0.3s;

	&.loading {
		opacity: 0.8;
	}

	&:active {
		transform: scale(0.98);
	}

	.u-loading-icon {
		margin-left: 12rpx;
	}
}

.goods-info-card {
	margin: 16rpx;
	padding: 24rpx;
	background: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.header-left {
			display: flex;
			align-items: center;
			flex: 1;

			.required-badge {
				padding: 4rpx 12rpx;
				background: linear-gradient(135deg, #4541c7 0%, #5c58d9 100%);
				color: #ffffff;
				font-size: 22rpx;
				border-radius: 6rpx;
				margin-right: 12rpx;
			}

			.title {
				font-size: 28rpx;
				color: #333333;
				font-weight: 500;
				margin-right: 16rpx;
			}

			.info-text {
				display: flex;
				align-items: center;
				font-size: 26rpx;
				color: #272822;

				.goods-name {
					margin-right: 8rpx;
				}

				.weight {
					color: #666666;
				}
			}

			.empty-text {
				font-size: 26rpx;
				color: #999999;
			}
		}

		.edit-btn {
			width: 48rpx;
			height: 48rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f5f6fa;
			border-radius: 24rpx;
			transition: all 0.3s;

			&:active {
				background: #e8e9f0;
				transform: scale(0.95);
			}
		}
	}
}

.courier-list {
	padding: 16rpx;
}

.courier-card {
	margin-bottom: 20rpx;
	border-radius: 16rpx;
	background: #ffffff;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	transition: all 0.3s ease;
	overflow: hidden;

	&.active {
		background: linear-gradient(135deg, #f0f1ff 0%, #e8e9ff 100%);
		border: 2rpx solid #4541c7;
		transform: translateY(-2rpx);
		box-shadow: 0 4rpx 16rpx rgba(69, 65, 199, 0.12);

		.courier-name {
			color: #4541c7;
		}

		.price {
			color: #4541c7;
		}
	}

	&:active {
		transform: scale(0.98);
	}
}

.card-content {
	padding: 24rpx;
	// display: flex;
	// align-items: flex-start;
	gap: 20rpx;
}

.courier-logo {
	width: 128rpx;
	height: 128rpx;
	border-radius: 128rpx;
	background: #f5f6fa;
	flex-shrink: 0;
}

.courier-info {
	flex: 1;
}

.info-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;

	.courier-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333333;
	}

	.price {
		font-size: 32rpx;
		font-weight: 600;
		color: #ff4d4f;
	}
}

.price-rules {
	display: flex;
	gap: 12rpx;
	margin-bottom: 12rpx;

	.rule-tag {
		padding: 8rpx 16rpx;
		background: rgba(69, 65, 199, 0.05);
		border-radius: 8rpx;
		font-size: 24rpx;
		color: #4541c7;
	}
}

.discount-tag {
	display: inline-block;
	padding: 8rpx 16rpx;
	background: rgba(255, 77, 79, 0.05);
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #ff4d4f;
	margin-bottom: 12rpx;
}

.discount-info {
	display: flex;
	gap: 12rpx;
	margin-bottom: 12rpx;

	.original-price {
		padding: 6rpx 12rpx;
		background: #f5f6fa;
		border-radius: 6rpx;
		font-size: 24rpx;
		color: #999999;
		text-decoration: line-through;
	}

	.save-price {
		padding: 6rpx 12rpx;
		background: rgba(255, 77, 79, 0.05);
		border-radius: 6rpx;
		font-size: 24rpx;
		color: #ff4d4f;
		font-weight: 500;
	}
}

.weight-limit {
	font-size: 24rpx;
	color: #666666;
}
</style>