<template>
    <view :style="themeColor()" class="bg-[#F6F6F6] min-h-[100vh]">
        <view v-if="!loading">
            <block v-if="config.is_fenxiao == 1">
                <view class="h-[320rpx] box-border px-[32rpx] pt-[44rpx] flex flex-col justify-between" :style="{ 'background': 'url(' + img('addon/shop_fenxiao/index/header_bg.png') + ') left top / 100% 100% no-repeat' }">
                    <view class="flex items-center">
                        <view class="!w-[120rpx] !h-[120rpx] rounded-full flex-shrink-0 overflow-hidden">
                            <u-avatar v-if="detail.member.headimg" :src="img(detail.member.headimg)" size="120rpx" leftIcon="none"></u-avatar>
                            <u-avatar v-else :src="img('addon/shop_fenxiao/index/head.png')" size="120rpx" leftIcon="none"></u-avatar>
                        </view>
                        <view class="flex flex-col text-[#303133] ml-[32rpx]">
                            <view class="text-[30rpx] truncate max-w-[520rpx]">
                                <text class="font-bold whitespace-nowrap">{{ detail.member.nickname }}</text>
                            </view>
                            <view class="text-[24rpx] mt-[20rpx]" v-if="detail.parent_fenxiao">
                                上级分销商：{{ detail.parent_fenxiao.nickname }}
                            </view>
                        </view>
                        <!-- <view class="flex items-center text-[#fff] text-[24rpx] ml-auto">
                            <text class="nc-iconfont nc-icon-bangzhuV6xx mr-[10rpx]"></text>
                            <text>推广规则</text>
                        </view> -->
                    </view>
                    <view class="flex items-center h-[140rpx] box-border rounded-t-[20rpx] p-[30rpx]"
					:style="{backgroundImage: 'url(' + img('addon/shop_fenxiao/index/head_bg.png') + ') ',backgroundSize: 'cover',backgroundRepeat: 'no-repeat',backgroundPosition: 'cover'}" @click="redirect({ url: '/addon/shop_fenxiao/pages/level' })">
                        <view class="flex flex-col">
                            <view class="flex items-center">
                                <image class="w-[30rpx] h-[30rpx] mr-[10rpx]" :src="img('addon/shop_fenxiao/info_vip.png')" mode="widthFix"/>
                                <text class="text-[28rpx] truncate w-[320rpx] font-bold text-[#FDD6A1] font-bold">{{ Object.keys(detail.fenxiao_level).length && !detail.fenxiao_level.is_default ? detail.fenxiao_level.level_name : '等级未解锁' }} </text>
                            </view>
                            <text class="text-[26rpx] text-[#E8D3B6] mt-[20rpx]">下单、邀请好友均可提升等级</text>
                        </view>
                        <text class="ml-auto level-wrap w-[140rpx] h-[46rpx] text-center rounded-[54rpx] text-[24rpx] leading-[48rpx] text-[#794200]">去升级</text>
                    </view>
                </view>

                <view class="commission-bg mx-[24rpx] my-[20rpx] rounded-[16rpx] pb-[35rpx]">
                    <view class="flex justify-between h-[90rpx] px-[24rpx] items-center border-0 border-b-[1rpx] border-[#E0E0E0] border-solid">
                        <text class="text-[28rpx] font-bold">{{ t('billingInformation') }}</text>
                        <view class="text-[#666] text-[26rpx]" @click="cashOutList">
                            <text>佣金明细</text>
                            <text class="nc-iconfont nc-icon-youV6xx text-[#666] !text-[26rpx]"></text>
                        </view>
                    </view>
                    <view class="flex mt-[50rpx] justify-around commission-content">
                        <view class="flex flex-col items-center" @click="toCommission">
                            <text class="text-[22rpx] text-[#666]">{{ t('commissionGet') }}</text>
                            <text class="text-[#303133] text-[28rpx] font-bold mt-[20rpx]">{{ moneyFormat(detail.member.commission_get) }}</text>
                        </view>
                        <view class="flex flex-col items-center" @click="toCommission">
                            <text class="text-[22rpx] text-[#666]">{{ t('commission') }}</text>
                            <text class="text-[#303133] text-[28rpx] font-bold mt-[20rpx]">{{ moneyFormat(detail.member.commission) }}</text>
                        </view>
                        <view class="flex flex-col items-center" @click="toCommission">
                            <text class="text-[22rpx] text-[#666]">已提现</text>
                            <text class="text-[#303133] text-[28rpx] font-bold mt-[20rpx]">{{ moneyFormat(detail.member.commission_get - detail.member.commission - detail.member.commission_cash_outing) }}</text>
                        </view>
                        <view class="flex flex-col items-center" @click="toCommission">
                            <text class="text-[22rpx] text-[#666]">{{ t('commissionCashOuting') }}</text>
                            <text class="text-[#303133] text-[28rpx] font-bold mt-[20rpx]">{{ moneyFormat(detail.member.commission_cash_outing) }}</text>
                        </view>
                    </view>
                    <view
                        class="text-center mt-[40rpx] mx-auto w-[570rpx] h-[76rpx] leading-[76rpx] level-wrap text-[#985400] rounded-[90rpx] text-[28rpx]" @click="applyCashOut">{{ t('cashOut') }}</view>
                </view>

                <view class="flex">
                    <view class="flex px-[30rpx] rounded-[16rpx] items-center flex-1 mx-[24rpx] h-[140rpx] team-bg" @click.stop="redirect({ url: '/addon/shop_fenxiao/pages/team' })">
                        <image class="w-[80rpx] h-[80rpx] mr-[20rpx]" :src="img('addon/shop_fenxiao/index/team1.png')" mode="widthFix"/>
                        <view class="flex flex-col">
                            <text class="text-[26rpx]">我的团队</text>
                            <text class="text-[#666] text-[24rpx] mt-[20rpx]">{{ fenxiaoTeamNum }}人</text>
                        </view>
                    </view>
                    <view class="flex px-[30rpx] rounded-[16rpx] items-center flex-1 mr-[24rpx] h-[140rpx] fenxiao-bg" @click.stop="redirect({ url: '/addon/shop_fenxiao/pages/child_fenxiao' })">
                        <image class="w-[80rpx] h-[80rpx] mr-[24rpx]" :src="img('addon/shop_fenxiao/index/fenxiao.png')" mode="widthFix"/>
                        <view class="flex flex-col">
                            <text class="text-[26rpx]">分销商</text>
                            <text class="text-[#666] text-[24rpx] mt-[10rpx]">{{ childFenxiaoNum }}人</text>
                        </view>
                    </view>
                </view>

                <view class="commission-bg pb-[35rpx] mx-[24rpx] my-[20rpx] rounded-[16rpx]">
                    <view class="text-[32rpx] h-[90rpx] px-[24rpx] leading-[90rpx] border-0 border-b-[2rpx] border-solid border-[#E0E0E0] text-[28rpx] font-bold">常用功能</view>
                    <view class="flex flex-wrap common-module">
                        <view class="flex items-center flex-col w-[33.3%] py-[20rpx]" @click="redirect({ url: '/addon/shop_fenxiao/pages/promote' })">
                            <image class="w-[60rpx] h-[60rpx]" :src="img('addon/shop_fenxiao/index/code.png')" mode="widthFix"/>
                            <view class="flex flex-col items-center mt-[12rpx]">
                                <text class="text-[24rpx]">邀请好友</text>
                                <text class="text-[22rpx] text-[#aaa] mt-[12rpx]">邀好友赚好礼</text>
                            </view>
                        </view>
                        <view class="flex items-center flex-col w-[33.3%] py-[20rpx]" @click="redirect({ url: '/addon/shop_fenxiao/pages/order' })">
                            <image class="w-[60rpx] h-[60rpx]" :src="img('addon/shop_fenxiao/index/order.png')" mode="widthFix"/>
                            <view class="flex flex-col items-center mt-[12rpx]">
                                <text class="text-[24rpx]">分销订单</text>
                                <text class="text-[22rpx] text-[#aaa] mt-[12rpx]">分销订单明细</text>
                            </view>
                        </view>
                        <view class="flex items-center flex-col w-[33.3%] py-[20rpx]" @click="redirect({ url: '/addon/shop_fenxiao/pages/team_dividend' })">
                            <image class="w-[60rpx] h-[60rpx]" :src="img('addon/shop_fenxiao/index/team2.png')" mode="widthFix"/>
                            <view class="flex flex-col items-center mt-[12rpx]">
                                <text class="text-[24rpx]">团队分红</text>
                                <text class="text-[22rpx] text-[#aaa] mt-[12rpx]">团队分红</text>
                            </view>
                        </view>
                        <view class="flex items-center flex-col w-[33.3%] py-[20rpx]" @click="redirect({ url: '/addon/shop_fenxiao/pages/agent_list' })">
                            <image class="w-[60rpx] h-[60rpx]" :src="img('addon/shop_fenxiao/index/channel.png')" mode="widthFix"/>
                            <view class="flex flex-col items-center mt-[12rpx]">
                                <text class="text-[24rpx]">渠道代理</text>
                                <text class="text-[22rpx] text-[#aaa] mt-[12rpx]">渠道代理</text>
                            </view>
                        </view>
                        <view class="flex items-center flex-col w-[33.3%] py-[20rpx]" @click="redirect({ url: '/addon/shop_fenxiao/pages/task_rewards' })">
                            <image class="w-[60rpx] h-[60rpx]" :src="img('addon/shop_fenxiao/index/task.png')" mode="widthFix"/>
                            <view class="flex flex-col items-center mt-[12rpx]">
                                <text class="text-[24rpx]">{{ t('task') }}</text>
                                <text class="text-[22rpx] text-[#aaa] mt-[12rpx]">{{ t('taskDesc') }}</text>
                            </view>
                        </view>
                        <view class="flex items-center flex-col w-[33.3%] py-[20rpx]" @click="redirect({ url: '/addon/shop_fenxiao/pages/sale' })">
                            <image class="w-[60rpx] h-[60rpx]" :src="img('addon/shop_fenxiao/index/market.png')" mode="widthFix"/>
                            <view class="flex flex-col items-center mt-[12rpx]">
                                <text class="text-[24rpx]">{{ t('sale') }}</text>
                                <text class="text-[22rpx] text-[#aaa] mt-[12rpx]">{{ t('saleDesc') }}</text>
                            </view>
                        </view>
						<view class="flex items-center flex-col w-[33.3%] py-[20rpx]" @click="redirect({ url: '/addon/shop_fenxiao/pages/goods' })">
						    <image class="w-[60rpx] h-[60rpx]" :src="img('addon/shop_fenxiao/index/fenxiao_goods_01.png')" mode="widthFix"/>
						    <view class="flex flex-col items-center mt-[12rpx]">
						        <text class="text-[24rpx]">分销商品</text>
						        <text class="text-[22rpx] text-[#aaa] mt-[12rpx]">分销商品</text>
						    </view>
						</view>
						<!-- <view class="flex items-center flex-col w-[33.3%] py-[20rpx]" @click="redirect({ url: '/addon/shop_fenxiao/pages/zone' })">
						    <image class="w-[60rpx] h-[60rpx]" :src="img('addon/shop_fenxiao/index/fenxiao_prefecture.png')" mode="widthFix"/>
						    <view class="flex flex-col items-center mt-[12rpx]">
						        <text class="text-[24rpx]">分销专区</text>
						        <text class="text-[22rpx] text-[#aaa] mt-[12rpx]">分销专区</text>
						    </view>
						</view> -->
                    </view>
                </view>
            </block>
            <view v-else class="flex flex-col items-center pt-[100rpx]">
                <image class="w-[260rpx] h-[152rpx]" mode="widthFix" :src="img('addon/shop_fenxiao/unopened-fenxiao.png')"></image>
                <view class="mt-[40rpx] text-[24rpx]">{{t('fenxiaoNotOpen')}}</view>
            </view>
        </view>
        <u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>
        <tabbar addon="shop" />
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app'
import { moneyFormat, img, redirect } from '@/utils/common';
import { t } from '@/locale';
import { getFenxiaoDetail, getChildFenxiao, getFenxiaoTeam, getConfig } from '@/addon/shop_fenxiao/api/fenxiao';
import useSystemStore from '@/stores/system'

