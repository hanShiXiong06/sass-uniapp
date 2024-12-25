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


                <!-- 轮播图 -->
                <!-- <view class="swiper-box">
                    <u-swiper :list="bannerList" :indicator="true" :autoplay="true" :interval="3000" :duration="500"
                        :height="130" :radius="8" @click="clickBanner"></u-swiper>
                            </view> -->




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
                                    <view class="price-item">
                                        <text class="value">¥{{ lists[current]?.child[tabActive]?.price }}</text>
                                        <text class="label">查询价格</text>
                                    </view>
                                    <view class="price-item">
                                        <text class="value">{{ (lists[current]?.child[tabActive]?.price *
                                            100).toFixed(0)
                                            }}</text>
                                        <text class="label">所需积分</text>
                                    </view>
                                </view>
                            </view>
                        </view>

                        <!-- 查询输入区域 -->
                        <view class="query-box">
                            <view class="input-area">
                                <textarea v-model="imeis" class="query-input"
                                    placeholder="请输入需要查询的手机串号&#13;&#10;例如：IMEI/SN/序列号&#13;&#10;iOS设备：拨打 *#06# 可显示IMEI码&#13;&#10;安卓设备:拨打 *#09# 可显示IMEI码"
                                    :auto-height="true" :show-confirm-bar="false" @input="handleInput"></textarea>
                                <view class="scan-btn" @click="handleScan">
                                    <u-icon name="scan" size="40" color="var(--primary-color)"></u-icon>
                                </view>
                            </view>
                            <view class="query-actions">
                                <up-button type="primary" class="action-btn"
                                    @click="handleQuery(lists[current]?.child[tabActive]?.id, 'point')">积分查询</up-button>
                                <up-button type="primary" class="action-btn"
                                    @click="handleQuery(lists[current]?.child[tabActive]?.id, 'balance')">余额查询</up-button>
                            </view>
                        </view>

                        <!-- 查询说明部分 -->
                        <view class="tips-collapse">
                            <view class="collapse-header" @click="toggleTips">
                                <view class="header-left">
                                    <text class="icon">📋</text>
                                    <text class="title">查询说明</text>
                                </view>
                                <u-icon :name="showTips ? 'arrow-up' : 'arrow-down'" size="20" color="#666"></u-icon>
                            </view>

                            <view class="collapse-content" v-show="showTips">
                                <!-- IMEI获取说明 -->
                                <view class="tips-section">
                                    <text class="section-title">获取IMEI方式</text>
                                    <text class="tips-text">• iOS设备：拨打 *#06# 可显示IMEI码</text>
                                    <text class="tips-text">• 安卓设备:拨打 *#09# 可显示IMEI码</text>
                                </view>

                                <!-- 查询说明 -->
                                <view class="tips-section">
                                    <text class="section-title">注意事项</text>
                                    <text class="tips-text">• 暂不支持批量查询，每行输入一个串号</text>
                                    <text class="tips-text">• 查询结果将在查询记录中展示</text>
                                    <text class="tips-text">• 查询消耗积分或余额，请确保账户充足</text>
                                    <text class="tips-text">• 查询重复项目及串号不扣费</text>
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
                    <navigator open-type="switchTab" url="/app/pages/member/index" class="link-item">
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

// 修改查询方法，支持多行
const handleQuery = async (id: any, payType: string) => {
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

    loading.value = true
    try {
        // 将多行IMEI合并为一个字符串，用逗号分隔
        const imeiString = imeiList.join(',')

        const res = await getQueryModelList({ imeis: imeiString, id, payType, pid: current.value })
        if (res.code === 1) {
            uni.showToast({
                title: '查询成功',
                icon: 'none',
                duration: 2000
            })
            redirect({ url: '/addon/hsx_phone_query/pages/history', mode: 'navigateTo' })
        }
    } catch (err) {
        uni.showToast({
            title: err.msg || '查询失败',
            icon: 'none',
            duration: 2000
        })
    } finally {
        imeis.value = ''
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
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: #f5f7fa;
}

.swiper-box {
    margin: 20rpx;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);


}

// 调整查询面板的边距
.query-panel {
    margin-top: 0; // 由于上面有轮播图，减少顶部边距
    height: 765rpx;
    overflow: scroll;
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
    height: 100vh;
    padding-top: 0;

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

    &-scroll {

        padding: 24rpx;
        box-sizing: border-box;
    }
}

.query-panel {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

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
        margin-top: 30rpx;

        .header-main {
            .title {
                font-size: 32rpx;
                font-weight: 600;
                color: #333;
                margin-bottom: 20rpx;
            }

            .price-info {
                display: flex;
                gap: 40rpx;

                .price-item {
                    .value {
                        font-size: 36rpx;
                        font-weight: 600;
                        color: var(--primary-color);
                        margin-bottom: 4rpx;
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
        margin: 30rpx 0;

        .input-area {
            position: relative;
            margin-bottom: 20rpx;

            .query-input {
                background: #f8f9fa;
                border-radius: 12rpx;
                padding: 20rpx;
                width: 100%;
                min-height: 200rpx;
                font-size: 23rpx;
                box-sizing: border-box;
            }

            .scan-btn {
                position: absolute;
                right: 13rpx;
                bottom: 13rpx;
                padding: 0rpx;
                cursor: pointer;

                &:active {
                    opacity: 0.8;
                }
            }
        }

        .query-actions {
            display: flex;
            gap: 20rpx;

            .action-btn {
                flex: 1;
                height: 88rpx;
                font-size: 28rpx;
            }
        }
    }

    .tips-collapse {
        background: #f8f9fa;
        border-radius: 12rpx;
        margin-bottom: 20rpx;

        .collapse-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20rpx;
            cursor: pointer;

            .header-left {
                display: flex;
                align-items: center;
                gap: 8rpx;

                .icon {
                    font-size: 32rpx;
                }

                .title {
                    font-size: 28rpx;
                    font-weight: 500;
                    color: #333;
                }
            }
        }

        .collapse-content {
            padding: 0 20rpx 20rpx;
            border-top: 1px solid rgba(0, 0, 0, 0.05);

            .tips-section {
                margin-top: 16rpx;

                .section-title {
                    font-size: 26rpx;
                    color: #666;
                    margin-bottom: 8rpx;
                    display: block;
                }

                .tips-text {
                    display: block;
                    font-size: 24rpx;
                    color: #999;
                    line-height: 1.8;
                }

                &:not(:last-child) {
                    margin-bottom: 16rpx;
                }
            }
        }
    }
}

.quick-links {
    margin: 24rpx;
    display: flex;
    justify-content: space-around;
    margin-top: 24rpx;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;

    .link-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8rpx;

        .icon {
            font-size: 40rpx;
        }

        text {
            font-size: 24rpx;
            color: #666;
        }
    }
}

.loading {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
}
</style>
