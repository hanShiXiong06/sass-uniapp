<template>
    <view class="page">
        <!-- 顶部导航栏 -->
        <view class="nav-header">
            <view class="tabs">
                <view v-for="(tab, index) in ['邮寄到店', '自送到店']" :key="index"
                    :class="['tab-item', currentTab === index ? 'active' : '']" @tap="switchTab(index)">
                    {{ tab }}
                </view>
            </view>
            <view class="order-link" @tap="toOrderList">
                <up-icon name="list" size="20"></up-icon>
                <text>我的订单</text>
            </view>
        </view>

        <u-form :model="form" :rules="rules" ref="formRef" label-position="left">
            <!-- 出货信息 -->
            <view class="box rounded">
                <view class="title">
                    <up-icon name="info-circle" size="16" color="#3b82f6"></up-icon>
                    <text>出货信息</text>
                    <view class="scan-btn" @click="scanIMEI">
                        <up-icon name="scan" size="14" color="#3b82f6"></up-icon>
                        <text>扫码</text>
                    </view>
                </view>

                <!-- 手机列表 -->
                <view class="phone-list" v-if="phoneList.length > 0">
                    <view class="phone-item" v-for="(item, index) in phoneList" :key="index">
                        <view class="phone-info">
                            <text class="imei">IMEI: {{ item.imei }}</text>
                            <text class="model">{{ item.model || '未知型号' }}</text>
                        </view>
                        <view class="delete-btn" @click="removePhone(index)">
                            <up-icon name="trash" size="14" color="#ef4444"></up-icon>
                        </view>
                    </view>
                </view>

                <view class="empty-tip" v-else>
                    <text>提示：在手机拨号界面输入 *#06# 可显示IMEI码</text>
                </view>

                <up-row customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="label">出货数量</view>
                    </up-col>
                    <up-col span="9">
                        <view class="input-wrapper">
                            <up-number-box v-model="form.count" @change="handleCountChange"></up-number-box>
                        </view>
                    </up-col>
                </up-row>

                <up-row customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="label">备注</view>
                    </up-col>
                    <up-col span="9">
                        <view class="input-wrapper">
                            <up-textarea v-model="form.comment" placeholder="请输入备注信息"></up-textarea>
                        </view>
                    </up-col>
                </up-row>
            </view>

            <!-- 寄件信息 -->
            <view class="box rounded mt-2 payment-box">

                <view class="title">

                    <view class="title-left">
                        <up-icon name="truck" size="16" color="#3b82f6"></up-icon>
                        <text>{{ currentTab === 0 ? '寄件信息' : '自送信息' }}</text>
                    </view>
                    <view class="title-action" @click="toAddressPage">
                        <up-icon name="plus" size="14"></up-icon>
                        <text>添加地址</text>
                    </view>
                </view>


                <!-- 快递单号 - 仅在邮寄模式显示 -->
                <up-row v-if="currentTab === 0" customStyle="margin-bottom: 10px">
                    <up-col span="3">
                        <view class="label">快递单号</view>
                    </up-col>
                    <up-col span="9">
                        <view class="input-wrapper">
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

                <!-- 联系信息 -->
                <view class="contact-info ">
                    <view class="section-header">
                        <text>联系信息</text>
                        <view class="switch-wrapper">
                            <u-switch v-model="useDefaultAddress" @change="handleDefaultAddressChange"
                                size="22"></u-switch>
                            <text class="switch-label">使用默认地址</text>
                        </view>
                    </view>


                    <up-row customStyle="margin-bottom: 10px">
                        <up-col span="3">
                            <view class="label">联系人</view>
                        </up-col>
                        <up-col span="9">
                            <view class="input-wrapper">
                                <u-form-item prop="name">
                                    <u-input v-model="form.send_username" placeholder="请输入联系人姓名" clearable />
                                </u-form-item>
                            </view>
                        </up-col>
                    </up-row>

                    <up-row customStyle="margin-bottom: 10px">
                        <up-col span="3">
                            <view class="label">联系电话</view>
                        </up-col>
                        <up-col span="9">
                            <view class="input-wrapper">
                                <u-form-item prop="telphone">
                                    <u-input v-model="form.telphone" placeholder="请输入联系电话" clearable />
                                </u-form-item>
                            </view>
                        </up-col>
                    </up-row>
                </view>
            </view>

            <!-- 收款信息 -->
            <view class="box rounded mt-2 payment-box">
                <view class="title">
                    <view class="title-left">
                        <up-icon name="wallet" size="16" color="#3b82f6"></up-icon>
                        <text>收款信息</text>
                    </view>
                    <view class="title-action" @click="toPaymentPage">
                        <up-icon name="plus" size="14"></up-icon>
                        <text>管理收款方式</text>
                    </view>
                </view>

                <view class="payment-info">
                    <view class="section-header">
                        <text>收款方式</text>
                        <view class="switch-wrapper">
                            <u-switch v-model="useDefaultPayment" @change="handleDefaultPaymentChange"
                                size="22"></u-switch>
                            <text class="switch-label">使用默认支付</text>
                        </view>
                    </view>

                    <up-row customStyle="margin-bottom: 10px">
                        <up-col span="3">
                            <view class="label">收款方式</view>
                        </up-col>
                        <up-col span="9">
                            <view class="input-wrapper payment-select">
                                <up-button type="primary" @click="pay_show = true">
                                    {{ pay_type || '选择收款方式' }}
                                </up-button>
                                <up-picker :show="pay_show" :columns="columns" @confirm="confirm"
                                    @cancel="pay_show = false"></up-picker>
                            </view>
                        </up-col>
                    </up-row>

                    <up-row customStyle="margin-bottom: 10px" v-if="pay_type && pay_type !== '银行卡'">
                        <up-col span="3">
                            <view class="label">收款码</view>
                        </up-col>
                        <up-col span="9">
                            <view class="input-wrapper qrcode-wrapper">
                                <image v-if="form.qrcode_image" :src="form.qrcode_image" mode="aspectFit"
                                    class="qrcode-image" @click="previewImage"></image>
                                <view v-else class="no-qrcode">首次使用请先添加收款方式</view>
                            </view>
                        </up-col>
                    </up-row>

                    <up-row customStyle="margin-bottom: 10px">
                        <up-col span="3">
                            <view class="label">真实姓名</view>
                        </up-col>
                        <up-col span="9">
                            <view class="input-wrapper">
                                <up-input placeholder="请输入真实姓名, 否则无法打款" border="surround" clearable
                                    v-model="form.user_name">
                                </up-input>
                            </view>
                        </up-col>
                    </up-row>

                    <up-row customStyle="margin-bottom: 10px">
                        <up-col span="3">
                            <view class="label">账号</view>
                        </up-col>
                        <up-col span="9">
                            <view class="input-wrapper">
                                <u-form-item prop="account">
                                    <u-input v-model="form.account" placeholder="请输入收款账号" clearable />
                                </u-form-item>
                            </view>
                        </up-col>
                    </up-row>
                </view>
            </view>

            <!-- 商家信息 -->
            <view class="box rounded mt-2">
                <view class="title">
                    <up-icon name="shop" size="16" color="#3b82f6"></up-icon>
                    <text>商家信息</text>
                </view>
                <view class="shop-info">
                    <view class="info-row">
                        <text class="label">商家名称：</text>
                        <text class="value">{{ shopInfo.name }}</text>
                    </view>
                    <view class="info-row">
                        <text class="label">联系电话：</text>
                        <text class="value">{{ shopInfo.mobile }}</text>
                    </view>

                    <view class="info-row address-row">
                        <text class="label">店铺地址：</text>
                        <view class="address-content">
                            <text class="value">{{ address }}</text>
                            <view class="address-actions">
                                <view class="action-btn" @click="toCopy">
                                    <up-icon name="copy" size="14"></up-icon>
                                    <text>复制地址</text>
                                </view>
                                <view class="action-btn" @click="toShopLocation">
                                    <up-icon name="nav" size="14"></up-icon>
                                    <text>查看位置</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 自送信息 -->
            <view class="box rounded mt-2" v-if="currentTab === 1">
                <view class="title">
                    <up-icon name="info" size="16" color="#3b82f6"></up-icon>
                    <text>自送说明</text>
                </view>
                <view class="info-content">
                    <view class="info-text">请在工作时间内将手机送至以下地址：</view>
                    <view class="shop-address">{{ address }}</view>
                    <view class="action-links">
                        <view class="link-item" @click="toShopLocation">
                            <up-icon name="map" size="14"></up-icon>
                            <text>查看店铺位置</text>
                            <up-icon name="arrow-right" size="14"></up-icon>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 回收协议 -->
            <view class="box rounded mt-2">
                <view class="agreement-section">
                    <view class="agreement-checkbox">
                        <u-checkbox-group>
                            <u-checkbox activeColor="var(--primary-color)" :checked="isAgreeRecycle" shape="shape"
                                size="14" @change="handleRecycleAgree" />
                        </u-checkbox-group>
                        <view class="agreement-text">
                            我已阅读并同意
                            <view @click="toAgreementPage">
                                <text class="text-primary">《回收服务协议》</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 提交按钮 -->
            <view class="submit-section">
                <up-button type="primary" @click="submitOrder" text="提交订单"></up-button>
            </view>
        </u-form>
    </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getShopAddressList } from '@/addon/phone_shop_price/api/recycle'
