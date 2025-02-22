<template>
    <view class="order-detail">
        <!-- 订单状态卡片 -->
        <view class="status-card">

            <view class="status-content">
                <view class="progress-steps">


                    <up-steps :current="currentStep">
                        <up-steps-item v-if="currentStep == -1" error title="已取消" desc="订单取消"></up-steps-item>
                        <up-steps-item v-else :title="item.name" v-for="item in [
                            { name: '已下单', desc: '订单已提交' },
                            { name: '待质检', desc: '待设备检测' },
                            { name: '待确认', desc: '待确认价格' },
                            { name: '待打款', desc: '等待转账' },
                            { name: '已完成', desc: '交易完成' }
                        ]">
                            <template #desc>
                                <text class="desc">{{ item.desc }}</text>
                            </template>
                        </up-steps-item>

                    </up-steps>
                </view>
                <view class="status-header">
                    <text class="create-time">
                        {{ formatTime(orderInfo.create_at) }}
                    </text>
                    <view class="status-badge" :class="getStatusClass(orderInfo.status)">

                        <up-icon :name="orderInfo.status == '4' ? 'rmb-circle' : 'checkbox-mark'" size="14" color="#fff"
                            class="icon-left">
                        </up-icon>
                        <text class="status-text">{{ getOrderStatusText(orderInfo.status) }}</text>
                    </view>

                </view>
                <view class="order-info">
                    <view class="info-row">
                        <view class="label">
                            <up-icon name="order" size="16" color="#666" class="icon-left"></up-icon>
                            <text>订单编号</text>
                        </view>
                        <text class="value">{{ orderInfo.order_no }}</text>
                    </view>
                    <view class="info-row">
                        <view class="label">
                            <up-icon name="account" size="16" color="#666" class="icon-left"></up-icon>
                            <text>用户名称</text>
                        </view>
                        <text class="value">{{ orderInfo.send_username }}</text>
                    </view>
                    <view class="info-row">
                        <view class="label">
                            <up-icon name="phone" size="16" color="#666" class="icon-left"></up-icon>
                            <text>联系电话</text>
                        </view>
                        <text class="value">{{ orderInfo.telphone }}</text>
                    </view>
                    <view class="info-row">
                        <view class="label">
                            <up-icon name="car" size="16" color="#666" class="icon-left"></up-icon>
                            <text>配送方式</text>
                        </view>
                        <text class="value">{{ orderInfo.delivery_type === 'self' ? '自寄' : '上门取件' }}</text>
                    </view>
                    <view class="info-row" v-if="orderInfo.delivery_type === 'mail'">
                        <view class="label">
                            <up-icon name="car" size="16" color="#666" class="icon-left"></up-icon>
                            <text>快递单号</text>
                        </view>
                        <text class="value">{{ orderInfo.express_id || '暂无' }}</text>
                    </view>
                </view>

                <view class="status-desc">{{ getStatusDescription(orderInfo.status) }}</view>
            </view>
        </view>

        <!-- 设备列表 -->
        <view class="devices-list">
            <view class="section-title">
                <text class="title">设备列表</text>
                <text class="device-count">共 {{ orderInfo.devices?.length || 0 }} 台设备 ,
                    总价值 ¥ {{ final_price }} 元

                </text>
            </view>

            <view class="device-item" v-for="device in orderInfo.devices" :key="device.id">
                <view class="device-card">
                    <!-- 设备基本信息 -->
                    <view class="device-header" @click="toggleDeviceDetail(device.id)">
                        <text :class="['status-tag', getDeviceStatusClass(device.status)]">

                            <text>{{ getDeviceStatusText(device.status) }}</text>
                        </text>
                        <view class="device-basic">
                            <view class="model-info">
                                <text class="device-model">
                                    <up-icon name="phone" size="16" color="#333" class="icon-left"></up-icon>
                                    <text>{{ device.model || '待识别' }}</text>
                                </text>
                            </view>
                            <text class="device-imei">
                                <up-icon name="fingerprint" size="14" color="#666" class="icon-left"></up-icon>
                                <text>IMEI: {{ device.imei }}</text>
                            </text>
                        </view>
                        <view class="price-section">
                            <text class="price-value" v-if="device.final_price !== '0.00'">¥{{ device.final_price
                            }}</text>
                            <text class="price-status" v-else></text>
                        </view>
                        <view class="expand-icon" :class="{ 'expanded': isDeviceExpanded(device.id) }">
                            <up-icon name="arrow-down" size="24" color="#999"></up-icon>
                        </view>
                    </view>

                    <!-- 设备图片展示 -->
                    <view class="device-images" v-if="device.check_images">
                        <scroll-view scroll-x class="image-scroll">
                            <view class="image-list">
                                <view class="image-item" v-for="(img, index) in device.check_images.split(',')"
                                    :key="index">
                                    <image :src="img" mode="aspectFill"
                                        @click="previewImage(device.check_images.split(','), index)" />
                                </view>
                            </view>
                        </scroll-view>
                    </view>

                    <!-- 设备详细信息 -->
                    <view class="device-detail" v-show="isDeviceExpanded(device.id)">
                        <view class="detail-section price-detail">
                            <view class="detail-row">
                                <text class="label">预估价格</text>
                                <text class="value price">¥{{ device.initial_price || '0.00' }}</text>
                            </view>
                            <view class="detail-row" v-if="device.final_price">
                                <text class="label">最终价格</text>
                                <text class="value price">¥{{ device.final_price }}</text>
                            </view>
                            <view class="detail-row" v-if="device.price_remark">
                                <text class="label">价格说明</text>
                                <text class="value">{{ device.price_remark }}</text>
                            </view>
                        </view>

                        <view class="detail-section check-detail">
                            <view class="detail-row">
                                <text class="label">检测状态</text>
                                <text class="value">{{ device.check_status === 1 ? '已检测' : '未检测' }}</text>
                            </view>
                            <view class="detail-row" v-if="device.check_result">
                                <text class="label">检测结果</text>
                                <text class="value">{{ device.check_result }}</text>
                            </view>
                            <view class="detail-row" v-if="device.check_at">
                                <text class="label">检测时间</text>
                                <text class="value">{{ formatTime(device.check_at) }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 设备操作按钮 -->
                    <view class="device-actions" v-if="showDeviceActions(device.status)">
                        <button class="action-btn reject" disabled @click="handleDeviceReject(device)">
                            <up-icon name="close" size="18" color="#f56c6c"></up-icon>
                            不卖了
                        </button>
                        <button class="action-btn confirm" @click="handleDeviceConfirm(device)">
                            <up-icon name="checkmark" size="18" color="#fff"></up-icon>
                            确认
                        </button>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="bottom-actions" v-if="hasUnconfirmedDevices">
            <button class="action-btn confirm-all" @click="handleConfirmAll">
                <up-icon name="checkmark-circle" size="20" color="#fff"></up-icon>
                一键确认所有设备
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
    check_images?: string;
}

