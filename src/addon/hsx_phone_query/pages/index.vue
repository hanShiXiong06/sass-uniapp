<template>
    <view class="page">
        <!-- 顶部导航 -->
        <view class="header" v-if="lists.length && config.search.control">
            <up-tabs :list="lists" @click="handleClick"></up-tabs>
        </view>

        <!-- 主体内容区 -->
        <view class="main" :class="{ 'has-header': config.search.control }">
            <!-- 左侧分类 -->
            <view class="sidebar">
                <scroll-view scroll-y class="sidebar-scroll">
                    <view v-for="(item, index) in lists[current]?.child" :key="index" class="sidebar-item"
                        :class="{ 'active': index === tabActive }" @click="firstLevelClick(index, item)">
                        {{ item.name }}
                    </view>
                </scroll-view>
            </view>

            <!-- 右侧内容 -->
            <view class="content">
                <scroll-view scroll-y class="content-scroll">
                    <!-- 查询面板 -->
                    <view class="query-panel">
                        <!-- 用户账户信息 -->
                        <view class="account-info">
                            <view class="info-item">
                                <text class="label">账户余额</text>
                                <text class="value">¥{{ memberInfo?.balance || '0.00' }}</text>
                            </view>
                            <view class="info-item">
                                <text class="label">可用积分</text>
                                <text class="value">{{ memberInfo?.point || 0 }}</text>
                            </view>
                        </view>

                        <!-- 标题和价格区域合并 -->
                        <view class="panel-header">
                            <view class="header-main">
                                <text class="title">{{ lists[current]?.child[tabActive]?.name }}</text>
                                <view class="price-info">
                                    <view class="price-item" :class="{ active: payType === 'balance' }"
                                        @click="payType = 'balance'">
                                        <text class="value">¥{{ lists[current]?.child[tabActive]?.price }}</text>
                                        <text class="label">余额支付</text>
                                    </view>
                                    <view class="price-item" :class="{ active: payType === 'point' }"
                                        @click="payType = 'point'">
                                        <text class="value">{{ (lists[current]?.child[tabActive]?.price *
                                            100).toFixed(0) }}</text>
                                        <text class="label">积分支付</text>
                                    </view>
                                </view>
                            </view>
                        </view>

                        <!-- 查询输入区域 -->
                        <view class="query-box">
                            <view class="input-area">
                                <textarea v-model="imeis" class="query-input"
                                    placeholder="请输入需要查询的手机串号&#13;&#10;支持多串号查询中间使用空格或者逗号分割&#13;&#10;例如：IMEI/SN/序列号&#13;&#10;iOS设备：拨打 *#06# 可显示IMEI码&#13;&#10;部分安卓设备:拨打 *#09# 可显示IMEI码"
                                    :auto-height="true" :show-confirm-bar="false" @input="handleInput"></textarea>
                                <view class="scan-btn" @click="handleScan">
                                    <u-icon name="scan" size="40" color="var(--primary-color)"></u-icon>
                                </view>
                            </view>
                            <view class="query-actions">
                                <view class="query-btn" :class="{ 'disabled': loading || !imeis }"
                                    @click="handleQuery(lists[current]?.child[tabActive]?.id)">
                                    <text class="btn-text">立即查询</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </scroll-view>

                <!-- 快捷功能区 -->
                <view class="quick-links">
                    <navigator url="/addon/hsx_phone_query/pages/history" class="link-item">
                        <text class="icon">📋</text>
                        <text>查询记录</text>
                    </navigator>
                    <navigator url="/addon/recharge/pages/recharge" class="link-item">
                        <text class="icon">💰</text>
                        <text>账户充值</text>
                    </navigator>
                    <navigator url="/app/pages/member/index" class="link-item">
                        <text class="icon">👤</text>
                        <text>个人中心</text>
                    </navigator>
                </view>




            </view>
        </view>

        <!-- 加载中 -->
        <view class="loading" v-if="loading">
            <u-loading-icon></u-loading-icon>
        </view>
    </view>

    <!-- 支付方式选择弹窗 -->
    <u-popup v-model="showPayTypeSelect" mode="bottom" border-radius="24">
        <view class="pay-type-popup">
            <view class="popup-header">
                <text class="title">选择支付方式</text>
                <u-icon name="close" size="32" @click="showPayTypeSelect = false"></u-icon>
            </view>
            <view class="pay-type-list">
                <view class="pay-type-item" @click="handleQuery(lists[current]?.child[tabActive]?.id, 'balance')">
                    <view class="item-left">
                        <u-icon name="rmb-circle" size="40" color="#1890ff"></u-icon>
                        <view class="item-info">
                            <text class="name">余额支付</text>
                            <text class="desc">当前余额: ¥{{ memberInfo?.balance || '0.00' }}</text>
                        </view>
                    </view>
                    <text class="price">¥{{ lists[current]?.child[tabActive]?.price }}</text>
                </view>
                <view class="pay-type-item" @click="handleQuery(lists[current]?.child[tabActive]?.id, 'point')">
                    <view class="item-left">
                        <u-icon name="integral" size="40" color="#722ed1"></u-icon>
                        <view class="item-info">
                            <text class="name">积分支付</text>
                            <text class="desc">当前积分: {{ memberInfo?.point || 0 }}</text>
                        </view>
                    </view>
                    <text class="price">{{ (lists[current]?.child[tabActive]?.price * 100).toFixed(0) }}积分</text>
                </view>
            </view>
        </view>
    </u-popup>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

