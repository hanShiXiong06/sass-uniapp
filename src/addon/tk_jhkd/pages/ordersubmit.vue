<template>
	<view class="tk-card1  min-h-[100vh]" :style="themeColor()">
		<!-- 寄件人信息 -->
		<view class="tk-cardd" style="z-index: 1 !important">
			<!-- 寄件人信息 -->
			<view class="flex ">
				<view class="mt-1">
					<image :src="img('addon/tk_jhkd/icon/ji.png')" style="width: 62rpx;height: 70rpx;" mode="aspectFit">
					</image>
				</view>
				<view class="ml-2 flex items-center justify-between " style="width: 100%;"
					@click="toSelectAddress('startaddress')">
					<block v-if="form.startAddress">
						<view>
							<view class="flex items-center">
								<text class="text-[30rpx] font-bold">{{ form.startAddress.name }}</text>
								<text class="text-[30rpx] font-bold ml-2">{{ form.startAddress?.mobile
									}}</text>
							</view>
							<view class="text-[28rpx] text-[#878787] mt-2">{{ form.startAddress.address }}</view>
						</view>
					</block>
					<block v-else>
						<view class="">
							<text class="text-[28rpx] font-bold">寄件人信息</text>
							<view class="text-[#A2A2A2]">
								请选择寄件地址
							</view>
						</view>
					</block>
					<view class="flex items-center ml-2  w-[30%]">
						<view class="w-[2rpx] h-[30rpx] bg-[#E0E0E0]"></view>
						<view class="ml-2 font-550">地址薄</view>
					</view>
				</view>

			</view>

			<view class="line-box !bg-[#F2F2F2] !mt-4 !mb-4"></view>

			<!-- 收件人信息 -->
			<view class="flex">
				<view class="mt-1">
					<image :src="img('addon/tk_jhkd/icon/shou.png')" style="width: 62rpx;height: 70rpx;"
						mode="aspectFit"></image>
				</view>
				<view class="ml-2 flex items-center justify-between " style="width: 100%;"
					@click="toSelectAddress('endaddress')">
					<block v-if="form.endAddress">
						<view>
							<view class="flex items-center">
								<text class="text-[30rpx] font-bold">{{ form.endAddress.name }}</text>
								<text class="text-[30rpx] font-bold ml-2">{{ form.endAddress?.mobile
									}}</text>
							</view>
							<view class="text-[28rpx] text-[#878787] mt-2">{{ form.endAddress.address }}</view>
						</view>
					</block>
					<block v-else>
						<view class="">
							<text class="text-[28rpx] font-bold">收件人信息</text>
							<view class="text-[#A2A2A2]">
								请选择收件地址
							</view>
						</view>
					</block>
					<view class="flex items-center ml-2 w-[30%]">
						<view class="w-[2rpx] h-[30rpx] bg-[#E0E0E0]"></view>
						<view class="ml-2 font-550">地址薄</view>
					</view>
				</view>

			</view>

		</view>
		<view class="tk-cardd !bg-[#F9EBE0] !mt-[-24rpx]" style="z-index: -1 !important">
			<view class="text-[24rpx] text-[#7D563C] mt-4 mb-3 ml-[2rpx] font-550" font-550>请认真核对地址，填写实际重量再下单</view>
		</view>
		<view class="divider"></view>

		<!-- 物品信息卡片 -->
		<view class="tk-cardd">
			<view class="flex justify-between items-center">
				<view class="flex items-center">
					<text class="font-550">物品信息</text>
					<text class="bg-[#EB5757] text-white text-[24rpx] ml-2 px-2 py-1 rounded-[6rpx]">必填</text>
				</view>
				<view class="flex items-center" @click="writeGood()">
					<view class="ml-2" v-if="form.goods || form.weight">
						<text class="text-[#A7A7A7]">{{ form.goods }}</text>
						<text class="text-[#A7A7A7]" v-if="form.weight">,{{ form.weight }}kg</text>
					</view>

					<view class="" v-else>请填写物品信息</view>
					<view class="ml-4">
						<u-icon name="arrow-right" size="20" color="#000000"></u-icon>
					</view>
				</view>
			</view>
		</view>

		<view v-if="preData" class="courier-list tk-cardd">
			<view v-for="(item, index) in filteredCourierList" :key="index" class="courier-card"
				:class="{ 'active': currentIndex === index }" @click="selectPre(index)">
				<view class="card-content flex items-center">
					<!-- 快递logo -->

					<view>
						<image class="courier-logo" :src="img(item.logo)" mode="aspectFit" />
					</view>
					<!-- 快递信息 -->
					<view class="courier-info flex items-center justify-between">
						<view>
							<view class="info-header !mb-2">
								<text class="courier-name w-[40%] tk-sltext !text-[28rpx]">{{ item.channelName }}</text>
								<text class="price !text-[28rpx]">{{ item.showPrice }}元起</text>
							</view>
							<!-- 价格规则 -->
							<view v-if="item.calcFeeType == 'profit'">
								<view class="flex">
									<view class="bg-[#F3F3F3] px-1 py-1 rounded-[6rpx] font-550 text-[24rpx]">
										首重:{{ item.price_rule.first }}元/{{ item.price_rule.start }}kg,
										续重:{{ item.price_rule.add }}元/kg
									</view>

								</view>
							</view>
							<view v-else class="flex items-center">
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
								<view class="discount-tag  ml-2">
									{{ ((item.showPrice / item.originalFee * 10).toFixed(1)) >= 10 ? '无折扣' :
										(item.showPrice
											/
											item.originalFee * 10).toFixed(1) + '折' }}
								</view>
							</view>
						</view>
						<view>
							<up-radio-group v-model="currentIndex" placement="row">
								<u-radio shape="circle" :name="index"></u-radio>

							</up-radio-group>
							<!-- {{ currentIndex }} -->
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="tk-cardd text-sm">
			<view class="font-550">{{ tip.title }}</view>
			<view class="text-[#878787]">{{ tip.description }}</view>
		</view>
		<view class="mt-[380rpx] mb-[260rpx] flex items-center"></view>
		<!-- 物品信息弹出框 -->
		<u-popup class="safe-area-inset-bottom" :round="10" @close="close" closeable="true" :show="goodshow"
			mode="bottom" border-radius="12">
			<view class="popup-header">
				<view class="flex items-center justify-between px-4 py-3 bg-white">
					<text class="text-[32rpx] font-550 text-[#333]">物品信息</text>
					<view class="close-icon" @click="close">
						<u-icon name="close" size="20" color="#333"></u-icon>
					</view>
				</view>
				<view class="h-[2rpx] bg-[#F2F2F2]"></view>
			</view>
			<scroll-view class="h-[1160rpx] px-[32rpx] box-border mb-[60rpx]" scroll-y="true">

				<view class="!bg-[#F1F2F6] pt-2">
					<!-- 物品名称 -->
					<view class="goods-section bg-white p-4">
						<view class="items-center flex justify-between">
							<view class="text-[28rpx] font-550"> 物品类型 </view>
							<view class="text-[#0057FE] text-[28rpx]"
								@click="redirect({ url: '/addon/tk_jhkd/pages/agreement?type=jhkdyesgoods' })">
								违禁品查询
							</view>
						</view>

						<view class="goods-tags mt-2">
							<view v-for="(item, index) in goods" :key="index" class="tag-item"
								:class="{ 'active': form.goods === item }" @click="goodswrite(index)">{{ item }}</view>
						</view>
						<view>
							<u-input clearable="true" class="goods-input" v-model="form.goods" placeholder="请输入物品名称" />
						</view>

					</view>

					<view class="goods-section bg-white p-4 mt-2">
						<view class="text-[28rpx] font-550"> 物品详情 </view>
						<!-- 物品重量 -->
						<view class="flex items-center justify-between mt-2">
							<view class="section-title">
								物品重量(kg)
							</view>
							<view class="">
								<u-number-box button-size="48" bgColor="#ffffff" integer
									:min="form.customerType == 'kd' ? 1 : 30" :max="10000" v-model="form.weight" />
							</view>
						</view>
						<view class="text-[#EB5757] text-[24rpx] leading-[32rpx]">请填写打包完成后包裹的重量，超重需按照快递原价补差价，将不会享受快递折扣
						</view>

						<!-- 包裹数量 -->
						<view class="flex items-center justify-between mt-3 mb-3">
							<view class="flex items-center justify-between">
								<text>包裹数量(个)</text>
							</view>
							<view class="count-input">
								<u-number-box button-size="28" integer :min="1" :max="100" bgColor="#ffffff"
									v-model="form.packageCount" />
							</view>
						</view>

						<!-- 保价金额 -->
						<view class="goods-section flex items-center justify-between">
							<view class="section-title">
								<text>保价金额(元)</text>
							</view>
							<view class="ml-2">
								<u-input inputAlign="right" placeholder="不保价可不填" border="none" fontSize="14"
									class="goods-input" type="number" v-model="form.guaranteeValueAmount" />
							</view>
						</view>

						<!-- 订单备注 -->
						<view class="goods-section flex items-center justify-between">
							<view class="section-title">
								<text>订单备注</text>
							</view>
							<u-input inputAlign="right" border="none" fontSize="14" class="goods-input"
								v-model="form.remark" placeholder="小哥辛苦了!" />
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
						<view class="goods-section bg-[#F9EBE0] p-4">
							<view class="text-[#7D563C]">
								填写须知
							</view>
							<view class="text-[#7D563C] text-[24rpx] leading-[32rpx] mt-1">
								物品名称必须填写，物品重量需按照实际重量填写,超长物品请填写实际尺寸，如需要保价请填写保价金额</view>
						</view>
					</view>

					<view class="h-16"></view>
					<!-- 提交按钮 -->
					<view class="fixed left-0 right-0 bottom-0 bg-white pt-2 ">

						<view class="p-4 pt-2">
							<up-button type="primary" :class="{ 'loading': bjshow }" @click="closeShow()">
								<text>{{ bjshow ? '比价中' : '获取报价' }}</text>
								<u-loading-icon v-if="bjshow" timing-function="linear" color="#ffffff"></u-loading-icon>
							</up-button>
						</view>

					</view>
					<!-- 底部占位，防止内容被固定按钮遮挡 -->
					<view class="h-24"></view>
				</view>
			</scroll-view>
		</u-popup>
		<view class="mt-[98rpx]"></view>

		<view class="b-tabbar safe-area-inset-bottom z-999 !bg-white">

			<view class="b-tabbar-back !p-2 flex items-center justify-between">
				<view class="w-[60%]">
					<view class="mb-2 ml-1 " v-if="selectData">
						<view class="flex items-center mt-1">

							<view class="font-bold text-[40rpx] text-red">{{
								selectData ? selectData.showPrice + '元' : ""
							}}</view>
						</view>

					</view>
					<view v-if="jhkdservice">
						<checkbox-group class="uni-list" @change="checkboxChange">
							<label class="text-xs fl items-center uni-list-cell uni-list-cell-pd">
								<view>
									<!-- <checkbox color="#0057FE" style="transform: scale(0.9)" shape="circle" value="true"
										active-color="#0057FE" :checked="isOpenAgreement">
									</checkbox> -->
									<up-checkbox v-model="isOpenAgreement" shape="circle" :name="true" size="24"
										activeColor="#0057FE" @change="checkboxChange"></up-checkbox>
								</view>
								<view class="text-[#B0B0B0]" @click="
									redirect({
										url: '/addon/tk_jhkd/pages/agreement?type=jhkdservice',
									})
									">
									阅读并同意《<text class="text-[#B0B0B0]"> {{
										jhkdservice.title ? jhkdservice.title : "寄件服务协议"
									}}</text>》</view>
							</label>
						</checkbox-group>
					</view>
				</view>

				<view class="">

					<up-button type="primary" shape="circle" v-if="selectData" hover-class="none"
						class="bg-[#0057FE] text-[#fff] h-[80rpx] leading-[80rpx] rounded-[100rpx] text-[26rpx] font-500 w-[256rpx]"
						@click="submitOrder()">立即下单</up-button>
					<button v-else
						class="bg-[#BDBDBD] text-[#fff] h-[80rpx] leading-[80rpx] rounded-[100rpx] text-[26rpx] font-500 w-[256rpx]">立即下单</button>
				</view>


			</view>
			<u-safe-bottom></u-safe-bottom>
		</view>
		<button @click="shareEvent()"
			class="fixed bottom-48 right-4 z-999 rounded-full p-2 text-white hover:bg-blue-700">
			<u-icon name="share" color="#000000" size="24"></u-icon>
		</button>
		<share-poster ref="sharePosterRef" posterType="tk_jhkd_poster" :posterId="poster_id" :posterParam="posterParam"
			:copyUrlParam="copyUrlParam" :copyUrl="'/addon/tk_jhkd/pages/index'" />
		<pay ref="payRef" @close="payLoading = false"></pay>
	</view>