const systemStore = useSystemStore()
let detail = ref({ 'member': {}, 'fenxiao_level': {} });
let loading = ref<boolean>(true);

onShow(() => {
    setTimeout(()=>{
        if(!systemStore.siteAddons.includes('shop_fenxiao')){
            uni.showToast({
                title: '该站点未安装分销插件',
                icon: 'none'
            });

            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
            return false;
        }
    },500);
	getConfigFn();
	getChildFenxiaoFn();
	getFenxiaoTeamFn();
	getFenxiaoDetail().then((res: any) => {
		let data = res.data;
		if (Object.keys(data).length) {
			detail.value = res.data;
			loading.value = false;
		} else {
			loading.value = true;
			redirect({ url: '/addon/shop_fenxiao/pages/apply',mode: 'redirectTo'})
		}
	});
	
});

const config: Record<string, any> = ref({})
const getConfigFn = () => {
    getConfig().then((res: any) => {
        config.value = Object.assign(config.value, res.data.fenxiao_config)
    })
}

// 分销商数
let childFenxiaoNum = ref(0);
const getChildFenxiaoFn = () => {
	getChildFenxiao().then((res: any) => {
		childFenxiaoNum.value = res.data.length || 0;
	}).catch(() => {
		childFenxiaoNum.value = 0;
	})
}

