<template>
    <view class="page">
        <!-- Banner区域 -->
        <view class="banner-section">
            <swiper class="banner-swiper" circular autoplay interval="3000" duration="500" @change="onSwiperChange">
                <swiper-item v-for="(item, index) in bannerList" :key="index">
                    <image :src="item.image" mode="aspectFill" class="banner-image" />
                </swiper-item>
            </swiper>
            <view class="banner-indicator">
                <view v-for="(item, index) in bannerList" :key="index"
                    :class="['indicator-dot', currentBannerIndex === index ? 'active' : '']">
                </view>
            </view>
        </view>

        <!-- 头部搜索区 -->
        <view class="search-section">
            <view class="search-box">
                <up-icon name="search" size="20" color="#666"></up-icon>
                <input type="text" placeholder="搜索品牌型号" class="search-input"
                    @focus="() => redirect({ url: '/addon/phone_shop_price/pages/category' })" />
            </view>
        </view>

        <!-- VIP提示区 -->
        <view class="vip-section" v-if="hasNeedVip">
            <view class="vip-content" v-if="!isVip">
                <view class="vip-text">
                    <up-icon name="vip" size="20" color="#FFD700"></up-icon>
                    <text class="ml-2">开通VIP享受更多专业报价</text>
                </view>
                <button class="vip-btn" @click="linkVip()">立即开通</button>
            </view>
            <view class="vip-content" v-else>
                <view class="vip-text">
                    <up-icon name="vip-filled" size="20" color="#FFD700"></up-icon>
                    <text class="ml-2">尊敬的 {{ vip_name }} 会员</text>
                </view>
            </view>
        </view>

        <!-- 快捷操作区 -->

        <view class="quick-actions">
            <view class="action-item" @click="toAddOrder">
                <up-icon name="file-text" size="24" color="#007AFF"></up-icon>
                <text>立即报单</text>
            </view>
            <view class="action-item" @click="redirect({ url: '/addon/phone_shop_price/pages/order/list' })">
                <up-icon name="order" size="24" color="#007AFF"></up-icon>
                <text>我的订单</text>
            </view>
            <view class="action-item" @click="redirect({ url: '/addon/phone_shop_price/pages/payment/index' })">
                <up-icon name="wallet" size="24" color="#007AFF"></up-icon>
                <text>收款方式</text>
            </view>
        </view>

        <!-- 分类列表区 -->
        <view class="category-section">
            <view class="category-item" v-for="(item, itemIndex) in categoryList" :key="itemIndex"
                v-show="item.is_show">
                <view class="category-header">
                    <text class="category-title">{{ item.category_name }}</text>
                    <text class="category-count" v-if="item.child_list">{{ getFilteredChildList(item).length
                        }}个分类</text>
                </view>

                <view class="category-content" v-if="item.child_list && item.child_list.length">
                    <up-grid :border="false" col="4">
                        <up-grid-item v-for="(listItem, listIndex) in getFilteredChildList(item)" :key="listIndex"
                            @click="handleClick(listItem.category_id)" class="grid-item">
                            <view class="grid-item-content">
                                <!-- VIP标识 -->
                                <!-- <view v-if="listItem.need_vip" class="vip-tag">
                                    <image src="https://vip.123pan.cn/1832133965/tiantai/vip2.png" mode="aspectFit"
                                        class="vip-icon" />
                                </view> -->

                                <!-- 品牌图标 -->
                                <view class="brand-icon">
                                    <up-icon :customStyle="{ padding: '10rpx' }" :name="img(listItem.image)"
                                        :size="40" />
                                </view>

                                <!-- 品牌名称 -->
                                <text class="brand-name">{{ listItem.category_name }}</text>
                            </view>
                        </up-grid-item>
                    </up-grid>
                </view>

                <view class="empty-category" v-else>
                    <up-icon name="info" size="24" color="#999"></up-icon>
                    <text>暂无报价信息</text>
                </view>
            </view>
        </view>

        <!-- VIP弹窗 -->
        <up-modal :show="is_vip_dialog" :title="title" :content="content" showCancelButton
            @cancel="is_vip_dialog = false" @confirm="linkVip()" cancelText="暂不开通" confirmText="立即开通">
            <view class="vip-modal-content">
                <view class="vip-benefits">
                    <view class="benefit-item" v-for="(benefit, index) in levelBenefits" :key="index">
                        <up-icon name="checkmark-circle" color="#FFD700" size="20"></up-icon>
                        <text>{{ benefit.title }}</text>
                    </view>
                </view>
                <view class="vip-price">
                    <text class="price-label">开通价格</text>
                    <view class="price-options">
                        <view v-for="(fee, index) in feeList" :key="index" class="price-option"
                            :class="{ active: selectedFeeIndex === index }" @click="selectedFeeIndex = index">
                            <text class="option-name">{{ fee.name }}</text>
                            <view class="option-price">
                                <text class="currency">¥</text>
                                <text class="amount">{{ fee.price }}</text>
                            </view>
                            <text class="option-market-price" v-if="fee.market_price">原价 ¥{{ fee.market_price }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </up-modal>
    </view>


</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { getCategoryTree } from '@/addon/phone_shop_price/api/recycle';
import { getMemberLevel } from '@/addon/tk_vip/api/member';

import { img, redirect } from '@/utils/common';
import useMemberStore from "@/stores/member";
import { useLogin } from "@/hooks/useLogin";

const memberStore = useMemberStore();
const userInfo = computed(() => memberStore.info);

// Banner数据
const bannerList = ref([
    {
        image: 'https://vip.123pan.cn/1832133965/tiantai/172700160816188b1d81b95069f643e50166ae526e_ott.png'
    },
    {
        image: 'https://vip.123pan.cn/1832133965/tiantai/172700160816188b1d81b95069f643e50166ae526e_ott.png'
    }
]);
const currentBannerIndex = ref(0);

// 轮播切换事件处理
const onSwiperChange = (e) => {
    currentBannerIndex.value = e.detail.current;
};

// VIP等级数据
const memberLevels = ref([]);
const currentLevel = computed(() => memberLevels.value[0] || null);
const selectedFeeIndex = ref(0);

// 获取会员权益列表
const levelBenefits = computed(() => {
    if (!currentLevel.value?.level_benefits) return [];
    return Object.values(currentLevel.value.level_benefits)
        .filter(benefit => benefit.is_use === 1)
        .map(benefit => benefit.content);
});

// 获取收费方案列表
const feeList = computed(() => {
    if (!currentLevel.value?.level_benefits?.tk_vip_fee?.fee_info) return [];
    return currentLevel.value.level_benefits.tk_vip_fee.fee_info.filter(fee => fee.is_use === "1");
});

// 修改VIP相关文案
const title = computed(() => currentLevel.value ? `开通${currentLevel.value.level_name}` : '开通VIP会员');
const content = computed(() => currentLevel.value ? currentLevel.value.remark : '开通VIP会员即可享受以下特权：');

let categoryList = ref([]);
let flattenCategoryList = ref([]);
const is_vip_dialog = ref(false);
const isVip = computed(() => userInfo.value?.member_level);
const vip_name = computed(() => userInfo.value?.member_level_name);

onMounted(() => {
    if (!userInfo.value) {
        useLogin().setLoginBack({ url: "/addon/phone_shop_price/pages/index" });
    }

    // 使用 Promise.all 同时获取分类和会员数据
    Promise.all([
        getCategoryTree(),
        getMemberLevel()
    ]).then(([categoryRes, memberRes]) => {
        if (categoryRes.code === 1 && categoryRes.data) {
            categoryList.value = categoryRes.data;
            flattenCategoryList.value = flattenArray(categoryRes.data);
        }

        if (memberRes.code === 1 && memberRes.data) {
            memberLevels.value = memberRes.data;
        }
    }).catch(error => {
        console.error('数据获取失败:', error);
    });
});

const getFilteredChildList = (item) => item.child_list.filter(listItem => listItem.is_show);

const handleClick = (id) => {
    const itemIndex = flattenCategoryList.value.findIndex(v => v.category_id === id);

    if (itemIndex === -1 || !flattenCategoryList.value[itemIndex].images) {
        is_vip_dialog.value = true;
    } else {
        previewImages(flattenCategoryList.value[itemIndex].images);
    }
};

const previewImages = (images) => {
    if (!images.startsWith('http')) {
        images = getImgUrl() + images;
    }
    uni.previewImage({
        indicator: "number",
        loop: true,
        urls: Array.isArray(images) ? images : [images]
    });
};

const getImgUrl = () => {
    return import.meta.env.VITE_IMG_DOMAIN || '';
}

const linkVip = () => {
    const fee = feeList.value[selectedFeeIndex.value];
    uni.navigateTo({
        url: `/addon/tk_vip/pages/index?level_id=${currentLevel.value?.level_id}&fee_id=${fee?.id}`
    });
};

const toAddOrder = () => {
    uni.navigateTo({ url: '/addon/phone_shop_price/pages/order/order' });
};

function flattenArray(data) {
    return data.reduce((acc, item) => {
        if (item.images) acc.push(item);
        if (item.child_list && item.child_list.length) {
            acc = acc.concat(flattenArray(item.child_list));
        }
        return acc;
    }, []);
}

const hasNeedVip = computed(() => {
    return categoryList.value.some(item =>
        item.child_list && item.child_list.some(child => child.need_vip === 1)
    );
});

// 添加CSS变量设置
const updateLevelColors = () => {
    if (currentLevel.value?.level_style) {
        document.documentElement.style.setProperty('--level-color', currentLevel.value.level_style.level_color || '#FFD700');
        document.documentElement.style.setProperty('--level-bg-color', `rgba(${currentLevel.value.level_style.level_color || '#FFD700'}, 0.1)`);
    }
};

// 监听currentLevel的变化
watch(() => currentLevel.value, (newVal) => {
    if (newVal) {
        updateLevelColors();
    }
}, { immediate: true });

</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 100rpx;
}