</template>

<script setup lang="ts">
import useDiyStore from "@/app/stores/diy";
import { ref, reactive, computed, watch } from "vue";
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
	"美妆用品",
	"数码产品",
	"服装鞋帽",
	"零食特产",
	"其他",
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
		uni.$u.toast("请填写寄件地址");
		return;
	}
	if (form.endAddress == []) {
		toSelectAddress("endaddress");
		uni.$u.toast("请填写收件地址");
		return;
	}

	form.showPrice = '0'
	console.log(form);

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
		uni.$u.toast("请填写寄件地址");
		return;
	}
	if (form.endAddress == []) {
		toSelectAddress("endaddress");
		uni.$u.toast("请填写送件地址");
		return;
	}
	bjshow.value = true;
	const data = await preOrder(form);


	// selectData.value  = 
	console.log(data);

	currentIndex.value = null;
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
		uni.$u.toast("请填写寄件地址");
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
		uni.$u.toast("请先阅读并勾选阅读同意协议");
		return;
	}

	useSubscribeMessage().request(
		"tk_jhkd_order_pay,tk_jhkd_order_pick,tk_jhkd_order_add"
	);
	const data = await createOrder(form);
	payLoading.value = true;
	form.delivery_info = [];
	selectData.value = null;
	preData.value = null;
	payRef.value?.open(
		data.data.trade_type,
		data.data.trade_id,
		"/addon/tk_jhkd/pages/orderlist"
	);
};
const selectPre = (index: number) => {
	console.log(preData.value)
	currentIndex.value = index;
	selectData.value = preData.value[index];
	// form.showPrice = selectData.value.showPrice;
	form.delivery_info = selectData.value;
	form.delivery_index = index;
	// form.price_rule = selectData.value.price_rule;
	// form.original_rule = selectData.value.original_rule;
};

