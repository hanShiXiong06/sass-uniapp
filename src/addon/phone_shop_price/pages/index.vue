<template>
    <view class="page">
        <view class="text-2xl text-center p-2"> 回收♻️报价 </view>
        <view class="text-center">做更真实的报价!</view>

        <view class="mt-3 text-xs flex justify-between p-2">
            <view v-if="hasNeedVip">
                <view v-if="!isVip">
                    同行报价单需要开通VIP才能查看
                    点击<text class="text-[#007AFF]" @click="linkVip()">开通VIP</text>
                </view>
                <view v-else>
                    恭喜您已成为VIP-{{ vip_name }}-等级
                </view>
            </view>
            <view class="text-[#ff4000]">
                <text @click="toAddOrder"> 立即报单 </text>
                <text @click="redirect({ url: '/addon/phone_shop_price/pages/order/list' })"> 我的订单 </text>

            </view>
        </view>

        <view class="list mt-3 bg-white shadow rounded" v-for="(item, itemIndex) in categoryList" :key="itemIndex"
            v-show="item.is_show">
            <view class="title">{{ item.category_name }}</view>
            <view class="p-2" v-if="item.child_list && item.child_list.length">
                <up-grid :border="false" col="4">
                    <up-grid-item v-for="(listItem, listIndex) in getFilteredChildList(item)" :key="listIndex"
                        @click="handleClick(listItem.category_id)">
                        <view v-if="listItem.need_vip" class="w-8 h-5 vip_box">
                            <image src="https://vip.123pan.cn/1832133965/tiantai/vip2.png" mode="aspectFit"
                                class="vip_bg w-full h-10" />
                        </view>
                        <up-icon class="rounded" :customStyle="{ padding: 10 + 'rpx' }" :name="img(listItem.image)"
                            :size="30" />
                        <text class="grid-text">{{ listItem.category_name }}</text>
                    </up-grid-item>
                </up-grid>
            </view>
            <view class="list_box bg-white shadow rounded" v-else>
                <view class="list_item">
                    <view>暂无报价</view>
                </view>
            </view>
        </view>

        <up-modal cancelText="取消" showCancelButton confirmText="购买VIP" @cancel="is_vip_dialog = false"
            @confirm="linkVip()" :show="is_vip_dialog" :title="title" :content="content"></up-modal>
    </view>

    <tabbar />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCategoryTree } from '@/addon/phone_shop_price/api/recycle';
import { img, redirect } from '@/utils/common';
import useMemberStore from "@/stores/member";
import { useLogin } from "@/hooks/useLogin";

const memberStore = useMemberStore();
const userInfo = computed(() => memberStore.info);

const title = '购买VIP';
const content = '当前部分报价需要开通或升级VIP,如有需求请购买或升级VIP';

let categoryList = ref([]);
let flattenCategoryList = ref([]);
const is_vip_dialog = ref(false);
const isVip = computed(() => userInfo.value?.member_level);
const vip_name = computed(() => userInfo.value?.member_level_name);

// 页面加载时执行的逻辑
onMounted(() => {
    if (!userInfo.value) {
        useLogin().setLoginBack({ url: "/addon/phone_shop_price/pages/index" });
    }

    getCategoryTree().then((res) => {
        categoryList.value = res.data;
        flattenCategoryList.value = flattenArray(res.data);
    });
});

// 筛选显示的子项目
const getFilteredChildList = (item) => item.child_list.filter(listItem => listItem.is_show);

// 处理点击事件
const handleClick = (id) => {
    const itemIndex = flattenCategoryList.value.findIndex(v => v.category_id === id);

    if (itemIndex === -1 || !flattenCategoryList.value[itemIndex].images) {
        is_vip_dialog.value = true; // 显示弹窗
    } else {
        previewImages(flattenCategoryList.value[itemIndex].images);
    }
};

// 预览图片
const previewImages = (images) => {
    // 判断 images中是否 开头是是 http如果不是 
    console.log(images.startsWith('http'));

    if (!images.startsWith('http')) {
        images = getImgUrl(images) + images;
    }
    console.log(images);
    uni.previewImage({
        indicator: "number",
        loop: true,
        urls: Array.isArray(images) ? images : [images]
    });
};

// 获取 图片的url 域名 从 vite中
// 获取图片域名
const getImgUrl = () => {
    return import.meta.env.VITE_IMG_DOMAIN || '';
}


// 跳转到购买VIP页面
const linkVip = () => {

    uni.navigateTo({ url: '/addon/tk_vip/pages/index' });
};

// 跳转到报单页面
const toAddOrder = () => {
    uni.navigateTo({ url: '/addon/phone_shop_price/pages/order' });
};

// 扁平化数组
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


// 
</script>



<style lang="scss" scoped>
.page {

    background-color: #efefef;
    padding: 10px;
}

.list_item {}

.list {
    display: flex;
    flex-direction: column;
    margin-bottom: 20rpx;

    .title {
        padding-left: 20rpx;
        text-align: left;
        font-weight: 600;
        border-bottom: 1px solid #ccc;
        padding-top: 5rpx;
    }


}

.list_box {

    display: flex;
    // 一行4个
    flex-wrap: wrap;
    justify-content: space-between;
    border-radius: 10rpx;
    padding: 10rpx;

    .list_item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 25%;
        justify-content: center;
        font-size: 24rpx;
        margin-top: 5rpx;

        >view {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 5rpx;
        }
    }
}

.grid-text {
    font-size: 24rpx;
    color: #322f2f;
}

.title {
    border-bottom: 1px solid #ccc;
}

.vip_box {
    position: absolute;
    top: -10px;
    z-index: 99;
    transform: translate(30rpx, 10rpx)rotateZ(45deg);
}
</style>