import { createOrder } from '@/addon/phone_shop_price/api/order'
import { getPaymentList } from '@/addon/phone_shop_price/api/payment'
import { getAddressList } from '@/app/api/member'
import useMemberStore from "@/stores/member";

// 新增 - 当前选中的标签页
const currentTab = ref(0);

// 新增 - 退货方式
const returnMethods = [
    { name: '自送退回', icon: 'hand' },
    { name: '邮寄退回', icon: 'truck' }
];
const selectedReturnMethod = ref(0);

const address = ref('');
const form = ref({
    count: 1,
    express_id: '',
    send_username: '',
    telphone: useMemberStore().info.mobile || '',
    user_name: '',
    account: '',
    delivery_type: 'mail',
    return_type: 'self',
    qrcode_image: '',
    return_address: '',
});

// 开关状态
const useDefaultPayment = ref(false);
const useDefaultAddress = ref(false);

// 校验规则
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
        required: (rule, value, callback) => {
            if (form.value.delivery_type === 'mail' && !value) {
                callback(new Error('快递单号不能空'));
            } else {
                callback();
            }
        },
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

const formRef = ref(null);
const pay_type = ref(null);
const pay_show = ref(false);
const columns = reactive([['微信', '支付宝', '银行卡']]);

// 切换标签页
const switchTab = (index) => {
    currentTab.value = index;
    form.value.delivery_type = index === 0 ? 'mail' : 'self';
    // 切换到自送时清空快递单号
    if (index === 1) {
        form.value.express_id = '';
    }
};