// 监听 currentIndex 
watch(currentIndex, (newValue, oldValue) => {
	// 当 currentIndex 值发生变化时,重置 selectData 和 form
	// 直接调用 selectPre 函数
	selectPre(newValue);
});

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
		// #ifdef H5
		useLogin().setLoginBack({ url: '/addon/tk_jhkd/pages/ordersubmit' })
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
		uni.$u.toast('请先选择寄件和收件地址');
		return;
	}

	// 交换地址
	const temp = form.startAddress;
	form.startAddress = form.endAddress;
	form.endAddress = temp;

	// 清空快递列表和选择
	preData.value = null;
	// selectData.value = null;
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
	//box-shadow: 0 1px 1px 0 rgba(145, 145, 145, 0.2), 0 2px 2px 0 rgba(231, 231, 231, 0.2);
}

.tk-cardd {
	background-color: #ffffff;
	// 

	border-radius: 12rpx;
	padding: 16rpx;
	margin: 12rpx;
	position: relative;
	/* 添加定位属性 */
	z-index: 999;
	//box-shadow: 0 1px 1px 0 rgba(145, 145, 145, 0.2), 0 2px 2px 0 rgba(231, 231, 231, 0.2);
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
	bottom: 0rpx;
	left: 0;
	right: 0;
	margin: 0rpx;
	border-radius: 12rpx;
	padding: 12rpx;
	background: #f9f9f9;
}