// Banner样式
.banner-section {
    position: relative;
    height: 300rpx;

    .banner-swiper {
        width: 100%;
        height: 100%;
    }

    .banner-image {
        width: 100%;
        height: 100%;
    }

    .banner-indicator {
        position: absolute;
        bottom: 20rpx;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10rpx;
        z-index: 1;

        .indicator-dot {
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transition: all 0.3s ease;

            &.active {
                background: #fff;
                width: 24rpx;
                border-radius: 6rpx;
            }
        }
    }
}

// 搜索区域样式
.search-section {
    padding: 20rpx;
    background: #fff;
    margin-bottom: 20rpx;

    .search-box {
        display: flex;
        align-items: center;
        background: #f5f5f5;
        padding: 15rpx 30rpx;
        border-radius: 40rpx;

        .search-input {
            flex: 1;
            margin-left: 20rpx;
            font-size: 28rpx;
        }
    }
}

// VIP区域样式
.vip-section {
    margin: 20rpx;
    background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
    border-radius: 16rpx;
    padding: 30rpx;

    .vip-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .vip-text {
            display: flex;
            align-items: center;
            color: #FFD700;
        }

        .vip-btn {
            background: #FFD700;
            color: #1a1a1a;
            padding: 10rpx 30rpx;
            border-radius: 30rpx;
            font-size: 24rpx;
        }
    }
}

