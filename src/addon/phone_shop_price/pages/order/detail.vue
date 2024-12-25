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
            <view class="section-header">
                <text class="section-title">设备列表</text>
                <text class="device-count">共 {{ orderInfo.devices?.length || 0 }} 台设备</text>
            </view>
            <view class="device-item" v-for="device in orderInfo.devices" :key="device.id">
                <!-- 设备基本信息 -->
                <view class="device-header" @click="toggleDeviceDetail(device.id)">
                    <view class="device-basic">
                        <text class="device-model">{{ device.model }}</text>
                        <text :class="['device-status', getDeviceStatusClass(device.status)]">
                            {{ getDeviceStatusText(device.status) }}
                        </text>
                    </view>
                    <view class="price-info" v-if="device.final_price">
                        <text class="price-label">最终报价</text>
                        <text class="price-value">¥{{ device.final_price }}</text>
                    </view>
                    <view class="expand-icon">
                        <u-icon :name="isDeviceExpanded(device.id) ? 'arrow-up' : 'arrow-down'" size="24"
                            color="#999"></u-icon>
                    </view>
                </view>

                <!-- 设备详细信息（折叠面板） -->
                <view class="device-detail" v-show="isDeviceExpanded(device.id)">
                    <view class="detail-section">
                        <view class="section-header">
                            <text class="section-title">基本信息</text>
                        </view>
                        <view class="info-list">
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
                            <view class="info-item" v-if="device.price_remark">
                                <text class="label">价格备注：</text>
                                <text class="value">{{ device.price_remark }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="detail-section">
                        <view class="section-header">
                            <text class="section-title">检测信息</text>
                        </view>
                        <view class="info-list">
                            <view class="info-item">
                                <text class="label">检测状态：</text>
                                <text class="value">{{ device.check_status === 1 ? '已检测' : '未检测' }}</text>
                            </view>
                            <view class="info-item" v-if="device.check_result">
                                <text class="label">检测结果：</text>
                                <text class="value">{{ device.check_result }}</text>
                            </view>
                            <view class="info-item" v-if="device.check_at">
                                <text class="label">检测时间：</text>
                                <text class="value">{{ formatTime(device.check_at) }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="detail-section">
                        <view class="section-header">
                            <text class="section-title">时间信息</text>
                        </view>
                        <view class="info-list">
                            <view class="info-item">
                                <text class="label">创建时间：</text>
                                <text class="value">{{ formatTime(device.create_at) }}</text>
                            </view>
                            <view class="info-item" v-if="device.update_at">
                                <text class="label">更新时间：</text>
                                <text class="value">{{ formatTime(device.update_at) }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 设备操作按钮 -->
                <view class="device-actions" v-if="showDeviceActions(device.status)">
                    <button class="action-btn reject" @click="handleDeviceReject(device)">
                        <u-icon name="close" size="24" color="#f56c6c"></u-icon>
                        <text>不卖了</text>
                    </button>
                    <button class="action-btn confirm" @click="handleDeviceConfirm(device)">
                        <u-icon name="checkmark" size="24" color="#fff"></u-icon>
                        <text>同意回收</text>
                    </button>
                </view>
            </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="bottom-actions" v-if="hasUnconfirmedDevices">
            <!-- <button class="action-btn reject-all" @click="handleRejectAll">
                <u-icon name="close" size="32" color="#f56c6c"></u-icon>
                <text>一键取消</text>
            </button> -->
            <button class="action-btn confirm-all" @click="handleConfirmAll">
                <u-icon name="checkmark" size="32" color="#fff"></u-icon>
                <text>一键确认</text>
            </button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, getDeviceStatus, deviceConfirm, deviceCancel, updateOrderStatus } from '@/addon/phone_shop_price/api/order'
import { timeStampTurnTime as formatDate } from '@/utils/common'

interface StatusResponse {
    device_status: Record<string, string>;
    order_status: Record<string, string>;
}

interface ApiResponse<T = any> {
    code: number;
    data: T;
    msg?: string;
}

// 状态类型定义
type OrderStatus = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type DeviceStatus = '1' | '2' | '3' | '4' | '5' | '6'

interface Device {
    id: number;
    status: DeviceStatus;
    model: string;
    imei: string;
    initial_price: string | number;
    final_price?: string | number;
    check_result?: string;
    check_status: number;
    price_remark?: string;
    create_at: number;
    update_at: number | null;
    check_at: number | null;
}

interface OrderInfo {
    id: number;
    order_no: string;
    status: OrderStatus;
    create_at: number;
    devices: Device[];
}

const orderInfo = ref<OrderInfo>({
    id: 0,
    order_no: '',
    status: '1',
    create_at: 0,
    devices: []
})

const loading = ref(false)
const expandedDevices = ref<number[]>([]) // 存储展开的设备ID
const deviceStatusList = ref<any[]>([]) // 设备状态列表

// 状态存储
const statusData = ref<StatusResponse>({
    device_status: {},
    order_status: {}
})

// 获取设备状态列表
const loadDeviceStatus = async () => {
    try {
        const res = await getDeviceStatus() as ApiResponse<StatusResponse>
        if (res.code === 1) {
            statusData.value = res.data
        }
    } catch (error) {
        console.error('获取状态列表失败:', error)
    }
}

// 切换设备详情展开状态
const toggleDeviceDetail = (deviceId: number) => {
    const index = expandedDevices.value.indexOf(deviceId)
    if (index > -1) {
        expandedDevices.value.splice(index, 1)
    } else {
        expandedDevices.value.push(deviceId)
    }
}

// 检查设备是否展开
const isDeviceExpanded = (deviceId: number): boolean => {
    return expandedDevices.value.includes(deviceId)
}

// 检查是否有未确认的设备
const hasUnconfirmedDevices = computed(() => {
    console.log(orderInfo.value?.devices)
    return orderInfo.value?.devices?.some(device => device.status == '3') || false
})

// 处理设备确认
const handleDeviceConfirm = (device: Device) => {
    uni.showModal({
        title: '确认提示',
        content: `确认同意回收设备 \n ${device.model}？\n最终价格：¥${device.final_price}`,
        success: async (res) => {
            if (res.confirm) {
                // TODO: 调用确认接口
                const res = await deviceConfirm(device.id)
                if (res.code !== 1) {
                    uni.showToast({
                        title: res.msg || '操作失败',
                        icon: 'none'
                    })
                    return
                }
                await loadOrderDetail(orderInfo.value.id)
                uni.showToast({
                    title: '确认成功',
                    icon: 'success'
                })
            }
        }
    })
}

// 处理设备退回
const handleDeviceReject = (device: Device) => {
    uni.showModal({
        title: '确认提示',
        content: `确认不出售设备 ${device.model}？`,
        success: async (res) => {
            if (res.confirm) {
                // TODO: 调用拒绝接口
                const res = await deviceCancel(device.id)
                if (res.code !== 1) {
                    uni.showToast({
                        title: res.msg || '操作失败',
                        icon: 'none'
                    })
                    return
                }
                await loadOrderDetail(orderInfo.value.id)
                uni.showToast({
                    title: '已取消出售',
                    icon: 'success'
                })
            }
        }
    })
}

// 一键确认所有设备
const handleConfirmAll = () => {
    uni.showModal({
        title: '确认提示',
        content: '确认同意回收所有设备？',
        success: async (res) => {
            if (res.confirm) {
                // TODO: 调用批量确认接口

                const res = await updateOrderStatus({
                    action: 'confirm',
                    order_id: orderInfo.value.id,
                    status: '3'
                })
                // 如果code !==1 则提示错误
                if (res.code !== 1) {
                    uni.showToast({
                        title: res.msg || '操作失败',
                        icon: 'none'
                    })
                    return
                }
                await loadOrderDetail(orderInfo.value.id)
                uni.showToast({
                    title: '已确认所有设备',
                    icon: 'success'
                })
            }
        }
    })
}

// 一键取消所有设备
const handleRejectAll = () => {
    uni.showModal({
        title: '确认提示',
        content: '确认取消回收所有设备？',
        success: (res) => {
            if (res.confirm) {
                // TODO: 调用批量取消接口
                uni.showToast({
                    title: '已取消所有设备',
                    icon: 'success'
                })
            }
        }
    })
}

// 格式化时间
const formatTime = (timestamp: number) => {
    return formatDate(timestamp * 1000, 'YYYY-MM-DD HH:mm:ss')
}

// 获取订单详情
const loadOrderDetail = async (id: string | number) => {
    loading.value = true
    try {
        const res = await getOrderDetail(Number(id)) as ApiResponse<OrderInfo>
        if (res.code === 1) {
            orderInfo.value = res.data
        }
    } catch (error) {
        console.error('获取订单详情失败:', error)
    } finally {
        loading.value = false
    }
}

// 页面加载
onLoad((options?: Record<string, any>) => {
    if (options?.id) {
        loadOrderDetail(options.id)
        loadDeviceStatus() // 加载设备状态列表
    }
})

// 获取订单状态文本
const getOrderStatusText = (status: OrderStatus): string => {
    return statusData.value.order_status[status] || '未知状态'
}

// 获取设备状态文本
const getDeviceStatusText = (status: DeviceStatus): string => {
    return statusData.value.device_status[status] || '未知状态'
}

// 获取状态描述
const getStatusDescription = (status: OrderStatus): string => {
    switch (status) {
        case '1':
            return '您的订单已提交，等待签收'
        case '2':
            return '商家正在对您的设备进行质检'
        case '3':
            return '设备质检完成，请确认价格'
        case '4':
            return '价格已确认，等待商家打款'
        case '5':
            return '商家已完成打款，请注意查收'
        case '6':
            return '订单已完成'
        case '7':
            return '订单已取消'
        case '8':
            return '设备正在退回中'
        case '9':
            return '设备已退回'
        default:
            return '未知状态'
    }
}

// 获取设备状态样式类
const getDeviceStatusClass = (status: DeviceStatus): string => {
    switch (status) {
        case '1':
            return 'status-pending'    // 待质检：橙色
        case '2':
            return 'status-checking'   // 质检中：蓝色
        case '3':
            return 'status-checked'    // 已质检：绿色
        case '4':
            return 'status-confirm'    // 已确认：紫色
        case '5':
            return 'status-completed'  // 已完成：绿色
        case '6':
            return 'status-returned'   // 已退回：灰色
        default:
            return 'status-unknown'
    }
}

// 判断是否显示设备操作按钮
const showDeviceActions = (status: DeviceStatus): boolean => {
    return status == '3' // 只有在已质检状态下才显示操作按钮
}
</script>

<style lang="scss">
// 全局变量定义
page {
    --primary-color: #1890ff;
    --primary-color-light: #e6f7ff;
    --primary-color-dark: #096dd9;
    --primary-color-disabled: rgba(24, 144, 255, 0.3);

    --warning-color: #fa8c16;
    --warning-color-light: #fff7e6;
    --warning-color-disabled: rgba(250, 140, 22, 0.2);

    --success-color: #52c41a;
    --success-color-light: #f6ffed;
    --success-color-disabled: rgba(82, 196, 26, 0.2);

    --info-color: #722ed1;
    --info-color-light: #f9f0ff;
    --info-color-disabled: rgba(114, 46, 209, 0.2);

    --error-color: #f56c6c;
    --error-color-light: #fff5f5;
    --error-color-dark: #f5222d;
    --error-color-disabled: rgba(245, 34, 45, 0.2);

    --text-color-disabled: #8c8c8c;
    --bg-color-grey: #f5f5f5;
    --border-color: rgba(140, 140, 140, 0.2);

    height: 100%;
    background-color: #f8f9fa;
}

// 设置根元素样式
#app {
    min-height: 100%;
    background-color: #f8f9fa;
}

.order-detail {
    min-height: 100vh;
    background-color: #f8f9fa !important;
    padding: 24rpx;
    padding-bottom: 180rpx;

    // 添加一个包装器确保内容区域也有背景色
    &-wrapper {
        background-color: #f8f9fa;
        min-height: 100vh;
        width: 100%;
    }

    .status-card {
        background: #fff;
        border-radius: 16rpx;
        padding: 32rpx;
        margin-bottom: 24rpx;
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
        animation: slideInDown 0.3s ease-out;

        .status-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20rpx;

            .status-text {
                font-size: 36rpx;
                font-weight: 600;
                color: #333;
            }

            .order-no {
                font-size: 26rpx;
                color: #999;
            }
        }

        .status-desc {
            font-size: 28rpx;
            color: #666;
        }
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;

        .section-title {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
        }

        .device-count {
            font-size: 26rpx;
            color: #999;
        }
    }

    .devices-list {
        .device-item {
            background: #fff;
            border-radius: 16rpx;
            padding: 32rpx;
            margin-bottom: 24rpx;
            box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
            animation: slideInUp 0.3s ease-out;
            transition: all 0.3s ease;

            .device-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20rpx;
                cursor: pointer;
                position: relative;
                padding-right: 60rpx;

                .device-basic {
                    flex: 1;
                    margin-right: 20rpx;

                    .device-model {
                        font-size: 32rpx;
                        font-weight: 600;
                        color: #333;
                        margin-bottom: 12rpx;
                        display: block;
                    }

                    .device-status {
                        font-size: 24rpx;
                        padding: 8rpx 24rpx;
                        border-radius: 24rpx;
                        display: inline-flex;
                        align-items: center;
                        gap: 8rpx;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                        font-weight: 500;

                        &::before {
                            content: '';
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            background: currentColor;
                            opacity: 0.1;
                            border-radius: inherit;
                        }

                        &.status-pending {
                            color: var(--warning-color, #fa8c16);
                            background: var(--warning-color-light, #fff7e6);
                            border: 1px solid var(--warning-color-disabled, rgba(250, 140, 22, 0.2));

                            &::before {
                                animation: pulse 2s infinite;
                            }
                        }

                        &.status-checking {
                            color: var(--primary-color, #1890ff);
                            background: var(--primary-color-light, #e6f7ff);
                            border: 1px solid var(--primary-color-disabled, rgba(24, 144, 255, 0.2));

                            &::before {
                                animation: scanning 2s infinite;
                            }
                        }

                        &.status-checked {
                            color: var(--success-color, #52c41a);
                            background: var(--success-color-light, #f6ffed);
                            border: 1px solid var(--success-color-disabled, rgba(82, 196, 26, 0.2));
                            animation: highlight 2s infinite;
                        }

                        &.status-confirm {
                            color: var(--info-color, #722ed1);
                            background: var(--info-color-light, #f9f0ff);
                            border: 1px solid var(--info-color-disabled, rgba(114, 46, 209, 0.2));
                            font-weight: 600;
                        }

                        &.status-completed {
                            color: var(--success-color, #52c41a);
                            background: var(--success-color-light, #f6ffed);
                            border: 1px solid var(--success-color-disabled, rgba(82, 196, 26, 0.2));
                        }

                        &.status-returned {
                            color: var(--text-color-disabled, #8c8c8c);
                            background: var(--bg-color-grey, #f5f5f5);
                            border: 1px solid var(--border-color, rgba(140, 140, 140, 0.2));
                        }

                        &.status-unknown {
                            color: var(--text-color-disabled, #8c8c8c);
                            background: var(--bg-color-grey, #f5f5f5);
                            border: 1px solid var(--border-color, rgba(140, 140, 140, 0.2));
                        }
                    }
                }

                .price-info {
                    text-align: right;
                    min-width: 160rpx;

                    .price-label {
                        font-size: 24rpx;
                        color: #999;
                        display: block;
                        margin-bottom: 4rpx;
                    }

                    .price-value {
                        font-size: 40rpx;
                        background: linear-gradient(135deg, var(--error-color, #ff4d4f), var(--error-color-dark, #f5222d));
                        -webkit-background-clip: text;
                        color: transparent;
                        font-weight: 600;
                        text-shadow: 0 2rpx 8rpx var(--error-color-disabled, rgba(245, 34, 45, 0.2));
                        animation: priceGlow 2s infinite;
                    }
                }

                .expand-icon {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    transition: transform 0.3s ease;
                }

                &:active {
                    opacity: 0.7;
                }
            }

            .device-detail {
                animation: expandIn 0.3s ease-out;

                .detail-section {
                    background: #f8f9fa;
                    border-radius: 12rpx;
                    padding: 24rpx;
                    margin-bottom: 20rpx;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    .section-header {
                        margin-bottom: 16rpx;

                        .section-title {
                            font-size: 28rpx;
                            font-weight: 500;
                            color: #333;
                            display: flex;
                            align-items: center;

                            &::before {
                                content: '';
                                width: 6rpx;
                                height: 24rpx;
                                background: var(--primary-color);
                                margin-right: 12rpx;
                                border-radius: 3rpx;
                            }
                        }
                    }

                    .info-list {
                        .info-item {
                            display: flex;
                            margin-bottom: 12rpx;
                            font-size: 26rpx;

                            &:last-child {
                                margin-bottom: 0;
                            }

                            .label {
                                color: #666;
                                width: 160rpx;
                            }

                            .value {
                                color: #333;
                                flex: 1;
                            }
                        }
                    }
                }
            }

            .device-actions {
                display: flex;
                justify-content: flex-end;
                gap: 24rpx;
                margin-top: 32rpx;
                padding-top: 24rpx;
                border-top: 1px solid #f0f0f0;

                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12rpx;
                    height: 80rpx;
                    border-radius: 40rpx;
                    font-size: 28rpx;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    padding: 0 40rpx;

                    &.confirm {
                        flex: 2;
                        background: var(--primary-color, #1890ff);
                        background: linear-gradient(135deg, var(--primary-color, #1890ff), var(--primary-color-dark, #096dd9));
                        color: #fff;
                        box-shadow: 0 8rpx 16rpx var(--primary-color-disabled, rgba(24, 144, 255, 0.3));

                        &:active {
                            transform: scale(0.98);
                            box-shadow: 0 4rpx 8rpx var(--primary-color-disabled, rgba(24, 144, 255, 0.2));
                        }

                        .u-icon {
                            width: 32rpx;
                            height: 32rpx;
                        }

                        text {
                            font-size: 32rpx;
                        }
                    }

                    &.reject {
                        flex: 1;
                        background: #fff;
                        color: var(--error-color, #f56c6c);
                        border: 1px solid var(--error-color, #f56c6c);

                        &:active {
                            transform: scale(0.98);
                            background: var(--error-color-light, #fff5f5);
                        }

                        .u-icon {
                            width: 28rpx;
                            height: 28rpx;
                        }
                    }
                }
            }
        }
    }

    .bottom-actions {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fff;
        padding: 24rpx;
        display: flex;
        justify-content: space-between;
        gap: 24rpx;
        box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
        animation: slideInUp 0.3s ease-out;

        .action-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12rpx;
            height: 88rpx;
            border-radius: 44rpx;
            font-size: 32rpx;
            font-weight: 500;
            transition: all 0.2s ease;

            &.confirm-all {
                background: linear-gradient(135deg, #1890ff, #096dd9);
                color: #fff;
                box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);

                &:active {
                    transform: scale(0.95);
                    box-shadow: 0 2rpx 6rpx rgba(24, 144, 255, 0.2);
                }
            }

            &.reject-all {
                background: #fff;
                color: #f56c6c;
                border: 1px solid #f56c6c;

                &:active {
                    transform: scale(0.95);
                    background: #fff5f5;
                }
            }
        }
    }
}

@keyframes slideInDown {
    from {
        transform: translateY(-20rpx);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideInUp {
    from {
        transform: translateY(20rpx);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes expandIn {
    from {
        opacity: 0;
        transform: translateY(-10rpx);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0% {
        opacity: 0.1;
    }

    50% {
        opacity: 0.2;
    }

    100% {
        opacity: 0.1;
    }
}

@keyframes scanning {
    0% {
        transform: translateX(-100%);
        opacity: 0.2;
    }

    50% {
        transform: translateX(0);
        opacity: 0.1;
    }

    100% {
        transform: translateX(100%);
        opacity: 0.2;
    }
}

@keyframes highlight {
    0% {
        opacity: 0.1;
    }

    50% {
        opacity: 0.3;
    }

    100% {
        opacity: 0.1;
    }
}

@keyframes priceGlow {
    0% {
        opacity: 0.8;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.8;
    }
}
</style>