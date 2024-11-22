<template>

    <view class="page">
        <u-form :model="form" :rules="rules" ref="formRef" label-position="left">

            <view class="box rounded">
                <view class="title">出货信息</view>
                <up-row customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="demo-layout">出货数量</view>
                    </up-col>
                    <up-col span="9">
                        <view class="demo-layout">
                            <up-number-box v-model="form.count" @change="valChange"></up-number-box>
                        </view>
                    </up-col>
                </up-row>
                <up-row customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="demo-layout">备注</view>
                    </up-col>
                    <up-col span="9">
                        <view class="demo-layout">

                            <up-textarea v-model="form.comment" placeholder="请输入内容"></up-textarea>
                        </view>
                    </up-col>
                </up-row>
            </view>
            <view class="box rounded mt-2">
                <view class="title">寄件信息</view>
                <up-row customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="demo-layout bg-purple-light">快递单号</view>
                    </up-col>
                    <up-col span="9">
                        <view class="p-r">
                            <u-form-item prop="express_id">
                                <u-input placeholder="输入或扫描快递单号" border="surround" clearable v-model="form.express_id">
                                    <template #suffix>
                                        <up-icon @click="scanCode" name="scan" size="24"></up-icon>
                                    </template>
                                </u-input>
                            </u-form-item>
                        </view>
                    </up-col>
                </up-row>
                <up-row customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="demo-layout bg-purple-light">联系人</view>
                    </up-col>
                    <up-col span="9">
                        <view class="demo-layout">
                            <u-form-item prop="send_username">
                                <u-input v-model="form.send_username" placeholder="联系人" clearable />
                            </u-form-item>
                        </view>
                    </up-col>
                </up-row>
                <up-row customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="demo-layout bg-purple-light">联系电话</view>
                    </up-col>
                    <up-col span="9">
                        <view class="demo-layout">
                            <u-form-item prop="telphone">
                                <u-input v-model="form.telphone" placeholder="联系电话" clearable />
                            </u-form-item>

                        </view>
                    </up-col>
                </up-row>
            </view>



            <view class="box rounded mt-2">
                <view class="title">收款信息</view>
                <up-row customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="demo-layout">收款方式</view>
                    </up-col>
                    <up-col span="9">
                        <view class="demo-layout">
                            <up-button type="primary" size="mini" @click="pay_show = true">{{ pay_type || '选择'
                                }}</up-button>
                            <up-picker :show="pay_show" :columns="columns" @confirm="confirm"
                                @cancel="pay_show = false"></up-picker>
                        </view>
                    </up-col>
                </up-row>
                <up-row customStyle="margin-bottom: 10px" v-if="pay_type && pay_type !== '微信'">
                    <up-col span="3">
                        <view class="demo-layout">真实姓名</view>
                    </up-col>
                    <up-col span="9">
                        <view class="demo-layout">
                            <up-input placeholder="请输入真实姓名, 否则无法打款" border="surround" clearable
                                v-model="form.user_name">
                                <template #suffix>
                                    <up-button @tap="copyUsername" text="一键复制" type="success" size="mini"></up-button>
                                </template>
                            </up-input>
                        </view>
                    </up-col>
                </up-row>
                <up-row customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="demo-layout">账号</view>
                    </up-col>
                    <up-col span="9">
                        <view class="demo-layout">
                            <u-form-item prop="account">
                                <u-input v-model="form.account" placeholder="请输入账号" clearable />
                            </u-form-item>
                        </view>
                    </up-col>
                </up-row>
            </view>


            <view class="box rounded mt-2">
                <view class="title">商家收货信息</view>
                <view class="flex">
                    <view class="w-70 mr-5">{{ address }}</view>
                    <u-icon name="cut" size="18" @click="toCopy"></u-icon>
                </view>
            </view>
            <view class="add_order">
                <up-button type="primary" @click="submitOrder" text="提交订单"></up-button>
            </view>
        </u-form>
    </view>
</template>


<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';
import { getShopAddressList, sendOrderInfo } from '@/addon/phone_shop_price/api/recycle'
import useMemberStore from "@/stores/member";

const address = ref('');
const form = ref({
    count: 1,
    express_id: '',
    send_username: '',
    telphone: useMemberStore().info.mobile || '',
    user_name: '',
    account: '',
});
// 定义校验规则
const rules = {
    send_username: {
        required: true,
        message: '联系人不能为空',
        trigger: 'blur'
    },
    username: {
        required: true,
        message: '联系人不能为空',
        trigger: 'blur'
    },
    express_id: {
        required: true,
        message: '快递单号不能为空',
        trigger: 'blur'
    },
    account: {
        required: true,
        message: '请输入收款账号',
        trigger: 'blur'
    },
    pay_type: {
        required: true,
        message: '请选择收款方式',
        trigger: 'blur'
    }
};

// 引用表单实例
const formRef = ref(null);


const pay_type = ref(null);
const pay_show = ref(false);
const columns = reactive([['微信', '支付宝', '银行卡']]);


const fetchAddress = async () => {
    try {
        const res = await getShopAddressList();
        address.value = `${res.data.data[0].full_address}, ${res.data.data[0].contact_name}, ${res.data.data[0].mobile}`;
    } catch (error) {
        uni.showToast({ title: '无邮寄地址!请联系商家', icon: 'none' });
        console.error("获取地址失败", error);
    }
};

const scanCode = () => {
    uni.scanCode({
        onlyFromCamera: true,
        success: res => {
            if (res.errMsg === 'scanCode:ok') form.value.express_id = res.result;
            else uni.showToast({ title: res.errorMsg, icon: 'none' });
        }
    });
};

const copyUsername = () => {
    form.value.user_name = form.value.send_username || '';
};

const confirm = e => {
    pay_show.value = false;
    pay_type.value = e.value[0];
};

const submitOrder = async () => {
    form.value.pay_type = pay_type.value;
    // 触发表单校验
    if (!pay_type.value) {
        return uni.showToast({
            title: '请选择收款方式',
            icon: 'none'
        });

    }
    const valid = await formRef.value.validate();

    if (valid) {
        // 校验通过，执行提交逻辑
        sendOrderInfo(form.value).then((res: any) => {
            if (res.code === 1) {
                uni.showToast({
                    title: '下单成功',
                    icon: 'none'
                });
                // 清空表单
                pay_type.value = ''
                formRef.value.resetFields()
            } else {
                uni.showToast({
                    title: '下单失败,请重试!',
                    icon: 'none'
                });
            }
        });
    } else {
        uni.showToast({
            title: '请完善表单信息',
            icon: 'none'
        });
    }

};



const toCopy = () => {
    uni.setClipboardData({
        data: address.value,
        success() {
            uni.showToast({ title: '复制成功', icon: 'none' });
        }
    });
};

fetchAddress();
</script>

<style scoped>
.page {
    padding: 24rpx;
    background-color: #f7f7f7;
}

.box {
    background-color: #fff;
    padding: 20rpx;
}

.p-r {
    position: relative;
}

.scan {
    position: absolute;
    right: 58rpx;
    top: 12rpx;
}

.title {
    font-size: 32rpx;
    font-weight: bold;
}

.add_order {
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
}
</style>