import { img, redirect } from '@/utils/common';

import { getCategoryTree, getQueryModelList, getModelList } from '@/addon/hsx_phone_query/api/index'
import { onLoad, onShow } from '@dcloudio/uni-app'

import useMemberStore from "@/stores/member";
import { useLogin } from "@/hooks/useLogin";
import { getMemberInfo } from '@/app/api/member'

const prop = defineProps({
    config: {
        type: Object,
        default: (() => {
            return {
            }
        })
    },
    categoryId: {
        type: [String, Number],
        default: 0
    }
})

// 轮播图数据
const bannerList = ref([
    'https://media.niucloud.com/1704066345d7742c4c0a1a941e836e8d633f209396_aliyun.jpg',
    'https://media.niucloud.com/17040664219c6ce47b234eac495c3c4aa6e83920b6_aliyun.png',
    'https://media.niucloud.com/17040665085ed007bd6daf220cc1ecd4e301c6008f_aliyun.png',

])

// 轮播图点击事件
const clickBanner = (index: number) => {
    console.log('点击了轮播图:', index)
}

let config = {
    "level": 1,
    "template": "style-1",
    "page_title": "商品分类",
    "search": {
        "control": 1,
        "title": "请输入搜索型号"
    },
    "goods": {
        "style": "single-cols"
    },
    "sort": "default",
    "cart": {
        "control": 0,
        "event": "detail",
        "style": "style-1",
        "text": "购买"
    }
}

let categoryId = prop.categoryId;
const searchName = ref("");
const loading = ref<boolean>(true);
const imeis = ref("");
const modelsInfo = ref([])

// 一级菜单样式控制
const tabActive = ref<number>(0)

// 一级菜单点击事件
const firstLevelClick = (index: number, data: Object) => {
    tabActive.value = index;
}

const memberStore = useMemberStore();
const userInfo = computed(() => memberStore.info);
let helloWorld = ref('');
const lists = ref([]);
const current = ref(0);

onLoad(async () => {
    await getCategoryTree().then((res) => {
        lists.value = res.data;
        loading.value = false
    })
})

const handleClick = (index: any, item: any) => {
    current.value = index.index;
    // 切换的时候 将数据都清空
    // 分类id 回到第一个
    tabActive.value = 0
    modelsInfo.value = []
    imeis.value = ''
}

// 处理输入，统一换行符
const handleInput = (e: any) => {
    const value = e.detail.value
    imeis.value = value.replace(/\r\n/g, '\n')
}

