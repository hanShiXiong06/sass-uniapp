<template>
    <view class="page">
        <!-- 顶部状态切换 -->
        <view class="header-section">
            <scroll-view class="status-nav" scroll-x>
                <view class="nav-items">
                    <view v-for="(item, index) in statusList" :key="index" class="nav-item"
                        :class="{ active: currentStatus === item.value }" @click="switchStatus(item.value)">
                        {{ item.label }}
                        <text class="count" v-if="getStatusCount(item.value)">{{ getStatusCount(item.value) }}</text>
                    </view>
                </view>
            </scroll-view>

            <!-- 配送方式筛选 -->
            <view class="delivery-filter">
                <view class="filter-options">
                    <view class="filter-item" :class="{ active: currentDeliveryType === 'all' }"
                        @click="switchDeliveryFilter('all')">
                        全部配送
                    </view>
                    <view class="filter-item" :class="{ active: currentDeliveryType === 'mail' }"
                        @click="switchDeliveryFilter('mail')">
                        邮寄配送
                    </view>
                    <view class="filter-item" :class="{ active: currentDeliveryType === 'self' }"
                        @click="switchDeliveryFilter('self')">
                        自行配送
                    </view>
                </view>
            </view>
        </view>

        <!-- 订单列表 -->
        <scroll-view scroll-y class="order-list" @scrolltolower="loadMore" :refresher-enabled="true"
            :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
            <view class="order-item" v-for="(item, index) in filteredOrderList" :key="index">
                <!-- 订单头部 -->
                <view class="order-header" @click="goDetail(item)">
                    <view class="header-left">
                        <text class="order-no">{{ item.order_no }}</text>
                        <text class="time">{{ formatTime(item.create_at) }}</text>
                    </view>
                    <view class="header-right">

                        <view>
                            <text class="order-status" :class="getStatusClass(item.status)"> {{
                                getStatusText(item.status) }}</text>

                        </view>

                        <view class="delivery-type-tag">

                            <text>{{ item.delivery_type === 'mail' ? '邮寄' : '自送' }}</text>
                            <text v-if="item.delivery_type === 'mail'" class="express-id"> | {{ item.express_id ||
                                '暂无单号'
                                }}</text>
                        </view>

                    </view>
                </view>

                <!-- 订单内容 -->
                <view class="order-content" @click="goDetail(item)">
                    <!-- 设备信息 -->
                    <view class="device-info">
                        <view class="device-list">
                            <view class="device-item" v-for="(device, dIndex) in item.devices" :key="dIndex">
                                <text class="model">{{ device.model || '待识别' }}</text>
                                <text class="imei">IMEI: {{ device.imei }}</text>
                                <text class="price" v-if="device.final_price !== '0.00'">
                                    ¥{{ device.final_price }}
                                </text>
                                <text class="price pending" v-if="device.status == 1">
                                    待评估
                                </text>
                                <text class="price checking" v-else-if="device.status == 2">
                                    质检中
                                </text>
                                <text class="price checked" v-else-if="device.status == 3">
                                    已质检
                                </text>
                                <text class="price completed" v-else-if="device.status == 4">
                                    已确认
                                </text>
                                <text class="price completed" v-else-if="device.status == 6">
                                    已完成
                                </text>
                                <text class="price returned" v-else>
                                    已退回
                                </text>

                            </view>
                        </view>
                    </view>
                </view>
                <!-- 个人信息 -->


                <!-- 订单底部 -->
                <view class="order-footer">
                    <view class="total-info">
                        <text>共<text class='text-lg ml-2 mr-2'>{{ item.devices.length }}</text>台设备</text>
                        <text class="total-label ml-2 ">总价</text>
                        <text class="total-price">¥{{ calculateTotalPrice(item) }}</text>

                    </view>
                    <view class="action-buttons">
                        <button v-for="(btn, index) in renderActionButtons(item)" :key="index"
                            :class="['btn', btn.class]" @click.stop="updateStatus(item, btn.type)">
                            {{ btn.text }}
                        </button>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="orderList.length === 0">
                <up-icon name="order" size="64" color="#CCCCCC"></up-icon>
                <text>暂无订单息</text>
            </view>

            <!-- 加载更多 -->
            <view class="loading-more" v-if="orderList.length > 0">
                <text v-if="hasMore">加载中...</text>
                <text v-else>没有更多了</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getOrderList, getOrderStatus, updateOrderStatus } from '@/addon/phone_shop_price/api/order';