// 选择退货方式
const selectReturnMethod = (index) => {
    selectedReturnMethod.value = index;
    form.value.return_type = index === 0 ? 'self' : 'mail';
};

// 跳转到订单列表
const toOrderList = () => {
    uni.navigateTo({
        url: '/addon/phone_shop_price/pages/order/list'
    });
};

// 获取默认支付方式
const loadDefaultPayment = async () => {
    try {
        const res = await getPaymentList();
        if (res.code === 1 && res.data) {
            const defaultPayment = res.data.find(item => item.is_default === 1);
            if (defaultPayment) {
                pay_type.value = defaultPayment.pay_type;
                form.value.account = defaultPayment.account;
                form.value.user_name = defaultPayment.user_name || '';
                form.value.qrcode_image = defaultPayment.qrcode_image || '';
            }
        }
    } catch (error) {
        uni.showToast({ title: '获取默认支付方式失败', icon: 'none' });
    }
};

// 获取默认地址
const loadDefaultAddress = async () => {
    try {
        const res = await getAddressList({});
        if (res.code === 1 && res.data) {
            const defaultAddress = res.data.find(item => item.is_default === 1);
            if (defaultAddress) {
                form.value.send_username = defaultAddress.name;
                form.value.telphone = defaultAddress.mobile;
                form.value.return_address = defaultAddress.full_address
                    ;
            }
        }
    } catch (error) {
        uni.showToast({ title: '获取默认地址失败', icon: 'none' });
    }
};

// 处理默认支付方式切换
const handleDefaultPaymentChange = async (value) => {
    if (value) {
        await loadDefaultPayment();
    } else {
        pay_type.value = null;
        form.value.account = '';
        form.value.user_name = '';
        form.value.qrcode_image = '';
    }
};

// 处理默认地址切换
const handleDefaultAddressChange = async (value) => {
    if (value) {
        await loadDefaultAddress();
    } else {
        form.value.send_username = '';
        form.value.telphone = '';
        form.value.return_address = '';
    }
};