interface OrderInfo {
    id: number;
    order_no: string;
    status: OrderStatus;
    create_at: number;
    devices: Device[];
    delivery_type: 'mail' | 'self';
    express_id?: string;
    send_username: string;
    telphone: string;
}

const orderInfo = ref<OrderInfo>({
    id: 0,
    order_no: '',
    status: '1',
    create_at: 0,
    devices: [],
    delivery_type: 'self',
    send_username: '',
    telphone: '',

})

const loading = ref(false)
const expandedDevices = ref<number[]>([]) // 存储展开的设备ID

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

// 检查设备是否展开
const isDeviceExpanded = (deviceId: number): boolean => {
    return expandedDevices.value.includes(deviceId)
}

// 切换设备展开状态
const toggleDeviceDetail = (deviceId: number) => {
    const index = expandedDevices.value.indexOf(deviceId)
    if (index === -1) {
        expandedDevices.value.push(deviceId)
    } else {
        expandedDevices.value.splice(index, 1)
    }
}

// 获取状态样式类
const getStatusClass = (status: OrderStatus): string => {
    switch (status) {
        case '1':
            return 'pending'
        case '2':
        case '3':
            return 'processing'
        case '4':
        case '5':
        case '6':
            return 'completed'
        case '7':
        case '8':
        case '9':
            return 'cancelled'
        default:
            return 'pending'
    }
}