import { redirect } from '@/utils/common';
import { onShow } from '@dcloudio/uni-app';

// 类型定义
type OrderStatus = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type ActionType = 'cancel' | 'reject' | 'confirm' | 'complete' | 'delete' | 'update_delivery' | 'update_express' | 'pay';

interface StatusItem {
    label: string;
    value: string;
    count: number;
    actions?: Record<string, any>;
}

interface OrderDevice {
    model: string;
    imei: string;
    initial_price: string;
}

interface Order {
    id: number;
    order_no: string;
    status: OrderStatus;
    create_at: number;
    devices: OrderDevice[];
    delivery_type: 'mail' | 'self';
    express_id: string;
    send_username: string;
    telphone: string;
    order_id?: number;
}

interface ActionButton {
    text: string;
    type: ActionType;
    class: string;
}

interface ApiResponse<T = any> {
    code: number;
    data: T;
    msg?: string;
}

interface OrderListResponse {
    data: Order[];
    current_page: number;
    last_page: number;
    status_count: Record<string, number>;
}

interface StatusListResponse {
    list: StatusItem[];
    status_count: Record<string, number>;
}

// 订单列表和状态计数
const orderList = ref<Order[]>([]); // 当前显示的订单列表
const statusList = ref<StatusItem[]>([]);
const currentStatus = ref('');
const page = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const isRefreshing = ref(false);
const statusCountMap = ref<Record<string, number>>({}); // ��储状态计数

// 配送方式筛选
const currentDeliveryType = ref<'all' | 'mail' | 'self'>('all');
const filteredOrderList = computed(() => {
    if (currentDeliveryType.value === 'all') {
        return orderList.value;
    }
    return orderList.value.filter(order => order.delivery_type === currentDeliveryType.value);
});

// 切换配送方式筛选
const switchDeliveryFilter = (type: 'all' | 'mail' | 'self') => {
    currentDeliveryType.value = type;
};

// 切换状态
const switchStatus = async (status: string) => {
    currentStatus.value = status;
    page.value = 1;
    orderList.value = [];
    hasMore.value = true;
    await loadData();
};

// 加载数据
const loadData = async () => {
    try {
        const res = await getOrderList({
            page: page.value,
            limit: pageSize.value,
            status: currentStatus.value
        }) as ApiResponse<OrderListResponse>;

        if (res.code === 1) {
            // 更新订单列表
            if (page.value === 1) {
                orderList.value = res.data.data;
            } else {
                orderList.value = [...orderList.value, ...res.data.data];
            }

            // 更新分页信息
            hasMore.value = res.data.current_page < res.data.last_page;

            // 更新状态计数（如果返回了计数信息）
            if (res.data.status_count) {
                statusCountMap.value = res.data.status_count;
            }
        }
    } catch (error) {
        console.error('获取订单列表失败:', error);
    }
};

// 加载更多
const loadMore = async () => {
    if (hasMore.value) {
        page.value++;
        await loadData();
    }
};

// 下拉刷新
const onRefresh = async () => {
    isRefreshing.value = true;
    page.value = 1;
    await loadData();
    isRefreshing.value = false;
};

// 获取状态列表和计数
const loadStatusList = async () => {
    try {
        const res = await getOrderStatus() as ApiResponse<StatusListResponse>;
        console.log('状态列表返回数据:', res);

        if (res.code === 1) {
            statusList.value = res.data.list;
            statusCountMap.value = res.data.status_count;
            console.log('处理后的状态列表:', statusList.value);
        } else {
            console.error('状态列表数据格式不正确:', res);
        }
    } catch (error) {
        console.error('获取状态列表失败:', error);
    }
};