const fetchAddress = async () => {
    try {
        const res = await getShopAddressList();
        address.value = res.data.data[0].full_address;
    } catch (error) {
        uni.showToast({ title: '无邮寄地址!请系商家', icon: 'none' });
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

// 手机列表
const phoneList = ref<Array<{ imei: string, model?: string }>>([]);

// 扫描IMEI
const scanIMEI = () => {
    uni.showActionSheet({
        itemList: ['扫描条形码', '手动输入'],
        success: (res) => {
            if (res.tapIndex === 0) {
                // 扫描条形码
                uni.scanCode({
                    onlyFromCamera: true,
                    success: (res) => {
                        handleIMEIResult(res.result);
                    },
                    fail: () => {
                        uni.showToast({
                            title: '扫码失败',
                            icon: 'none'
                        });
                    }
                });
            } else {
                // 手动输入
                uni.showModal({
                    title: '输入IMEI',
                    placeholderText: '请输入15位IMEI码',
                    editable: true,
                    success: (res) => {
                        if (res.confirm && res.content) {
                            handleIMEIResult(res.content);
                        }
                    }
                });
            }
        }
    });
};

// 处理IMEI结果
const handleIMEIResult = (imei: string) => {
    imei = imei.trim();
    // 验证IMEI格式（通常是15位数字）
    if (/^\d{15}$/.test(imei)) {
        // 检查是否已存在相同的IMEI
        if (phoneList.value.some(phone => phone.imei === imei)) {
            uni.showToast({
                title: '该IMEI已添加',
                icon: 'none'
            });
            return;
        }
        phoneList.value.push({
            imei: imei,
            model: '待识别'
        });
        // 更新数量
        form.value.count = phoneList.value.length;
        uni.showToast({
            title: '添加成功',
            icon: 'success'
        });
    } else {
        uni.showToast({
            title: '无效的IMEI码，请输入15位数字',
            icon: 'none'
        });
    }
};

// OCR识别IMEI
const recognizeIMEI = async (imagePath: string) => {
    uni.showLoading({
        title: '正在识别...'
    });

    try {
        // 这里替换为实际的OCR API调用
        // 示例使用百度OCR API
        const result = await ocrAPI.recognize(imagePath);
        const imei = extractIMEI(result.text);
        if (imei) {
            handleIMEIResult(imei);
        } else {
            uni.showToast({
                title: '未识别到IMEI码',
                icon: 'none'
            });
        }
    } catch (error) {
        uni.showToast({
            title: '识别失败',
            icon: 'none'
        });
    } finally {
        uni.hideLoading();
    }
};

// 从OCR结果中提取IMEI
const extractIMEI = (text: string): string | null => {
    // 查找符合IMEI格式的文本（15位数字）
    const match = text.match(/\d{15}/);
    return match ? match[0] : null;
};

// 删除手机
const removePhone = (index: number) => {
    phoneList.value.splice(index, 1);
    // 更新数量
    form.value.count = phoneList.value.length;
};

// 处理数量变化
const handleCountChange = (value: number) => {
    // 如果手动修改数量小于已扫描的手机数量，删除多余的手机记录
    if (value < phoneList.value.length) {
        phoneList.value = phoneList.value.slice(0, value);
    }
};

// 提交订单时添加手机列表
const submitOrder = async () => {
    if (!isAgreeRecycle.value) {
        uni.showToast({
            title: '请阅读并同意回收服务协议',
            icon: 'none'
        });
        return;
    }
    form.value.pay_type = pay_type.value;
    form.value.phone_list = phoneList.value;  // 添加手机列表到表单数据
    if (!pay_type.value) {
        return uni.showToast({
            title: '请选择收款方式',
            icon: 'none'
        });
    }

    const valid = await formRef.value.validate();
    if (valid) {
        createOrder(form.value).then((res: any) => {
            if (res.code === 1) {
                uni.showToast({
                    title: '下单成功',
                    icon: 'success'
                });
                // 清空表单
                pay_type.value = ''
                formRef.value.resetFields()
                useDefaultPayment.value = false;
                useDefaultAddress.value = false;
                // 跳转到订单列表
                setTimeout(() => {
                    toOrderList();
                }, 1500);
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
        data: address.value + ',' + shopInfo.value.name + ',' + shopInfo.value.mobile,
        success() {
            uni.showToast({ title: '复制成功', icon: 'success' });
        }
    });
};

// 跳转到收款方式管理页面
const toPaymentPage = () => {
    uni.navigateTo({
        url: '/addon/phone_shop_price/pages/payment/index'
    });
};

// 跳转到店铺置页面
const toShopLocation = () => {
    uni.navigateTo({
        url: '/addon/phone_shop_price/pages/shop/location'
    });
};

// 预览收款图片
const previewImage = () => {
    if (form.value.qrcode_image) {
        uni.previewImage({
            urls: [form.value.qrcode_image],
            current: 0
        });
    }
};

// 获取商家信息
const shopInfo = ref({
    name: '',
    mobile: '',
    business_hours: ''
});

// 获取商家信息
const fetchShopInfo = async () => {
    try {
        const res = await getShopAddressList();
        console.log(res);

        if (res.code === 1 && res.data) {
            shopInfo.value = {
                name: res.data.data[0].contact_name,
                mobile: res.data.data[0].mobile,
                business_hours: res.data.data[0].business_hours
            };
        }
    } catch (error) {
        console.error('获取商家信息失败', error);
    }
};

const isAgreeRecycle = ref(false)

// 处理回收协议同意状态
const handleRecycleAgree = () => {
    isAgreeRecycle.value = !isAgreeRecycle.value
}

// 跳转到收货地址页面
const toAddressPage = () => {
    uni.navigateTo({
        url: '/app/pages/member/address'
    });
};

// 跳转到协议页面
const toAgreementPage = () => {
    uni.navigateTo({
        url: '/app/pages/auth/agreement?key=recycle_service'
    });
};

onMounted(() => {
    fetchAddress();
    fetchShopInfo();
});
</script>

<style lang="scss" scoped>
.page {
    padding: 24rpx;
    background-color: #f7f7f7;
    min-height: 100vh;
}

.nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    margin-bottom: 20rpx;

    .tabs {
        display: flex;
        background: #fff;
        border-radius: 16rpx;
        padding: 4rpx;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

        .tab-item {
            padding: 16rpx 32rpx;
            font-size: 28rpx;
            color: #666;
            position: relative;
            transition: all 0.3s;

            &.active {
                color: #3b82f6;
                background: #ebf5ff;
                border-radius: 12rpx;
            }
        }
    }

    .order-link {
        display: flex;
        align-items: center;
        padding: 12rpx 24rpx;
        background: #fff;
        border-radius: 30rpx;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

        text {
            font-size: 26rpx;
            color: #666;
            margin-left: 8rpx;
        }
    }
}

.box {
    background-color: #fff;
    padding: 30rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

    .title {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;
        position: relative;

        text {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
            margin-left: 12rpx;
        }

        .scan-btn {
            position: absolute;
            right: 0;
            display: inline-flex;
            align-items: center;
            padding: 6rpx 16rpx;
            border-radius: 24rpx;
            background: #ebf5ff;
            border: 2rpx solid #e5e7eb;

            text {
                font-size: 24rpx;
                color: #3b82f6;
                margin: 0 0 0 4rpx;
                font-weight: normal;
            }

            &:active {
                background: #dbeafe;
            }
        }
    }

    // 仅收款信息的标题需要两端对齐
    &.payment-box {
        .title {
            justify-content: space-between;

            .title-left {
                display: flex;
                align-items: center;

                text {
                    font-size: 32rpx;
                    font-weight: 600;
                    color: #333;
                    margin-left: 12rpx;
                }
            }

            .title-action {
                display: flex;
                align-items: center;
                padding: 12rpx 24rpx;
                background: #f8fafc;
                border-radius: 30rpx;
                border: 2rpx solid #e5e7eb;
                transition: all 0.3s;

                text {
                    font-size: 24rpx;
                    color: #666;
                    margin-left: 8rpx;
                }

                &:active {
                    background: #f0f0f0;
                }
            }
        }
    }
}

.label {
    font-size: 28rpx;
    color: #666;
    padding-top: 20rpx;
}

.input-wrapper {
    background: #f8fafc;
    border-radius: 12rpx;
    padding: 4rpx 12rpx;

    .address-tip {
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
        padding: 0 12rpx;
    }
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #f0f0f0;

    text {
        font-size: 28rpx;
        color: #666;
    }

    .switch-wrapper {
        display: flex;
        align-items: center;

        :deep(.u-switch) {
            transform: scale(0.7);
            margin-right: 4rpx;
        }

        .switch-label {
            margin-left: 8rpx;
            color: #999;
            font-size: 24rpx;
        }
    }
}

.return-method {
    display: flex;
    justify-content: space-around;
    padding: 20rpx 0;

    .method-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32rpx 60rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        transition: all 0.3s;
        border: 2rpx solid #e5e7eb;

        text {
            font-size: 26rpx;
            color: #666;
            margin-top: 12rpx;
        }

        &.active {
            background: #ebf5ff;
            border-color: #3b82f6;
            color: #3b82f6;

            text {
                color: #3b82f6;
            }
        }
    }
}

.shop-info {
    .info-row {
        display: flex;
        margin-bottom: 20rpx;

        &:last-child {
            margin-bottom: 0;
        }

        .label {
            width: 140rpx;
            font-size: 26rpx;
            color: #999;
            flex-shrink: 0;
        }

        .value {
            flex: 1;
            font-size: 26rpx;
            color: #333;
            margin-top: 11px;
        }
    }

    .address-row {
        align-items: flex-start;
        padding-top: 20rpx;
        border-top: 2rpx solid #f0f0f0;

        .address-content {
            flex: 1;

            .address-actions {
                display: flex;
                gap: 20rpx;
                margin-top: 16rpx;

                .action-btn {
                    display: flex;
                    align-items: center;
                    padding: 12rpx 24rpx;
                    background: #fff;
                    border-radius: 30rpx;
                    border: 2rpx solid #e5e7eb;

                    text {
                        font-size: 24rpx;
                        color: #666;
                        margin-left: 8rpx;
                    }

                    &:active {
                        background: #f0f0f0;
                    }
                }
            }
        }
    }
}

.return-address {
    margin-top: 30rpx;
    padding-top: 24rpx;
    border-top: 2rpx solid #f0f0f0;

    .section-header {
        margin-bottom: 16rpx;

        text {
            font-size: 28rpx;
            color: #666;
        }
    }
}

.submit-section {
    margin-top: 40rpx;
    padding: 20rpx 40rpx;
    position: sticky;
    bottom: 20rpx;

    :deep(.u-button) {
        height: 88rpx;
        border-radius: 44rpx;
        font-size: 32rpx;
        font-weight: 600;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
    }
}

.mt-2 {
    margin-top: 20rpx;
}

.payment-select {
    display: flex;
    gap: 20rpx;
    align-items: center;
    font-size: 46rpx;

    :deep(.u-button) {
        flex-shrink: 0;
    }
}

.qrcode-wrapper {
    padding: 20rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200rpx;
    background: #fff;
    border-radius: 12rpx;
    border: 2rpx dashed #e5e7eb;

    .qrcode-image {
        width: 200rpx;
        height: 200rpx;
        object-fit: contain;
    }

    .no-qrcode {
        color: #999;
        font-size: 26rpx;
    }
}

.action-links {
    margin-top: 20rpx;

    .link-item {
        display: flex;
        align-items: center;
        padding: 20rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        color: #3b82f6;

        text {
            flex: 1;
            margin: 0 12rpx;
            font-size: 28rpx;
        }
    }
}

.info-content {
    .info-text {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 16rpx;
    }

    .shop-address {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
        padding: 20rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        margin-bottom: 20rpx;
    }
}

.phone-list {
    margin-bottom: 20rpx;

    .phone-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        margin-bottom: 16rpx;
        border: 2rpx solid #e5e7eb;

        .phone-info {
            flex: 1;

            .imei {
                font-size: 26rpx;
                color: #333;
                margin-right: 20rpx;
            }

            .model {
                font-size: 24rpx;
                color: #666;
            }
        }

        .delete-btn {
            padding: 12rpx;
            border-radius: 8rpx;

            &:active {
                background: #fee2e2;
            }
        }

        &:last-child {
            margin-bottom: 0;
        }
    }
}

.empty-tip {
    text-align: center;
    padding: 30rpx 0;
    color: #999;
    font-size: 26rpx;
    background: #f8fafc;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
}

.agreement-section {
    padding: 20rpx;

    .agreement-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 10rpx;

        .agreement-text {
            font-size: 24rpx;
            color: #64748b;
            display: flex;
            flex-wrap: wrap;

            .text-primary {
                color: var(--primary-color);
            }
        }
    }
}

.action-links {
    margin-top: 20rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .link-item {
        display: flex;
        align-items: center;
        padding: 20rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        color: #3b82f6;

        text {
            flex: 1;
            margin: 0 12rpx;
            font-size: 28rpx;
        }

        &:active {
            background: #f1f5f9;
        }
    }
}
</style>