// 我的团队数
let fenxiaoTeamNum = ref(0);
const getFenxiaoTeamFn = () => {
	getFenxiaoTeam().then((res: any) => {
		fenxiaoTeamNum.value = (res.data.direct.length + res.data.indirect.length) || 0;
	}).catch(() => {
		fenxiaoTeamNum.value = 0;
	})
}

// 申请提现
const applyCashOut = () => {
	uni.setStorageSync('cashOutAccountType', 'commission')
	redirect({ url: '/app/pages/member/apply_cash_out' })
}
// 佣金明细
const cashOutList = () => {
	redirect({ url: '/app/pages/member/detailed_account', param: { type : 'commission' } })
}
// 我的佣金
const toCommission = () => {
	redirect({ url: '/app/pages/member/commission'})
}
</script>

<style lang="scss" scoped>
.level-wrap {
	background: linear-gradient(90deg, #FDE4C0, #FDC274);
}

.commission-bg {
	// background: linear-gradient(180deg, #FFF9F3 5%, #FFFFFF 25%, #FFFFFF 100%);
	background: #FFFFFF;
}

.team-bg {
	background: linear-gradient(135deg, #FFF9F9 10%, #FFFFFF 40%, #FFFFFF 100%);
}

.fenxiao-bg {
	background: linear-gradient(135deg, #F8FEFF 10%, #FFFFFF 40%, #FFFFFF 100%);
}

.commission-content>view {
	position: relative;
	width: 210rpx;

	&::after {
		content: "";
		position: absolute;
		width: 2rpx;
		height: 60rpx;
		background-color: #D9D9D9;
		top: 50%;
		right: 0;
		transform: translateY(-50%);
	}

	&:last-of-type::after {
		width: 0;
		height: 0;
	}
}

.common-module>view {
	position: relative;

	&::after {
		content: "";
		position: absolute;
		width: 2rpx;
		height: 80rpx;
		background-color: #E0E0E0;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
	}

	&:nth-child(3n+1)::after {
		width: 0;
		height: 0;
	}
}</style>