// 获取指定状态的订单数量
const getStatusCount = (status: string): number => {
    if (!status) {
        // 返回全部订单数量（从状态计数中累加）
        return Object.values(statusCountMap.value).reduce((sum, count) => sum + count, 0);
    }
    return statusCountMap.value[status] || 0;
};

// 更新订单状态后的处理
const handleStatusUpdate = async (order: Order, newStatus: OrderStatus) => {
    // 更新本地状态计数
    if (statusCountMap.value[order.status]) {
        statusCountMap.value[order.status]--;
    }
    if (statusCountMap.value[newStatus]) {
        statusCountMap.value[newStatus]++;
    }

    // 如果在当前状态列表中，则移除
    if (currentStatus.value && currentStatus.value === order.status) {
        const index = orderList.value.findIndex(o => o.id === order.id);
        if (index > -1) {
            orderList.value.splice(index, 1);
        }

        // 如果数据不足一页，则加载更多
        if (orderList.value.length < pageSize.value && hasMore.value) {
            await loadData();
        }
    }
};

// 更新订单状态
const updateStatus = async (order: Order, action: ActionType, extraData: any = {}): Promise<ApiResponse | undefined> => {
    const actionTextMap: Record<ActionType, string> = {
        cancel: '取消',
        reject: '退回',
        confirm: '确认',
        complete: '完成',
        delete: '删除',
        update_delivery: '更新配送方式',
        update_express: '更新快递单号',
        pay: '确认打款'
    };

    // 如果是更新配送方式或快递单号，直接执行不需要确认
    if (action === 'update_delivery' || action === 'update_express') {
        try {
            const result = await updateOrderStatus({
                order_id: order.id,
                status: order.status,
                action,
                ...extraData
            }) as ApiResponse;

            if (result.code === 1) {
                uni.showToast({
                    title: `${actionTextMap[action]}成功`,
                    icon: 'success'
                });
                return result;
            }
        } catch (error) {
            console.error(`${actionTextMap[action]}失败:`, error);
        }
        return undefined;
    }

    // 其他操作需要确认
    return new Promise<ApiResponse | undefined>((resolve) => {
        uni.showModal({
            title: '提示',
            content: `确定要${actionTextMap[action]}该订单吗？`,
            success: async (res) => {
                if (res.confirm) {
                    try {
                        const result = await updateOrderStatus({
                            order_id: order.id,
                            status: order.status,
                            action,
                            ...extraData
                        }) as ApiResponse;

                        if (result.code === 1) {
                            uni.showToast({
                                title: `${actionTextMap[action]}成功`,
                                icon: 'success'
                            });
                            resolve(result);
                        } else {
                            resolve(undefined);
                        }
                    } catch (error) {
                        console.error(`${actionTextMap[action]}失败:`, error);
                        resolve(undefined);
                    }
                } else {
                    resolve(undefined);
                }
            }
        });
    });
};

// 订单操作按钮
const renderActionButtons = (order: Order): ActionButton[] => {
    const buttons: ActionButton[] = [];

    switch (order.status) {
        case '1': // 待确认
            buttons.push({
                text: '取消订单',
                type: 'cancel',
                class: 'btn-cancel'
            });
            break;

        case '3': // 已质检
            buttons.push({
                text: '确认价格',
                type: 'confirm',
                class: 'btn-primary'
            }
                // , {
                //     text: '退回设备',
                //     type: 'reject',
                //     class: 'btn-warning'
                // }
            );
            break;



        case '5': // 已打款
            buttons.push({
                text: '完成订单',
                type: 'complete',
                class: 'btn-primary'
            });
            break;

        case '7': // 已取消
            buttons.push({
                text: '删除订单',
                type: 'delete',
                class: 'btn-danger'
            });
            break;
    }

    return buttons;
};

// 跳转详情
const goDetail = (order: any) => {
    console.log(order);

    redirect({ url: `/addon/phone_shop_price/pages/order/detail?id=${order.id}`, mode: 'navigateTo' });
};

// 状态样式映射
const statusClassMap: Record<OrderStatus, string> = {
    '1': 'pending',      // 待确认
    '2': 'checking',     // 质检中
    '3': 'checked',      // 已质检
    '4': 'paying',       // 待打款
    '5': 'payed',        // 已打款
    '6': 'completed',    // 已完成
    '7': 'cancelled',    // 已取消
    '8': 'returning',    // 退回中
    '9': 'returned'      // 已退回
};

