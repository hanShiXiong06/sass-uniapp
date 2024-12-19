<template>
    <view class="bg-[#F4F6F8] min-h-screen">

        <view class="mescroll-box" v-if="lists.length">
            <view v-if="config.search.control"
                class="search-box z-10 bg-[#fff] fixed top-0 left-0 right-0 h-[106rpx] box-border">
                <up-tabs :list="lists" @click="handleClick"></up-tabs>
            </view>

            <view class="tabs-box z-2 fixed left-0 bg-[#fff] bottom-[50px] top-0"
                :class="{ '!top-[106rpx]': config.search.control }">
                <scroll-view :scroll-y="true" class="scroll-height">
                    <view class="bg-[#F4F6F8]">

                        <view class="tab-item flex "
                            :class="{ 'tab-item-active': index == tabActive, 'rounded-br-[12rpx]': tabActive - 1 === index, 'rounded-tr-[12rpx]': tabActive + 1 === index }"
                            v-for="(item, index) in lists[current].child" :key="index"
                            @click="firstLevelClick(index, item)">
                            <view class="text-box px-[10rpx] text-[24rpx] ">
                                {{ item.name }}
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>
            <scroll-view class="h-[100vh]" :scroll-y="true">
                <view class=" pl-[212rpx]  scroll-ios pt-[20rpx] pr-[20rpx]"
                    :class="{ '!pt-[126rpx]': config.search.control }">
                    <up-sticky>
                        <view class="bg-[#fff] rounded p-2">
                            <view class="flex justify-between items-center">
                                <up-text type="primary" :text="lists[current].child[tabActive].name"></up-text>
                                <button size="mini" type="link" @click="toRecharge"> 立即充值</button>
                            </view>
                            <view class="flex justify-between items-center">
                                价格: <up-text type="error" :text="lists[current].child[tabActive].price"></up-text>
                                积分: <up-text type="error"
                                    :text="(lists[current].child[tabActive].price * 100).toFixed(0)"></up-text>
                            </view>
                            <up-textarea class="m-2" v-model="imeis" placeholder="请输入手机串号查询"></up-textarea>
                            <view class="flex m-2">
                                <up-button class="m-2" type="primary"
                                    @click="handleQuery(lists[current].child[tabActive].id, 'point')"
                                    text="积分查询"></up-button>
                                <up-button class="m-2" type="primary"
                                    @click="handleQuery(lists[current].child[tabActive].id, 'balance')"
                                    text="余额查询"></up-button>
                            </view>
                        </view>

                    </up-sticky>
                    <view class=" mt-2"> 查询历史 </view>
                    <view v-if="modelList.length !== 0" class="  bg-[#fff] rounded p-2 ">
                        <up-cell-group>
                            <!-- <up-cell v-for="(value, key) in modelList" :key="key" :title="key" isLink
                                @click='tolink(value.id)'> -->
                            <up-cell v-for="(value, key) in modelList" :key="key" :title="key" isLink
                                :url="'/addon/hsx_phone_query/pages/detail?id=' + value.id">
                                <template #title>
                                    <view class="u-slot-title">

                                        <view class="u-cell-text text-sm">{{ value.type_name }}</view>
                                        <view class="u-cell-text  text-sm">{{ value.sn }}</view>

                                    </view>
                                </template>
                            </up-cell>
                        </up-cell-group>


                    </view>
                    <view v-else>
                        <u-empty text="暂无查询记录" mode="list"></u-empty>
                    </view>
                </view>
            </scroll-view>
        </view>
        <view class="loading">
            <u-loading-icon bg-color="rgb(248,248,248)" v-if="loading" loadingText="" fontSize="32"
                color="#303133"></u-loading-icon>
        </view>

        <!-- <tabbar /> -->
    </view>

</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { img, redirect } from '@/utils/common';
import { getGoodsCategoryTree } from '@/addon/phone_shop/api/goods';
import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
import { t } from '@/locale';

import { getCategoryTree, getQueryModelList, getModelList } from '@/addon/hsx_phone_query/api/index'
import { onLoad } from '@dcloudio/uni-app'
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
import useCartStore from '@/addon/phone_shop/stores/cart'
import useMemberStore from "@/stores/member";
import { useLogin } from "@/hooks/useLogin";



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
        _getModelList()
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

