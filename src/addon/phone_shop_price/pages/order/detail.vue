<template>
    <view class="order-detail">
        <!-- 订单状态卡片 -->
        <view class="status-card">
            <view class="status-title">
                <text class="status-text">{{ getOrderStatusText(orderInfo.status) }}</text>
                <text class="order-no">订单号：{{ orderInfo.order_no }}</text>
            </view>
            <view class="status-desc">{{ getStatusDescription(orderInfo.status) }}</view>
        </view>

        <!-- 设备列表 -->
        <view class="devices-list">
            <view class="section-title">设备列表</view>
            <view class="device-item" v-for="device in orderInfo.devices" :key="device.id">
                <view class="device-header">
                    <text class="device-model">{{ device.model }}</text>
                    <text :class="['device-status', getDeviceStatusClass(device.status)]">
                        {{ getDeviceStatusText(device.status) }}
                    </text>
                </view>
                <view class="device-info">
                    <view class="info-item">
                        <text class="label">IMEI：</text>
                        <text class="value">{{ device.imei }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">预估价格：</text>
                        <text class="value">¥{{ device.initial_price }}</text>
                    </view>
                    <view class="info-item" v-if="device.final_price">
                        <text class="label">最终价格：</text>
                        <text class="value">¥{{ device.final_price }}</text>
                    </view>
                    <view class="info-item" v-if="device.check_result">
                        <text class="label">验机结果：</text>
                        <text class="value">{{ device.check_result }}</text>
                    </view>
                </view>
                <!-- 设备操作按钮 -->
                <view class="device-actions" v-if="showDeviceActions(device.status)">
                    <button class="action-btn confirm" v-if="device.status === 4" @click="handleDeviceConfirm(device)">
                        确认价格
                    </button>
                    <button class="action-btn reject" v-if="device.status === 4" @click="handleDeviceReject(device)">
                        不卖了
                    </button>
                </view>
            </view>
        </view>

        <!-- 订单信息 -->
        <view class="order-info">
            <view class="section-title">订单信息</view>
            <view class="info-list">
                <view class="info-item">
                    <text class="label">寄件人：</text>
                    <text class="value">{{ orderInfo.send_username }}</text>
                </view>
                <view class="info-item">
                    <text class="label">联系电话：</text>
                    <text class="value">{{ orderInfo.telphone }}</text>
                </view>
                <view class="info-item">
                    <text class="label">收款方式：</text>
                    <text class="value">{{ orderInfo.pay_type }}</text>
                </view>
                <view class="info-item">
                    <text class="label">收款账号：</text>
                    <text class="value">{{ orderInfo.account }}</text>
                </view>
                <view class="info-item">
                    <text class="label">创建时间：</text>
                    <text class="value">{{ formatTime(orderInfo.create_at) }}</text>
                </view>
            </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="bottom-actions" v-if="showOrderActions">
            <button class="action-btn" @click="handleOrderCancel" v-if="canCancel">取消订单</button>
            <button class="action-btn primary" @click="handleOrderConfirm" v-if="canConfirm">确认收款</button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail } from '@/addon/phone_shop_price/api/order'
import { formatDate } from '@/utils/common'

const orderInfo = ref<any>({})
const loading = ref(false)

// 获取订单详情
const loadOrderDetail = async (id: string) => {
    loading.value = true
    try {
        const res = await getOrderDetail(id)
        if (res.code === 1) {
            orderInfo.value = res.data
        }
    } catch (error) {
        console.error('获取订单详情失败:', error)
    } finally {
        loading.value = false
    }
}

// 状态文本映射
const orderStatusMap = {
    1: '待收货',
    2: '待质检',
    3: '质检中',
    4: '待确认',
    5: '待打款',
    6: '已完成',
    7: '待退货',
    8: '已寄出',
    9: '已关闭'
}

const deviceStatusMap = {
    1: '待质检',
    2: '质检中',
    3: '质检完成',
    4: '待确认',
    5: '已完成',
    6: '退回'
}

// 获取订单状态文本
const getOrderStatusText = (status: number) => {
    return orderStatusMap[status] || '未知状态'
}

// 获取设备状态文本
const getDeviceStatusText = (status: number) => {
    return deviceStatusMap[status] || '未知状态'
}

// 获取状态描述
const getStatusDescription = (status: number) => {
    const descriptions = {
        1: '等待商家确认收货',
        2: '设备已收到，等待质检',
        3: '正在进行设备质检',
        4: '请确认质检结果和价格',
        5: '正在处理打款',
        6: '交易已完成',
        7: '请等待退货',
        8: '退货已寄出',
        9: '订单已关闭'
    }
    return descriptions[status] || ''
}

// 获取设备状态样式类
const getDeviceStatusClass = (status: number) => {
    const classMap = {
        1: 'status-pending',
        2: 'status-checking',
        3: 'status-checked',
        4: 'status-confirm',
        5: 'status-completed',
        6: 'status-returned'
    }
    return classMap[status] || 'status-default'
}

// 是否显示设备操作按钮
const showDeviceActions = (status: number) => {
    return status === 4 // 只在待确认状态显示操作按钮
}

// 是否显示订单操作按钮
const showOrderActions = computed(() => {
    const status = orderInfo.value?.status
    return status && [1, 4, 5].includes(status)
})