// 状态文本映射
const statusTextMap: Record<OrderStatus, string> = {
    '1': '待确认',      // PENDING_CONFIRM
    '2': '质检中',      // CHECKING
    '3': '已质检',      // CHECKED
    '4': '待打款',      // PAYING
    '5': '已打款',      // PAYED
    '6': '已完成',      // COMPLETED
    '7': '已取消',      // CANCELLED
    '8': '退回中',      // RETURNING
    '9': '已退回'       // RETURNED
};

// 获取状态样式类
const getStatusClass = (status: OrderStatus): string => {
    return statusClassMap[status] || 'pending';
};

// 获取状态文本
const getStatusText = (status: OrderStatus): string => {
    return statusTextMap[status] || '待确认';
};

// 添加时间格式化函数
const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 计算订单总价
const calculateTotalPrice = (order: Order): string => {
    return order.devices.reduce((total, device) => {
        return total + (parseFloat(device.final_price) || 0);
    }, 0).toFixed(2);
};

// 取消订单
const cancelOrder = (order: Order) => {
    updateStatus(order, 'cancel');
};

// 退回订单
const rejectOrder = (order: Order) => {
    updateStatus(order, 'reject');
};

// 确认订单
const confirmOrder = (order: Order) => {
    updateStatus(order, 'confirm');
};

// 确认完成
const completeOrder = (order: Order) => {
    updateStatus(order, 'complete');
};

// 切换配送方式
const toggleDeliveryType = async (order: Order, type: 'mail' | 'self') => {
    if (order.delivery_type === type) return;

    const result = await updateStatus(order, 'update_delivery', { delivery_type: type });
    if (result?.code === 1) {
        order.delivery_type = type;
        // 重新加载数据以更新状态
        await loadData();
    }
};



onMounted(() => {
    loadStatusList().then(() => {
        loadData(); // 在状态列表加载完成后再加载订单数据
    });
});
onShow(() => {
    loadStatusList();
    loadData();
});
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: #F2F2F7;
    padding-bottom: env(safe-area-inset-bottom);
}

.header-section {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    border-bottom: 1rpx solid rgba(60, 60, 67, 0.1);
    display: flex;
    flex-direction: column;
}

.delivery-filter {
    padding: 12rpx 20rpx;
    background: #fff;
    border-bottom: 1rpx solid #f5f5f5;

    .filter-options {
        display: flex;
        gap: 12rpx;

        .filter-item {

            text-align: center;
            font-size: 26rpx;
            padding: 12rpx;
            color: #666;
            background: #F2F2F7;
            border-radius: 8rpx;
            transition: all 0.3s;

            &.active {
                background: #007AFF;
                color: #fff;
            }

            &:active {
                opacity: 0.8;
            }
        }
    }
}

.status-nav {
    flex: 1;
    padding-right: 220rpx; // 为右侧筛选留出空间
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1rpx solid rgba(60, 60, 67, 0.1);
    white-space: nowrap;

    .nav-items {
        display: inline-flex;
        padding: 12rpx 20rpx;
        min-width: 100%;
    }

    .nav-item {
        display: inline-flex;
        align-items: center;
        padding: 16rpx 24rpx;
        font-size: 28rpx;
        color: #666;
        position: relative;
        flex-shrink: 0;
        gap: 8rpx;

        .count {
            font-size: 20rpx;
            background: #FF3B30;
            color: #fff;
            padding: 2rpx 8rpx;
            border-radius: 20rpx;
            min-width: 28rpx;
            text-align: center;
        }

        &.active {
            color: #007AFF;
            font-weight: 500;

            &::after {
                content: '';
                position: absolute;
                bottom: -12rpx;
                left: 24rpx;
                right: 24rpx;
                height: 2rpx;
                background: #007AFF;
            }
        }

        &:active {
            opacity: 0.7;
        }
    }
}