const uToastRef = ref(null)
const handleQuery = async (id, payType) => {
    // 查询 loading
    loading.value = true;
    // 如果 imeis 为空
    if (!imeis.value) {
        uni.showToast({
            title: '请输入手机SN',
            icon: 'error',
            duration: 2000
        });
        return
    }

    await getQueryModelList({ imeis: imeis.value, id, payType }).then(res => {
        if (res.code != 1) return
        _getModelList()
    }).catch(err => {
        uni.showToast({
            title: err.msg,
            icon: 'none',
            duration: 2000
        });
    })
    imeis.value = ''
    loading.value = false;
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
</script>
<style lang="scss" scoped>
.loading {
    position: fixed;
    left: 50%;
    top: 50%;
}

.border-color {
    border-color: var(--primary-color) !important;
}

.text-color {
    color: var(--primary-color) !important;
}

.bg-color {
    background-color: var(--primary-color) !important;
}

.class-select {
    position: relative;
    font-weight: bold;

    &::before {
        content: "";
        position: absolute;
        bottom: 0;
        height: 6rpx;
        background-color: $u-primary;
        width: 90%;
        left: 50%;
        transform: translateX(-50%);
    }
}

.list-select {
    position: relative;
    margin-right: 28rpx;

    &::before {
        content: "";
        position: absolute;
        background-color: #999;
        width: 2rpx;
        height: 70%;
        top: 50%;
        right: -14rpx;
        transform: translatey(-50%);
    }
}

.transform-rotate {
    transform: rotate(180deg);
}

.text-color {
    color: $u-primary;
}

.bg-color {
    background-color: $u-primary;
}

.search-box {
    // position: relative;
    padding: 20rpx 24rpx;
}

.search-box .search-ipt {
    height: 64rpx;
    background-color: #F6F8F8;
    padding-left: 20rpx;
    border-radius: 33rpx;
}

.search-box .search-ipt .input-placeholder {
    color: #A5A6A6;
}

.tabs-box {
    width: 200rpx;
    font-size: 28rpx;


}

.tabs-box .tab-item {
    height: 92rpx;
    text-align: center;
    line-height: 92rpx;
    background-color: #fff;
    align-items: center;
}


.tabs-box .tab-item-active {
    position: relative;
    color: var(--primary-color);
    background-color: #F4F6F8;

    &::before {
        display: inline-block;
        position: absolute;
        left: 0rpx;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        width: 6rpx;
        height: 48rpx;
        background-color: var(--primary-color);
    }

    &::after {
        display: inline-block;
        position: absolute;
        left: 0rpx;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        width: 6rpx;
        height: 48rpx;
        background-color: var(--primary-color);
    }
}

$white-bj: #fff;

.mescroll-box {
    height: 100vh;
}

.panic-buying {
    background-color: var(--primary-color);
    color: $white-bj;
}

:deep(.mescroll-upwarp) {
    box-sizing: border-box;
    padding-left: 182rpx;
}

:deep(.tab-bar-placeholder) {
    display: none !important;
}

:deep(.u-tabbar__placeholder) {
    display: none !important;
}

/*  #ifdef  H5  */
.scroll-ios {
    padding-bottom: calc(0px + 20rpx + constant(safe-area-inset-bottom)) !important;
    padding-bottom: calc(0px + 20rpx + env(safe-area-inset-bottom)) !important;
}

/*  #endif  */
/*  #ifndef  H5  */
.scroll-ios {
    padding-bottom: calc(120rpx + constant(safe-area-inset-bottom)) !important;
    padding-bottom: calc(120rpx + env(safe-area-inset-bottom)) !important;
}

/*  #endif  */
.scroll-height {
    height: 100%;
}

/*  #ifdef  H5  */
.noData1 {
    height: calc(100vh - 146rpx - 0px - constant(safe-area-inset-bottom));
    height: calc(100vh - 146rpx - 0px - env(safe-area-inset-bottom));
}

.noData2 {
    height: calc(100vh - 40rpx - 0px - constant(safe-area-inset-bottom));
    height: calc(100vh - 40rpx - 0px - env(safe-area-inset-bottom));
}

/*  #endif  */
/*  #ifndef  H5  */
.noData1 {
    height: calc(100vh - 146rpx - 0rpx - constant(safe-area-inset-bottom));
    height: calc(100vh - 146rpx - 0rpx - env(safe-area-inset-bottom));
}

.noData2 {
    height: calc(100vh - 40rpx - 0rpx - constant(safe-area-inset-bottom));
    height: calc(100vh - 40rpx - 0rpx - env(safe-area-inset-bottom));
}

/*  #endif  */
</style>