.b-tabbar-back {

	border-radius: 12rpx;
	// box-shadow: inset 1px 1px 1px rgba(0, 0, 0, 0.1), 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.tt-bbut {
	background: #0057FE;
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
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20rpx;
	padding: 20rpx 0;

	.tag-item {
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ffffff;
		border: 1px solid #909194;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #666666;
		transition: all 0.3s ease;
		text-align: center;

		/* 文本超出显示省略号 */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 20rpx;

		&.active {
			background: #E6EEFF;
			color: #0057FE;
			border: 1px solid #0057FE;
		}

		/* 点击效果 */
		&:active {
			opacity: 0.8;
			transform: scale(0.98);
		}

		/* 适配不同平台 */
		/* #ifdef H5 */
		cursor: pointer;

		&:hover {
			opacity: 0.9;
		}

		/* #endif */
	}
}

/* 适配小屏幕 */
@media screen and (max-width: 320px) {
	.goods-tags {
		gap: 16rpx;

		.tag-item {
			font-size: 24rpx;
			height: 64rpx;
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
		background: #ffffff;
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
	padding: 0rpx;
}

.submit-btn {
	width: 100%;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #0057FE;
	border-radius: 44rpx;
	font-size: 30rpx;
	color: #ffffff;

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
	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.header-left {
			display: flex;
			align-items: center;
			flex: 1;

			.required-badge {
				padding: 2rpx 12rpx;
				background: #EB5757;
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
				font-weight: 600;
			}

			.info-text {
				display: flex;
				align-items: center;
				font-size: 26rpx;
				color: #868686;

				.goods-name {
					margin-right: 8rpx;
				}

				.weight {
					color: #666666;
				}
			}

			.empty-text {
				font-size: 26rpx;
				color: #868686;
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
				padding: 24rpx;
			}
		}
	}
}

.courier-list {
	padding: 16rpx;
}

.courier-card {
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	transition: all 0.3s ease;
	overflow: hidden;

	&.active {
		background: linear-gradient(135deg, #f0f1ff 0%, #e8e9ff 100%);
		border: 2rpx solid #0057FE;
		//transform: translateY(-2rpx);
		//box-shadow: 0 4rpx 16rpx rgba(69, 65, 199, 0.12);
		padding: 24rpx;

		.courier-name {
			color: #0057FE;
		}

		.price {
			color: #0057FE;
		}
	}

	&:active {
		transform: scale(0.98);
	}
}

.card-content {
	padding-bottom: 12rpx;
	padding-top: 12rpx;
	// display: flex;
	// align-items: flex-start;
	gap: 20rpx;
}

.courier-logo {
	width: 72rpx;
	height: 72rpx;
	border-radius: 128rpx;
	background: #f5f6fa;
	flex-shrink: 0;
}

.courier-info {
	flex: 1;
}

.info-header {
	display: flex;

	align-items: center;
	margin-bottom: 0rpx;

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
	background: rgba(69, 65, 199, 0.05);
	border-radius: 8rpx;
	font-size: 24rpx;
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

.popup-header {
	position: sticky;
	top: 0;
	left: 0;
	right: 0;
	z-index: 99;
	background: #fff;
}

.popup-content {
	height: calc(100vh - 180rpx);
	/* #ifdef H5 */
	height: calc(100vh - 280rpx);
	/* #endif */
}

/* 适配不同平台的安全区域 */
:deep(.u-popup) {
	/* #ifdef MP */
	max-height: 80vh;
	/* #endif */

	/* #ifdef H5 */
	max-height: 90vh;
	/* #endif */

	/* #ifdef APP-PLUS */
	max-height: 85vh;
	/* #endif */
}

.goods-section {
	.section-title {
		border-bottom: 2rpx solid #F2F2F2;
	}
}

:deep(.u-input) {
	background-color: transparent;
}

.close-icon {
	padding: 10rpx;

	&:active {
		opacity: 0.7;
	}
}

.primary-btn-bg {
	// background: linear-gradient( 94deg, #FB7939 0%, #FE120E 99%), #EF000C;
	background: linear-gradient(94deg, var(--primary-help-color) 0%, var(--primary-color) 99%), var(--primary-color);
}

.payment-bottom {
	padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
</style>