// 支付方式
const payType = ref('balance')

// 修改查询方法
const handleQuery = async (id: number) => {
    // 分割并过滤空行
    const imeiList = imeis.value.split('\n').filter(item => item.trim())

    if (!imeiList.length) {
        uni.showToast({
            title: '请输入手机SN',
            icon: 'error',
            duration: 2000
        })
        return
    }

    if (loading.value) return

    try {
        loading.value = true
        // 将多行IMEI合并为一个字符串，用逗号分隔
        const imeiString = imeiList.join(',')

        const res = await getQueryModelList({
            imeis: imeiString,
            id,
            payType: payType.value,
            pid: current.value
        })

        if (res.code === 1) {
            uni.showToast({
                title: '查询成功',
                icon: 'success'
            })
            uni.navigateTo({
                url: `/addon/hsx_phone_query/pages/detail?id=${res.data.id}`
            })
        }
    } catch (err) {
        uni.showToast({
            title: err.msg || '查询失败',
            icon: 'none',
            duration: 2000
        })
    } finally {
        loading.value = false
    }
}

const modelList = ref([])
const _getModelList = (id: number) => {
    getModelList().then(res => {
        modelList.value = res.data.data
        loading.value = false
    })
}

const toRecharge = () => {
    redirect({ url: '/addon/recharge/pages/recharge', mode: 'navigateTo' })
}

// 统一的扫码处理
const handleScan = async () => {
    try {
        const res = await uni.scanCode({
            success: (res) => {
                imeis.value = res.result;
            }
        });
    } catch (error) {
        uni.showToast({
            title: '扫码失败',
            icon: 'none'
        });
    }
}

// 添加会员信息
const memberInfo = ref(null)

// 获取会员信息
const _getMemberInfo = async () => {
    try {
        const res = await getMemberInfo()
        if (res.code === 1) {
            memberInfo.value = res.data
        }
    } catch (error) {
        console.error('获取会员信息失败:', error)
    }
}

onMounted(() => {
    _getMemberInfo()
})
onShow(() => {
    _getMemberInfo()
})

// 控制提示的显示/隐藏
const showTips = ref(false)

// 切换提示显示状态
const toggleTips = () => {
    showTips.value = !showTips.value
}

// 支付方式选择弹窗
const showPayTypeSelect = ref(false)
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: #f7f8fa;
}

.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 88rpx;
    background: #fff;
    z-index: 100;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.main {
    display: flex;
    height: calc(100vh - 100rpx);
    padding-top: 0;
    background: #fff;

    &.has-header {
        padding-top: 88rpx;
        box-sizing: border-box;
    }
}

.sidebar {
    width: 220rpx;
    background: #fff;
    border-right: 2rpx solid #f0f0f0;

    &-scroll {
        height: 100%;
    }

    &-item {
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 12rpx;
        font-size: 24rpx;
        color: #666;
        position: relative;

        &.active {
            color: var(--primary-color);
            background: #f5f7fa;
            font-weight: 500;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                height: 32rpx;
                width: 4rpx;
                background: var(--primary-color);
                top: 50%;
                transform: translateY(-50%);
            }
        }
    }
}

.content {
    flex: 1;
    overflow: hidden;
    background: #f7f8fa;
    padding: 12rpx;
    padding-bottom: 120rpx;
    box-sizing: border-box;
}

.query-panel {
    background: #fff;
    border-radius: 24rpx;
    padding: 16rpx;
    box-sizing: border-box;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.account-info {
    display: flex;
    justify-content: space-between;
    padding: 24rpx 30rpx;
    background: linear-gradient(135deg, #2979ff 0%, #5cadff 100%);
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg,
                rgba(255, 255, 255, 0.1) 0%,
                rgba(255, 255, 255, 0.2) 50%,
                rgba(255, 255, 255, 0.1) 100%);
        transform: skewX(-20deg);
    }

    .info-item {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .label {
            font-size: 24rpx;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 8rpx;
        }

        .value {
            font-size: 36rpx;
            font-weight: 600;
            color: #fff;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
        }
    }
}