.order-item {
    background: #fff;
    border-radius: 16rpx;
    margin: 20rpx;
    overflow: hidden;
    box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);

    .order-header {
        padding: 24rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1rpx solid #f5f5f5;

        .header-left {
            display: flex;
            flex-direction: column;
            gap: 8rpx;

            .order-no {
                font-size: 28rpx;
                color: #333;
                font-weight: 500;
            }

            .time {
                font-size: 24rpx;
                color: #999;
            }
        }

        .header-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8rpx;

            .delivery-type-tag {
                display: flex;
                align-items: center;
                gap: 4rpx;
                background: #F2F2F7;
                padding: 4rpx 12rpx;
                border-radius: 6rpx;

                text {
                    font-size: 24rpx;
                    color: #666;
                }

                .express-id {
                    margin-left: 8rpx;
                    color: #999;
                    font-size: 22rpx;
                }
            }
        }
    }

    .order-content {
        padding: 24rpx;

        .device-info {
            .device-count {
                display: flex;
                align-items: center;
                gap: 12rpx;
                margin-bottom: 20rpx;

                text {
                    font-size: 26rpx;
                    color: #666;
                }
            }

            .device-list {
                .device-item {
                    display: flex;
                    align-items: center;
                    gap: 16rpx;
                    padding: 16rpx 0;
                    border-bottom: 1rpx solid #f5f5f5;

                    .model {
                        font-size: 28rpx;
                        color: #333;
                        flex: 1;
                    }

                    .imei {
                        font-size: 24rpx;
                        color: #666;
                    }

                    .price {
                        font-size: 28rpx;
                        color: #FF3B30;
                        font-weight: 500;

                        &.pending {
                            color: #999;
                        }

                        &.checking {
                            color: #007AFF;
                        }

                        &.checked {
                            color: #5856D6;
                        }

                        &.confirmed {
                            color: #FF9500;
                        }

                        &.completed {
                            color: #34C759;
                        }

                        &.returned {
                            color: #8E8E93;
                        }
                    }
                }

                .device-item:last-child {
                    border: none;
                    padding-bottom: 0;
                }
            }

        }
    }

    .order-footer {
        padding: 24rpx;
        border-top: 1rpx solid #f5f5f5;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .total-info {
            .total-label {
                font-size: 26rpx;
                color: #666;
                margin-right: 12rpx;
            }

            .total-price {
                font-size: 32rpx;
                color: #FF3B30;
                font-weight: 600;
            }
        }

        .action-buttons {
            display: flex;
            gap: 16rpx;

            .btn {
                padding: 12rpx 24rpx;
                font-size: 26rpx;
                border-radius: 8rpx;

                &.btn-cancel {
                    background: #f5f5f5;
                    color: #666;
                }

                &.btn-primary {
                    background: #007AFF;
                    color: #fff;
                }

                &.btn-warning {
                    background: #FF9500;
                    color: #fff;
                }

                &:active {
                    opacity: 0.8;
                }
            }
        }
    }
}

.empty-state {
    padding: 120rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20rpx;

    text {
        font-size: 28rpx;
        color: #999;
    }
}

.loading-more {
    text-align: center;
    padding: 30rpx 0;

    text {
        font-size: 24rpx;
        color: #999;
    }
}

.order-list {
    height: calc(100vh - 140rpx - var(--status-bar-height));
    padding: 0rpx;
    box-sizing: border-box;
}

.order-status {
    font-size: 26rpx;
    font-weight: 500;

    &.pending {
        color: #FF9500; // 橙色 - 待确认
    }

    &.checking {
        color: #007AFF; // 蓝色 - 质检中
    }

    &.checked {
        color: #5856D6; // 紫色 - 已质检
    }

    &.paying {
        color: #FF3B30; // 红色 - 待打款
    }

    &.payed {
        color: #FF9500; // 橙色 - 已打款
    }

    &.completed {
        color: #34C759; // 绿色 - 已完成
    }

    &.cancelled {
        color: #8E8E93; // 灰色 - 已取消
    }

    &.returning {
        color: #FF9500; // 橙色 - 退回中
    }

    &.returned {
        color: #8E8E93; // 灰色 - 已退回
    }
}
</style>