// 检查是否有未确认的设备
const hasUnconfirmedDevices = computed(() => {
    return orderInfo.value?.devices?.some(device => device.status == '3') || false
})

// 处理设备确认
const handleDeviceConfirm = async (device: Device) => {
    try {
        loading.value = true
        const res = await deviceConfirm(device.id)
        if (res.code === 1) {
            uni.showToast({
                title: '确认成功',
                icon: 'success'
            })
            loadOrderDetail(orderInfo.value.id)
        } else {
            uni.showToast({
                title: res.msg || '操作失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('确认设备失败:', error)
        uni.showToast({
            title: '操作失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 处理设备退回
const handleDeviceReject = async (device: Device) => {
    uni.showToast({
        title: '该功能开发中',
        icon: 'none'
    })
    return
    // 退回设备

    try {
        loading.value = true
        const res = await deviceCancel(device.id)
        if (res.code === 1) {
            uni.showToast({
                title: '退回成功',
                icon: 'success'
            })
            loadOrderDetail(orderInfo.value.id)
        } else {
            uni.showToast({
                title: res.msg || '操作失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('退回设备失败:', error)
        uni.showToast({
            title: '操作失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 一键确认所有设备
const handleConfirmAll = async () => {
    try {
        loading.value = true
        const unconfirmedDevices = orderInfo.value.devices.filter(device => device.status == '3')
        if (unconfirmedDevices.length === 0) {
            uni.showToast({
                title: '没有需要确认的设备',
                icon: 'none'
            })
            return
        }

        // 确认所有未确认的设备
        await Promise.all(unconfirmedDevices.map(device => deviceConfirm(device.id)))
        uni.showToast({
            title: '确认成功',
            icon: 'success'
        })
        loadOrderDetail(orderInfo.value.id)
    } catch (error) {
        console.error('一键确认失败:', error)
        uni.showToast({
            title: '操作失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 格式化时间
const formatTime = (timestamp: number) => {
    return formatDate(timestamp)
}

// 获取订单详情
const loadOrderDetail = async (id: string | number) => {
    try {
        loading.value = true
        const res = await getOrderDetail(id) as ApiResponse<OrderInfo>
        if (res.code === 1) {
            orderInfo.value = res.data

        }
    } catch (error) {
        console.error('获取订单详情失败:', error)
    } finally {
        loading.value = false
    }
}

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
            return '您的订单已提交，等待商家确认'
        case '2':
            return '商家正在处理您的订单'
        case '3':
            return '商家已完成质检，请确认价格'
        case '4':
            return '您已确认价格，等待商家打款'
        case '5':
            return '商家已完成打款，请查收'
        case '6':
            return '订单已完成'
        case '7':
            return '订单已取消'
        case '8':
            return '订单已退回'
        case '9':
            return '订单已删除'
        default:
            return '订单状态未知'
    }
}

// 获取设备状态样式类
const getDeviceStatusClass = (status: DeviceStatus): string => {
    switch (status) {
        case '1':
            return 'status-pending'
        case '2':
            return 'status-checking'
        case '3':
            return 'status-checked'
        case '4':
            return 'status-confirmed'
        case '5':
            return 'status-completed'
        case '6':
            return 'status-returned'
        default:
            return 'status-unknown'
    }
}

// 判断是否显示设备操作按钮
const showDeviceActions = (status: DeviceStatus): boolean => {
    return status == '3' // 只有在已质检状态下才显示操作按钮
}

// 获取设备状态图标
const getDeviceStatusIcon = (status: string) => {
    switch (status) {
        case 'pending':
            return 'clock'
        case 'checking':
            return 'search'
        case 'checked':
            return 'checkmark'
        case 'confirmed':
            return 'checkmark-circle'
        case 'completed':
            return 'star'
        case 'returned':
            return 'reload'
        default:
            return 'info-circle'
    }
}

// 获取设备状态颜色
const getDeviceStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return '#d48806'
        case 'checking':
            return '#096dd9'
        case 'checked':
            return '#389e0d'
        case 'confirmed':
            return '#531dab'
        case 'completed':
            return '#08979c'
        case 'returned':
            return '#999'
        default:
            return '#999'
    }
}

// 预览图片
const previewImage = (images: string[], current: number) => {
    uni.previewImage({
        urls: images,
        current: images[current],
        longPressActions: {
            itemList: ['保存图片'],
            success: (data) => {
                if (data.tapIndex === 0) {
                    uni.saveImageToPhotosAlbum({
                        filePath: images[current],
                        success: () => {
                            uni.showToast({
                                title: '保存成功',
                                icon: 'success'
                            })
                        },
                        fail: (err) => {
                            console.error('保存图片失败:', err)
                            uni.showToast({
                                title: '保存失败',
                                icon: 'none'
                            })
                        }
                    })
                }
            }
        }
    })
}

// 计算当前步骤
const currentStep = computed(() => {
    const status = orderInfo.value?.status
    switch (status) {
        case '1': // 已下单
            return 0
        case '2': // 待质检
        case '3': // 质检中
            return 1
        case '4': // 待确认
        case '5': // 部分确认
            return 3
        case '6': // 待打款
            return 4
        case '7': // 已完成
            return -1
        case '8': // 已取消
        case '9': // 已删除
            return -1
        default:
            return 0
    }
})

// final_price 
const final_price = computed(() => {
    // 通过 计算  device 列表中 的 final_price
    return orderInfo.value?.devices?.reduce((total, device) => total + parseFloat(device.final_price), 0)
})

// 页面加载
onLoad((options?: Record<string, any>) => {
    if (options?.id) {
        loadDeviceStatus().then(() => {
            loadOrderDetail(options.id)
        })
    }
})
</script>

<style lang="scss">
page {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.order-detail {
    min-height: 100vh;
    padding: 24rpx;
    padding-bottom: 180rpx;
    background: #f8f9fa;

    .status-card {
        background: #fff;
        border-radius: 24rpx;
        margin-bottom: 24rpx;
        box-shadow: 0 8rpx 32rpx rgba(31, 45, 61, 0.08);
        overflow: hidden;

        .status-content {
            padding: 16rpx;

            .desc {
                font-size: 20rpx;
            }

            .progress-steps {
                margin: 10rpx 0;
                padding: 12rpx;

                border-radius: 16rpx;
                border: 1rpx solid #d9d9d9;

                :deep(.u-steps) {
                    .u-steps__item {
                        min-height: 100rpx;

                        &__text {
                            padding-left: 12rpx;

                            .u-steps__item__title {
                                font-size: 26rpx;
                                color: #333;
                                font-weight: 600;
                                margin-bottom: 4rpx;
                            }

                            .u-steps__item__desc {
                                font-size: 22rpx;
                                color: #666;
                            }
                        }

                        &__dot {
                            width: 16rpx;
                            height: 16rpx;
                            background: #ddd;
                            border-radius: 50%;

                            &--active {
                                background: #2979ff;
                            }
                        }

                        &__line {
                            background: #ddd;

                            &--active {
                                background: #2979ff;
                            }
                        }
                    }
                }
            }

            .status-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 24rpx 0px;

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 12rpx 24rpx;
                    border-radius: 32rpx;
                    background: var(--status-color, #2979ff);

                    .icon-left {
                        margin-right: 6rpx;
                        display: inline-block;
                        align-items: center;
                    }

                    .status-text {
                        font-size: 24rpx;
                        font-weight: 600;
                        color: #fff;
                    }
                }

                .create-time {
                    font-size: 24rpx;
                    color: #666;
                }
            }

            .order-info {
                background: rgba(248, 249, 250, 0.8);
                border-radius: 20rpx;
                padding: 32rpx;
                margin-bottom: 32rpx;
                border: 1rpx solid rgba(255, 255, 255, 0.8);

                .info-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20rpx;
                    font-size: 28rpx;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    .label {
                        display: flex;
                        align-items: center;
                        color: #666;
                        font-size: 26rpx;
                        white-space: nowrap;

                        .icon-left {
                            margin-right: 8rpx;
                            display: inline-block;
                            align-items: center;
                            flex-shrink: 0;
                        }
                    }

                    .value {
                        color: #333;
                        font-size: 26rpx;
                        font-weight: 500;
                    }
                }
            }

            .status-desc {
                font-size: 26rpx;
                color: #666;
                line-height: 1.6;
                padding: 0 8rpx;
            }
        }
    }

    .devices-list {
        .section-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32rpx;
            padding: 0 12rpx;

            .title {
                font-size: 36rpx;
                font-weight: 700;
                color: #333;
                letter-spacing: 1rpx;
                text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
            }

            .device-count {
                font-size: 26rpx;
                color: #666;
                font-weight: 500;
                background: rgba(255, 255, 255, 0.9);
                padding: 8rpx 24rpx;
                border-radius: 24rpx;
                box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
            }
        }

        .device-item {
            margin-bottom: 32rpx;

            .device-card {
                position: relative;
                background: #fff;
                border-radius: 24rpx;
                overflow: hidden;
                box-shadow: 0 8rpx 32rpx rgba(31, 45, 61, 0.08);
                border: 1rpx solid rgba(255, 255, 255, 0.6);
                backdrop-filter: blur(10rpx);
                transition: transform 0.3s ease, box-shadow 0.3s ease;

                &:hover {
                    transform: translateY(-4rpx);
                    box-shadow: 0 12rpx 48rpx rgba(31, 45, 61, 0.12);
                }

                .device-header {
                    position: relative;
                    padding: 16rpx;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

                    .status-tag {
                        position: absolute;
                        top: 0;
                        right: 0;
                        background: #f5f7fa;
                        color: #347ddc;
                        font-size: 0.625rem;
                        font-weight: 500;
                        padding: 0.125rem 0.25rem;
                        border-radius: 0 0.375rem 0 0.375rem;
                        font-family: "DIN";
                        z-index: 1;

                        .icon-left {
                            margin-right: 4rpx;
                            display: inline-flex;
                            align-items: center;
                        }
                    }

                    .device-basic {
                        margin-top: 24rpx;

                        .model-info {
                            display: flex;
                            align-items: center;
                            gap: 12rpx;
                            margin-bottom: 12rpx;

                            .device-model {
                                display: inline-flex;
                                align-items: center;
                                font-size: 28rpx;
                                font-weight: 600;
                                color: #333;

                                .icon-left {
                                    margin-right: 6rpx;
                                    display: inline-flex;
                                    align-items: center;
                                }
                            }
                        }

                        .device-imei {
                            display: inline-flex;
                            align-items: center;
                            font-size: 24rpx;
                            color: #666;

                            .icon-left {
                                margin-right: 6rpx;
                                display: inline-flex;
                                align-items: center;
                            }
                        }
                    }

                    .price-section {
                        text-align: right;
                        margin-right: 80rpx;

                        .price-value {
                            font-size: 40rpx;
                            font-weight: 800;
                            background: linear-gradient(135deg, #ff4d4f, #f5222d);
                            -webkit-background-clip: text;
                            color: transparent;
                            text-shadow: 0 2rpx 8rpx rgba(245, 34, 45, 0.2);
                        }

                        .price-status {
                            font-size: 28rpx;
                            color: #666;
                            font-weight: 500;
                            margin-top: 4rpx;
                        }
                    }

                    .expand-icon {
                        position: absolute;
                        right: 32rpx;
                        top: 50%;
                        transform: translateY(-50%);
                        transition: all 0.3s ease;
                        width: 32rpx;
                        height: 32rpx;
                        opacity: 0.6;

                        &.expanded {
                            transform: translateY(-50%) rotate(180deg);
                            opacity: 0.8;
                        }
                    }
                }

                .device-images {
                    padding: 32rpx;
                    background: rgba(248, 249, 250, 0.5);
                    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

                    .image-scroll {
                        width: 100%;
                        white-space: nowrap;

                        .image-list {
                            display: inline-flex;
                            gap: 24rpx;
                            padding: 8rpx 4rpx;

                            .image-item {
                                width: 240rpx;
                                height: 240rpx;
                                border-radius: 16rpx;
                                overflow: hidden;
                                box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
                                border: 2rpx solid rgba(255, 255, 255, 0.8);
                                transition: transform 0.3s ease;

                                &:hover {
                                    transform: scale(1.02);
                                }

                                image {
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                }
                            }
                        }
                    }
                }

                .device-detail {
                    padding: 32rpx;
                    animation: expandIn 0.3s ease-out;

                    .detail-section {
                        background: rgba(248, 249, 250, 0.8);
                        border-radius: 20rpx;
                        padding: 18rpx;
                        margin-bottom: 16rpx;
                        border: 1rpx solid rgba(255, 255, 255, 0.8);

                        &:last-child {
                            margin-bottom: 0;
                        }

                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 8rpx;
                            font-size: 28rpx;

                            &:last-child {
                                margin-bottom: 0;
                            }

                            .label {
                                color: #666;
                                font-weight: 500;
                            }

                            .value {
                                color: #333;
                                font-weight: 600;

                                &.price {
                                    color: #f5222d;
                                    font-size: 32rpx;
                                    font-weight: 700;
                                }
                            }
                        }
                    }
                }

                .device-actions {
                    display: flex;
                    gap: 24rpx;
                    padding: 32rpx;
                    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
                    background: rgba(248, 249, 250, 0.5);

                    .action-btn {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8rpx;
                        height: 88rpx;
                        border-radius: 44rpx;
                        font-size: 30rpx;
                        font-weight: 600;
                        letter-spacing: 1rpx;
                        border: none;
                        transition: all 0.3s ease;

                        &::after {
                            border: none;
                        }

                        &.reject {
                            background: #fff;
                            color: #f56c6c;
                            border: 2rpx solid #f56c6c;
                            box-shadow: 0 4rpx 12rpx rgba(245, 108, 108, 0.1);

                            &:active {
                                background: #fff5f5;
                                transform: scale(0.98);
                                box-shadow: 0 2rpx 6rpx rgba(245, 108, 108, 0.1);
                            }
                        }

                        &.confirm {
                            background: linear-gradient(135deg, #4481eb, #04befe);
                            color: #fff;
                            box-shadow: 0 4rpx 16rpx rgba(68, 129, 235, 0.2);
                            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);

                            &:active {
                                transform: scale(0.98);
                                box-shadow: 0 2rpx 8rpx rgba(68, 129, 235, 0.2);
                            }
                        }

                        .icon-left {
                            display: inline-block;
                            align-items: center;
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
        background: rgba(255, 255, 255, 0.98);
        padding: 32rpx;
        box-shadow: 0 -4rpx 24rpx rgba(31, 45, 61, 0.1);
        backdrop-filter: blur(10rpx);

        .action-btn {
            width: 100%;
            height: 96rpx;
            border-radius: 48rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16rpx;
            font-size: 34rpx;
            font-weight: 600;
            letter-spacing: 2rpx;
            border: none;
            transition: all 0.3s ease;

            &::after {
                border: none;
            }

            &.confirm-all {
                background: linear-gradient(135deg, #4481eb, #04befe);
                color: #fff;
                box-shadow: 0 8rpx 24rpx rgba(68, 129, 235, 0.25);
                text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);

                &:active {
                    transform: scale(0.98);
                    box-shadow: 0 4rpx 12rpx rgba(68, 129, 235, 0.2);
                }
            }
        }
    }
}

.status-badge {
    display: inline-flex;
    align-items: center;
}

.create-time {
    display: inline-flex;
    align-items: center;
}

.device-model {
    display: inline-flex;
    align-items: center;
}

.device-imei {
    display: inline-flex;
    align-items: center;
}

.status-tag {
    display: inline-flex;
    align-items: center;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

@keyframes expandIn {
    from {
        opacity: 0;
        transform: translateY(-20rpx);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>