.panel-header {
    margin-bottom: 32rpx;

    .header-main {
        .title {
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 16rpx;
            display: block;
        }

        .price-info {
            display: flex;
            gap: 32rpx;

            .price-item {
                background: #f7f8fa;
                padding: 16rpx 24rpx;
                border-radius: 12rpx;
                text-align: center;
                position: relative;
                transition: all 0.3s;

                &.active {
                    background: var(--primary-color);

                    .value,
                    .label {
                        color: #fff;
                    }

                    &::after {
                        content: '';
                        position: absolute;
                        right: 8rpx;
                        top: 8rpx;
                        width: 16rpx;
                        height: 16rpx;
                        border-radius: 50%;
                        background: #fff;
                    }
                }

                .value {
                    font-size: 32rpx;
                    color: var(--primary-color);
                    font-weight: 500;
                    margin-bottom: 4rpx;
                    display: block;
                }

                .label {
                    font-size: 24rpx;
                    color: #999;
                }
            }
        }
    }
}

.query-box {
    .input-area {
        position: relative;
        margin-bottom: 24rpx;

        .query-input {
            width: 100%;
            min-height: 200rpx;
            background: #f7f8fa;
            border-radius: 16rpx;
            padding: 24rpx;
            font-size: 24rpx;
            box-sizing: border-box;
            line-height: 1.6;
        }

        .scan-btn {
            position: absolute;
            right: 16rpx;
            bottom: 16rpx;
            padding: 16rpx;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
        }
    }

    .query-actions {
        margin-top: 32rpx;

        .query-btn {
            height: 100rpx;
            background: linear-gradient(135deg, #1890ff, #096dd9);
            border-radius: 50rpx;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            position: relative;
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg,
                        rgba(255, 255, 255, 0.1) 0%,
                        rgba(255, 255, 255, 0.2) 50%,
                        rgba(255, 255, 255, 0.1) 100%);
                transform: skewX(-20deg);
                transition: transform 0.3s;
            }

            &:active::before {
                transform: skewX(-20deg) translateX(100%);
            }

            .btn-text {
                font-size: 36rpx;
                font-weight: 500;
                margin-bottom: 4rpx;
            }

            .btn-desc {
                font-size: 24rpx;
                opacity: 0.9;
            }

            &.disabled {
                opacity: 0.6;
                pointer-events: none;
            }
        }
    }
}

.quick-links {

    margin-top: 10rpx;
    padding: 20rpx;
    background: #fff;
    display: flex;
    border-radius: 20rpx;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);

    .link-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10rpx 20rpx;
        border-radius: 12rpx;
        transition: all 0.3s;

        .icon {
            font-size: 40rpx;
            margin-bottom: 8rpx;
        }

        text {
            font-size: 24rpx;
            color: #666;
        }

        &:active {
            background: #f5f5f5;
        }
    }
}

.loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100rpx;
    background: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
    z-index: 99;

    .tabbar-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        font-size: 24rpx;

        text {
            margin-top: 4rpx;
        }

        &:active {
            opacity: 0.8;
        }
    }
}

.pay-type-popup {
    padding: 32rpx;

    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32rpx;

        .title {
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
        }
    }

    .pay-type-list {
        .pay-type-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24rpx;
            background: #f7f8fa;
            border-radius: 16rpx;
            margin-bottom: 20rpx;

            &:active {
                opacity: 0.8;
            }

            .item-left {
                display: flex;
                align-items: center;
                gap: 20rpx;

                .item-info {
                    .name {
                        font-size: 28rpx;
                        color: #333;
                        margin-bottom: 4rpx;
                        display: block;
                    }

                    .desc {
                        font-size: 24rpx;
                        color: #999;
                    }
                }
            }

            .price {
                font-size: 32rpx;
                font-weight: 500;
                color: #333;
            }
        }
    }
}
</style>
