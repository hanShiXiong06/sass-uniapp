<template>
    <view class="order-list">
        <!-- 状态切换栏 -->
        <view class="status-tabs">
            <scroll-view scroll-x class="tabs-scroll" :scroll-x="true">
                <view v-for="(text, key) in orderStatusOptions" :key="key" class="tab-item"
                    :class="{ active: currentStatus === key }" @click="handleStatusChange(key)">
                    <text class="tab-text">{{ text.label }}</text>
                    <text class="tab-count" v-if="statusCount[key]">{{ statusCount[key] }}</text>
                </view>
            </scroll-view>
        </view>

        <!-- 搜索栏 -->
        <view class="search-bar">
            <view class="search-input">
                <uni-icons type="search" size="16" color="#999"></uni-icons>
                <input type="text" v-model="searchForm.keyword" placeholder="搜索订单号/手机型号" @confirm="handleSearch" />
            </view>
            <view class="filter-btn" @click="showFilter = true">
                <uni-icons type="filter" size="20" color="#666"></uni-icons>
            </view>
        </view>

        <!-- 订单列表 -->
        <view class="order-list-content">
            <template v-if="orderList.length > 0">
                <view class="order-item" v-for="order in orderList" :key="order.id" @click="goToDetail(order.id)">
                    <view class="order-header">
                        <text class="order-no">订单号：{{ order.order_no }}</text>
                        <text :class="['order-status', `status-${order.status}`]">
                            {{ getOrderStatusText(order.status) }}
                        </text>
                    </view>
                    <view class="device-stats">
                        <view class="stats-item">
                            <text class="label">设备总数</text>
                            <text class="value">{{ order.device_stats.total }}</text>
                        </view>
                        <view class="stats-item">
                            <text class="label">总金额</text>
                            <text class="value price">¥{{ order.device_stats.total_amount }}</text>
                        </view>
                    </view>
                    <view class="order-footer">
                        <text class="time">{{ formatTime(order.create_at) }}</text>
                    </view>
                </view>
            </template>
            <template v-else>
                <view class="empty-state">
                    <image src="/static/empty.png" mode="aspectFit" class="empty-image"></image>
                    <text class="empty-text">暂无订单数据</text>
                </view>
            </template>
            <uni-load-more :status="loadMoreStatus" />
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { OrderStatus, DeviceStatus } from '@/types/order'

// 定义状态选项
const orderStatusOptions = {
    'all': { label: '全部', value: '' },
    'pending': { label: '待收货', value: '1' },
    'checking': { label: '待质检', value: '2' },
    'processing': { label: '质检中', value: '3' },
    'confirmed': { label: '待确认', value: '4' },
    'payment': { label: '待打款', value: '5' },
    'completed': { label: '已完成', value: '6' },
    'returned': { label: '待退货', value: '7' },
    'shipped': { label: '已寄出', value: '8' },
    'closed': { label: '已关闭', value: '9' }
} as const

// 状态统计
const statusCount = reactive<Record<string, number>>({
    'all': 0,
    'pending': 0,
    'checking': 0,
    'processing': 0,
    'confirmed': 0,
    'payment': 0,
    'completed': 0,
    'returned': 0,
    'shipped': 0,
    'closed': 0
})

// 当前选中的状态
const currentStatus = ref<keyof typeof orderStatusOptions>('all')

// 搜索表单
const searchForm = reactive({
    keyword: '',
    status: '',
    start_date: '',
    end_date: ''
})

// 列表数据
const orderList = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const loadMoreStatus = ref<'more' | 'loading' | 'noMore'>('more')

// 处理状态切换
const handleStatusChange = (status: keyof typeof orderStatusOptions) => {
    currentStatus.value = status
    searchForm.status = orderStatusOptions[status].value
    page.value = 1
    getList(true)
}

// 获取订单列表
const getList = async (reset = false) => {
    if (reset) {
        page.value = 1
        orderList.value = []
    }

    loadMoreStatus.value = 'loading'
    try {
        const res = await getOrderList({
            page: page.value,
            limit: limit.value,
            ...searchForm
        })

        if (res.code === 1) {
            const newOrders = res.data.data || []
            if (reset) {
                orderList.value = newOrders
            } else {
                orderList.value.push(...newOrders)
            }
            total.value = res.data.total || 0

            // 更新状态统计
            updateStatusCount(newOrders)

            loadMoreStatus.value = orderList.value.length >= total.value ? 'noMore' : 'more'
        }
    } catch (error) {
        console.error('获取订单列表失败:', error)
        loadMoreStatus.value = 'more'
    }
}

// 更新状态统计
const updateStatusCount = (orders: any[]) => {
    // 重置计数
    Object.keys(statusCount).forEach(key => {
        statusCount[key] = 0
    })

    // 统计各状态数量
    orders.forEach(order => {
        const status = order.status
        const statusKey = Object.keys(orderStatusOptions).find(
            key => orderStatusOptions[key].value === String(status)
        )
        if (statusKey) {
            statusCount[statusKey]++
        }
        statusCount.all++
    })
}

// 页面加载
onMounted(() => {
    getList(true)
})

// 下拉刷新
const onPullDownRefresh = () => {
    getList(true).then(() => {
        uni.stopPullDownRefresh()
    })
}

// 触底加载更多
const onReachBottom = () => {
    if (loadMoreStatus.value === 'more') {
        page.value++
        getList()
    }
}
</script>

<style lang="scss">
.order-list {
    min-height: 100vh;
    background: #f5f5f5;

    .status-tabs {
        background: #fff;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #eee;

        .tabs-scroll {
            white-space: nowrap;
            padding: 0 20rpx;
        }

        .tab-item {
            display: inline-block;
            padding: 16rpx 24rpx;
            margin-right: 20rpx;
            border-radius: 32rpx;
            background: #f5f5f5;
            transition: all 0.3s;

            &.active {
                background: #e6f7ff;
                color: #1890ff;
            }

            .tab-text {
                font-size: 28rpx;
            }

            .tab-count {
                margin-left: 8rpx;
                font-size: 24rpx;
                color: #999;
            }
        }
    }

    .search-bar {
        padding: 20rpx;
        background: #fff;
        display: flex;
        align-items: center;

        .search-input {
            flex: 1;
            height: 72rpx;
            background: #f5f5f5;
            border-radius: 36rpx;
            display: flex;
            align-items: center;
            padding: 0 30rpx;

            input {
                flex: 1;
                margin-left: 20rpx;
                font-size: 28rpx;
            }
        }
    }

    .order-list-content {
        padding: 20rpx;

        .order-item {
            background: #fff;
            border-radius: 12rpx;
            padding: 30rpx;
            margin-bottom: 20rpx;

            .order-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20rpx;
            }

            .device-stats {
                display: flex;
                padding: 20rpx 0;
                border-top: 1rpx solid #eee;
                border-bottom: 1rpx solid #eee;

                .stats-item {
                    flex: 1;
                    text-align: center;

                    .label {
                        font-size: 24rpx;
                        color: #666;
                    }

                    .value {
                        font-size: 32rpx;
                        color: #333;
                        margin-top: 8rpx;

                        &.price {
                            color: #f56c6c;
                        }
                    }
                }
            }
        }
    }

    .empty-state {
        padding: 100rpx 0;
        text-align: center;

        .empty-image {
            width: 200rpx;
            height: 200rpx;
        }

        .empty-text {
            font-size: 28rpx;
            color: #999;
            margin-top: 20rpx;
        }
    }
}
</style>