// 是否可以取消订单
const canCancel = computed(() => {
    const status = orderInfo.value?.status
    return status === 1 // 只有待收货状态可以取消
})

// 是否可以确认收款
const canConfirm = computed(() => {
    const status = orderInfo.value?.status
    return status === 5 // 只有待打款状态可以确认收款
})

// 设备操作处理函数
const handleDeviceConfirm = async (device: any) => {
    uni.showModal({
        title: '确认提示',
        content: `确认接受设备 ${device.model} 的最终价格 ¥${device.final_price}？`,
        success: (res) => {
            if (res.confirm) {
                // TODO: 调用确认接口
                uni.showToast({ title: '确认成功', icon: 'success' })
            }
        }
    })
}

const handleDeviceReject = async (device: any) => {
    uni.showModal({
        title: '确认提示',
        content: `确认不出售设备 ${device.model}？`,
        success: (res) => {
            if (res.confirm) {
                // TODO: 调用拒绝接口
                uni.showToast({ title: '已拒绝', icon: 'success' })
            }
        }
    })
}

// 订单操作处理函数
const handleOrderCancel = () => {
    uni.showModal({
        title: '确认提示',
        content: '确认取消订单？',
        success: (res) => {
            if (res.confirm) {
                // TODO: 调用取消订单接口
                uni.showToast({ title: '订单已取消', icon: 'success' })
            }
        }
    })
}

const handleOrderConfirm = () => {
    uni.showModal({
        title: '确认提示',
        content: '确认已收到款项？',
        success: (res) => {
            if (res.confirm) {
                // TODO: 调用确认收款接口
                uni.showToast({ title: '确认成功', icon: 'success' })
            }
        }
    })
}

// 格式化时间
const formatTime = (timestamp: number) => {
    return formatDate(timestamp * 1000, 'YYYY-MM-DD HH:mm:ss')
}

// 页面加载
onLoad((options) => {
    if (options.id) {
        loadOrderDetail(options.id)
    }
})
</script>

<style lang="scss">
.order-detail {
    padding: 20rpx;
    background: #f5f5f5;
    min-height: 100vh;

    .status-card {
        background: #fff;
        border-radius: 12rpx;
        padding: 30rpx;
        margin-bottom: 20rpx;

        .status-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;

            .status-text {
                font-size: 32rpx;
                font-weight: bold;
                color: #333;
            }

            .order-no {
                font-size: 24rpx;
                color: #999;
            }
        }

        .status-desc {
            font-size: 26rpx;
            color: #666;
        }
    }

    .section-title {
        font-size: 30rpx;
        font-weight: bold;
        margin-bottom: 20rpx;
        color: #333;
    }

    .devices-list {
        background: #fff;
        border-radius: 12rpx;
        padding: 30rpx;
        margin-bottom: 20rpx;

        .device-item {
            border-bottom: 1px solid #eee;
            padding: 20rpx 0;

            &:last-child {
                border-bottom: none;
            }

            .device-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20rpx;

                .device-model {
                    font-size: 28rpx;
                    font-weight: bold;
                }

                .device-status {
                    font-size: 24rpx;
                    padding: 4rpx 12rpx;
                    border-radius: 8rpx;

                    &.status-pending {
                        background: #fef0f0;
                        color: #f56c6c;
                    }

                    &.status-checking {
                        background: #e6f7ff;
                        color: #1890ff;
                    }

                    &.status-checked {
                        background: #f6ffed;
                        color: #52c41a;
                    }

                    &.status-confirm {
                        background: #fff7e6;
                        color: #fa8c16;
                    }

                    &.status-completed {
                        background: #f6ffed;
                        color: #52c41a;
                    }

                    &.status-returned {
                        background: #f5f5f5;
                        color: #999;
                    }
                }
            }

            .device-info {
                .info-item {
                    display: flex;
                    margin-bottom: 10rpx;
                    font-size: 26rpx;

                    .label {
                        color: #666;
                        width: 140rpx;
                    }

                    .value {
                        color: #333;
                        flex: 1;
                    }
                }
            }

            .device-actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 20rpx;

                .action-btn {
                    margin-left: 20rpx;
                    font-size: 24rpx;
                    padding: 10rpx 30rpx;
                    border-radius: 8rpx;

                    &.confirm {
                        background: #1890ff;
                        color: #fff;
                    }

                    &.reject {
                        background: #fff;
                        color: #f56c6c;
                        border: 1px solid #f56c6c;
                    }
                }
            }
        }
    }

    .order-info {
        background: #fff;
        border-radius: 12rpx;
        padding: 30rpx;
        margin-bottom: 120rpx;

        .info-list {
            .info-item {
                display: flex;
                margin-bottom: 20rpx;
                font-size: 26rpx;

                .label {
                    color: #666;
                    width: 140rpx;
                }

                .value {
                    color: #333;
                    flex: 1;
                }
            }
        }
    }

    .bottom-actions {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
        padding: 20rpx;
        display: flex;
        justify-content: flex-end;
        box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

        .action-btn {
            margin-left: 20rpx;
            font-size: 28rpx;
            padding: 16rpx 40rpx;
            border-radius: 8rpx;
            background: #fff;

            &.primary {
                background: #1890ff;
                color: #fff;
            }
        }
    }
}
</style>