// 快捷操作区样式
.quick-actions {
    display: flex;
    justify-content: space-around;
    padding: 30rpx;
    background: #fff;
    margin: 20rpx;
    border-radius: 16rpx;

    .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10rpx;

        text {
            font-size: 24rpx;
            color: #333;
        }
    }
}

// 分类列表样式
.category-section {
    padding: 20rpx;

    .category-item {
        background: #fff;
        border-radius: 16rpx;
        margin-bottom: 20rpx;
        overflow: hidden;

        .category-header {
            padding: 20rpx;
            border-bottom: 1px solid #f5f5f5;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .category-title {
                font-size: 32rpx;
                font-weight: 600;
                color: #333;
            }

            .category-count {
                font-size: 24rpx;
                color: #999;
            }
        }

        .category-content {
            padding: 20rpx;
        }
    }
}

.grid-item {
    .grid-item-content {
        position: relative;
        padding: 20rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10rpx;

        .vip-tag {
            position: absolute;
            top: 0;
            right: 0;
            width: 40rpx;
            height: 40rpx;

            .vip-icon {
                width: 100%;
                height: 100%;
            }
        }

        .brand-icon {
            width: 80rpx;
            height: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .brand-name {
            font-size: 24rpx;
            color: #333;
            text-align: center;
            white-space: nowrap;
            /* 不换行 */
            overflow: hidden;
            /* 超出隐藏 */
            text-overflow: ellipsis;
            /* 超出显示省略号 */
            width: 100%;
            /* 确保宽度占满 */
            padding: 0 10rpx;
            /* 左右添加一些内边距 */
            box-sizing: border-box;
            /* 确保padding不会影响总宽度 */
        }
    }
}

// 空状态样式
.empty-category {
    padding: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;

    text {
        font-size: 24rpx;
        color: #999;
    }
}

// VIP弹窗样式
.vip-modal-content {
    padding: 30rpx 20rpx;

    .vip-benefits {
        margin: 30rpx 0;

        .benefit-item {
            display: flex;
            align-items: center;
            gap: 15rpx;
            margin-bottom: 25rpx;
            padding: 15rpx 20rpx;
            background: rgba(255, 215, 0, 0.05);
            border-radius: 12rpx;

            text {
                font-size: 28rpx;
                color: #333;
                font-weight: 500;
            }
        }
    }

    .vip-price {
        background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
        padding: 40rpx 30rpx;
        border-radius: 16rpx;
        text-align: center;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

        .price-label {
            font-size: 26rpx;
            color: #FFD700;
            margin-bottom: 15rpx;
            display: block;
            letter-spacing: 2rpx;
        }

        .price-options {
            display: flex;
            flex-wrap: wrap;
            gap: 20rpx;

            .price-option {
                flex: 1;
                min-width: 200rpx;
                background: #2a2a2a;
                padding: 20rpx;
                border-radius: 12rpx;
                text-align: center;
                border: 2rpx solid transparent;
                transition: all 0.3s;

                &.active {
                    border-color: #FFD700;
                    background: rgba(255, 215, 0, 0.1);
                }

                .option-name {
                    font-size: 24rpx;
                    color: #fff;
                    margin-bottom: 10rpx;
                    display: block;
                }

                .option-price {
                    margin: 10rpx 0;

                    .currency {
                        font-size: 24rpx;
                        color: #FFD700;
                    }

                    .amount {
                        font-size: 36rpx;
                        font-weight: bold;
                        color: #FFD700;
                        margin: 0 4rpx;
                    }
                }

                .option-market-price {
                    font-size: 24rpx;
                    color: rgba(255, 255, 255, 0.4);
                    text-decoration: line-through;
                }
            }
        }
    }
}
</style>
