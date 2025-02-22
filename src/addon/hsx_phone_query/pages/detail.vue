<template>
    <view class="detail-page">
        <!-- 顶部信息卡片 -->
        <view class="info-card card-base" :class="{ 'fade-in': showContent }">
            <view class="card-header">
                <text class="type-tag">{{ detail.type_name }}</text>
                <text class="time">{{ formatTime(detail.create_time) }}</text>
            </view>
            <view class="sn-section" @tap="copyText(detail.sn)">
                <text class="label">序列号</text>
                <text class="value">
                    {{ detail.sn }}
                </text>
                <text><u-icon name="cut" size="26" color="#999" class="copy-icon"></u-icon>
                </text>
            </view>
        </view>

        <!-- 设备信息卡片 -->
        <view class="device-card card-base" v-if="deviceInfo" :class="{ 'slide-in': showContent }">
            <view class="card-title">设备信息</view>
            <view class="device-info">
                <text class="model">{{ deviceInfo.机型 || '未知设备' }}</text>
                <view class="specs" v-if="deviceInfo.容量 || deviceInfo.颜色">
                    <text>{{ deviceInfo.容量 }}</text>
                    <text v-if="deviceInfo.颜色">· {{ deviceInfo.颜色 }}</text>
                </view>
            </view>

            <!-- 状态标签组 -->
            <view class="status-tags">
                <view class="tag" v-if="deviceInfo.保修到期" :class="getWarrantyClass(deviceInfo.保修到期).class">
                    <u-icon :name="getWarrantyClass(deviceInfo.保修到期).icon"
                        :color="getWarrantyClass(deviceInfo.保修到期).color" size="24" />
                    <text>{{ deviceInfo.保修到期 }}</text>
                </view>
                <view class="tag" v-if="deviceInfo.监管锁" :class="getLockClass(deviceInfo.监管锁)">
                    <u-icon :name="getLockIcon(deviceInfo.监管锁)" size="24" />
                    <text>{{ deviceInfo.监管锁 }}</text>
                </view>
            </view>
        </view>

        <!-- 详细信息卡片 -->
        <view class="detail-card card-base" v-if="deviceInfo" :class="{ 'slide-in-delay': showContent }">
            <view class="card-title">详细信息</view>
            <view class="info-list">
                <view class="info-item" v-for="(value, key) in deviceInfo" :key="key"
                    v-if="!['机型', '容量', '颜色'].includes(key)">
                    <text class="label">{{ key }}</text>
                    <block v-if="isImageUrl(value)">
                        <image class="info-image" :src="value" mode="widthFix" @tap="previewImage(value)" />
                    </block>
                    <text v-else class="value">{{ value }}</text>
                </view>
            </view>
        </view>

        <!-- 分享引导组件 -->
        <view class="share-guide" v-if="showShareGuide">
            <view class="guide-content">
                <view class="guide-header">
                    <text class="title">分享查询结果</text>
                    <u-icon name="close" size="24" color="#999" @click="showShareGuide = false"></u-icon>
                </view>
                <view class="guide-body">
                    <image class="share-icon" src="/static/images/share-illustration.png" mode="aspectFit"></image>
                    <text class="guide-text">点击右上角"..."分享给好友</text>
                </view>
                <view class="guide-footer">
                    <button class="share-btn" open-type="share">
                        <u-icon name="share" size="20" color="#fff"></u-icon>
                        <text>立即分享</text>
                    </button>
                </view>
            </view>
        </view>

        <!-- 水印层 -->
        <view class="watermark" :style="watermarkStyle">
            {{ watermarkConfig.text }}
        </view>

        <!-- 绘制区域（隐藏） -->
        <canvas canvas-id="shareCanvas" id="shareCanvas"
            style="width: 750rpx; height: 1334rpx; position: fixed; left: -9999rpx;"></canvas>

        <!-- 操作栏 -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="action-bar" :class="{ 'fade-in': showContent }">
            <button class="action-btn download-btn" @click="handleGenerateImage">
                <u-icon name="download" size="32" color="#fff"></u-icon>
                <text>保存图片</text>
            </button>
            <button class="action-btn share-btn" @click="showShareGuide = true">
                <u-icon name="share" size="32" color="#fff"></u-icon>
                <text>分享</text>
            </button>
        </view>
        <!-- #endif -->
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getModelDetail, getWatermark } from '@/addon/hsx_phone_query/api/index'
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app'

const detail = ref<any>({})
const deviceInfo = ref<any>(null)
const loading = ref(true)
const showContent = ref(false)
const currentId = ref<number | null>(null)

// 画布尺寸
const canvasWidth = ref(750)
const canvasHeight = ref(1334)

// 添加水印文本
const watermarkText = computed(() => {
    const now = new Date()
    const dateStr = now.toLocaleDateString()
    const timeStr = now.toLocaleTimeString()
    return `仅供参考\n${dateStr} ${timeStr}`
})

// 页面加载时获取参数
onLoad((option: any) => {
    console.log('路由参数:', option)
    if (option.id) {
        currentId.value = Number(option.id)
        loadDetail()
    }
})

// 获取详情数据
const loadDetail = async () => {
    if (!currentId.value) {
        uni.showToast({
            title: '参数错误',
            icon: 'none'
        })
        return
    }

    try {
        loading.value = true
        console.log('请求ID:', currentId.value)

        const res = await getModelDetail(currentId.value)
        console.log('详情数据:', res)

        if (res.code === 1) {
            detail.value = res.data
            if (typeof res.data.info === 'object' && res.data.info !== null) {
                deviceInfo.value = res.data.info
            } else {
                try {
                    deviceInfo.value = JSON.parse(res.data.info || '{}')
                } catch (error) {
                    console.error('解析设备信息失败:', error)
                    deviceInfo.value = {}
                }
            }

            setTimeout(() => {
                showContent.value = true
            }, 100)
        } else {
            uni.showToast({
                title: res.msg || '获取详情失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('获取详情失败:', error)
        uni.showToast({
            title: '获取详情失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}

// 复制文本
const copyText = (text: string) => {
    uni.setClipboardData({
        data: text,
        success: () => {
            uni.showToast({
                title: '复制成功',
                icon: 'none'
            })
        }
    })
}

// 其他方法从 history.vue 复用
const formatTime = (timeStr: string | null) => {
    if (!timeStr) return ''
    try {
        const date = new Date(timeStr)
        return isNaN(date.getTime()) ? timeStr : timeStr.split(' ')[0]
    } catch (error) {
        return timeStr || ''
    }
}

const getWarrantyClass = (status: string) => {
    if (status === '过期') {
        return {
            class: 'expired',
            color: '#ff4d4f',
            icon: 'error-circle'
        }
    }
    return {
        class: 'valid',
        color: '#52c41a',
        icon: 'checkmark-circle'
    }
}

const getLockClass = (status: string) => {
    return status === 'OFF' ? 'unlocked' : 'locked'
}

const getLockIcon = (status: string) => {
    return status === 'OFF' ? 'unlock' : 'lock'
}

// 加载图片
const loadImage = (src: string) => {
    return new Promise<string>((resolve, reject) => {
        uni.getImageInfo({
            src,
            success: (res) => resolve(res.path),
            fail: reject
        })
    })
}

// 生成分享图片
const generateImage = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const ctx = uni.createCanvasContext('shareCanvas')
            const width = canvasWidth.value
            const height = canvasHeight.value

            // 设置背景
            ctx.setFillStyle('#f8f9fa')
            ctx.fillRect(0, 0, width, height)

            // 绘制顶部信息卡片
            ctx.setFillStyle('#ffffff')
            ctx.fillRect(30, 30, width - 60, 180)
            ctx.setFontSize(28)
            ctx.setFillStyle('#333')
            ctx.fillText(detail.value.type_name || '', 50, 80)
            ctx.setFontSize(24)
            ctx.setFillStyle('#666')
            ctx.fillText(formatTime(detail.value.create_time) || '', width - 250, 80)

            // 绘制序列号
            ctx.setFontSize(26)
            ctx.setFillStyle('#333')
            ctx.fillText('序列号：' + detail.value.sn, 50, 130)

            // 绘制设备信息
            let currentY = 240
            if (deviceInfo.value) {
                Object.entries(deviceInfo.value).forEach(([key, value]) => {
                    if (!['机型', '容量', '颜色'].includes(key)) {
                        ctx.setFontSize(26)
                        ctx.setFillStyle('#666')
                        ctx.fillText(key + '：', 50, currentY)
                        ctx.setFillStyle('#333')
                        ctx.fillText(String(value), 200, currentY)
                        currentY += 50
                    }
                })
            }

            // 生成当前页面二维码
            const qrCodeSize = 200
            const qrCodeX = (width - qrCodeSize) / 2
            const qrCodeY = currentY + 30

            const pageUrl = `pages/addon/hsx_phone_query/pages/detail?id=${currentId.value}`
            const qrCodeImage = await generateQRCode(pageUrl, qrCodeSize)
            if (qrCodeImage) {
                ctx.drawImage(qrCodeImage, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize)
            }

            // 添加水印
            ctx.setFontSize(24)
            ctx.setFillStyle('rgba(0,0,0,0.1)')
            ctx.setTextAlign('center')
            const watermarkText = `${detail.value.type_name || ''} · ${formatTime(detail.value.create_time)}`
            ctx.fillText(watermarkText, width / 2, qrCodeY + qrCodeSize + 50)

            ctx.draw(false, () => {
                setTimeout(() => {
                    uni.canvasToTempFilePath({
                        canvasId: 'shareCanvas',
                        success: (res) => {
                            resolve(res.tempFilePath)
                        },
                        fail: (err) => {
                            reject(err)
                        }
                    })
                }, 300)
            })
        } catch (error) {
            reject(error)
        }
    })
}

// 处理下载
const handleGenerateImage = async () => {
    try {
        loading.value = true
        // 先检查授权状态
        const auth = await uni.getSetting({})
        if (!auth.authSetting['scope.writePhotosAlbum']) {
            // 请求授权
            await uni.authorize({
                scope: 'scope.writePhotosAlbum'
            })
        }
        
        // 生成图片
        const res = await generateImage()
        
        // 保存图片到相册
        await uni.saveImageToPhotosAlbum({
            filePath: res
        })
        
        uni.showToast({
            title: '保存成功',
            icon: 'success'
        })
    } catch (err: any) {
        console.error('生成/保存图片失败:', err)
        
        // 如果是用户拒绝授权
        if (err.errMsg && err.errMsg.includes('authorize:fail')) {
            uni.showModal({
                title: '提示',
                content: '需要您授权保存图片到相册。是否去设置？',
                success: (res) => {
                    if (res.confirm) {
                        // 打开设置页面
                        uni.openSetting()
                    }
                }
            })
        } else {
            uni.showToast({
                title: '生成图片失败',
                icon: 'none'
            })
        }
    } finally {
        loading.value = false
    }
}

// 判断是否为图片URL
const isImageUrl = (value: string) => {
    if (typeof value !== 'string') return false
    return value.startsWith('http') || value.startsWith('/')
}

// 预览图片
const previewImage = (url: string) => {
    uni.previewImage({
        urls: [url],
        current: url,
        fail: () => {
            uni.showToast({
                title: '预览失败',
                icon: 'none'
            })
        }
    })
}

// 分享引导显示控制
const showShareGuide = ref(false)

// 生成二维码
const generateQRCode = async (text: string, size: number) => {
    return new Promise((resolve, reject) => {
        uni.showLoading({ title: '生成二维码' })
        // #ifdef MP-WEIXIN
        const wxqrcode = require('wxmp-qrcode')
        const qrcode = wxqrcode({
            text: text,
            width: size,
            height: size,
            correctLevel: 'H',
            padding: 10,
            background: '#ffffff',
            foreground: '#000000'
        })
        resolve(qrcode)
        // #endif
        // #ifndef MP-WEIXIN
        resolve(null)
        // #endif
        uni.hideLoading()
    })
}

// 处理分享
onShareAppMessage(() => {
    return {
        title: `${detail.value.type_name || '设备'}查询结果`,
        path: `/pages/addon/hsx_phone_query/pages/detail?id=${currentId.value}`,
        imageUrl: '' // 可以设置分享图片
    }
})

// 水印配置
const watermarkConfig = ref({
    text: '仅供参考',
    color: 'rgba(0,0,0,0.03)',
    size: '120',
    opacity: '0.03'
})

// 水印样式
const watermarkStyle = computed(() => {
    return {
        color: watermarkConfig.value.color,
        fontSize: `${watermarkConfig.value.size}rpx`,
        opacity: watermarkConfig.value.opacity
    }
})

// 获取水印配置
const loadWatermarkConfig = async () => {
    try {
        const res = await getWatermark()
        if (res.code === 1) {
            watermarkConfig.value = res.data
        }
    } catch (error) {
        console.error('获取水印配置失败:', error)
    }
}

onMounted(() => {
    // 获取当前页面参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage && currentPage.$page?.options?.id) {
        currentId.value = Number(currentPage.$page.options.id)
        loadDetail()
    }
    loadWatermarkConfig()
})
</script>

<style lang="scss" scoped>
.detail-page {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 24rpx;
    padding-bottom: 50px;
}

// 卡片基础样式
.card-base {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

// 顶部信息卡片
.info-card {
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;

        .type-tag {
            font-size: 24rpx;
            color: var(--primary-color);
            background: rgba(var(--primary-color-rgb), 0.08);
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
        }

        .time {
            font-size: 24rpx;
            color: #999;
        }
    }

    .sn-section {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .label {
            font-size: 26rpx;
            color: #666;
        }

        .value {
            flex: 1;
            font-size: 28rpx;
            color: #333;
            font-family: monospace;
            display: flex;
            align-items: center;
            gap: 8rpx;

            .copy-icon {
                opacity: 0.6;
            }
        }
    }
}

// 设备信息卡片
.device-card {
    .card-title {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 20rpx;
    }

    .device-info {
        margin-bottom: 20rpx;

        .model {
            font-size: 36rpx;
            font-weight: 600;
            color: #333;
            display: block;
            margin-bottom: 8rpx;
        }

        .specs {
            font-size: 26rpx;
            color: #666;
        }
    }

    .status-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 6rpx;
            padding: 6rpx 16rpx;
            border-radius: 6rpx;
            font-size: 24rpx;

            &.valid {
                color: #52c41a;
                background: rgba(82, 196, 26, 0.1);
            }

            &.expired {
                color: #ff4d4f;
                background: rgba(255, 77, 79, 0.08);
            }

            &.locked {
                color: #1890ff;
                background: rgba(24, 144, 255, 0.1);
            }

            &.unlocked {
                color: #666;
                background: #f5f5f5;
            }
        }
    }
}

// 详细信息卡片
.detail-card {
    .card-title {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 20rpx;
    }

    .info-list {
        .info-item {
            display: flex;
            padding: 20rpx 0;
            border-bottom: 1px solid #f5f5f5;

            &:last-child {
                border-bottom: none;
            }

            .label {
                width: 180rpx;
                font-size: 28rpx;
                color: #666;
                padding-top: 4rpx;
                overflow: hidden;
                // 超出 ...
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .value {
                flex: 1;
                font-size: 28rpx;
                color: #333;
            }

            .info-image {
                flex: 1;
                width: 300rpx;
                border-radius: 8rpx;
            }
        }
    }
}

// 分享引导样式
.share-guide {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;

    .guide-content {
        width: 600rpx;
        background: #fff;
        border-radius: 24rpx;
        padding: 40rpx;

        .guide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40rpx;

            .title {
                font-size: 32rpx;
                font-weight: 500;
                color: #333;
            }
        }

        .guide-body {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 40rpx;

            .share-icon {
                width: 200rpx;
                height: 200rpx;
                margin-bottom: 20rpx;
            }

            .guide-text {
                font-size: 28rpx;
                color: #666;
                text-align: center;
            }
        }

        .guide-footer {
            display: flex;
            justify-content: center;

            .share-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10rpx;
                background: var(--primary-color);
                color: #fff;
                border-radius: 12rpx;
                padding: 20rpx 40rpx;
                border: none;
                font-size: 28rpx;

                &::after {
                    border: none;
                }
            }
        }
    }
}

// 修改操作栏样式
.action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx 40rpx;
    background: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 20rpx;

    .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10rpx;
        background: var(--primary-color);
        color: #fff;
        border-radius: 12rpx;
        padding: 20rpx;
        border: none;

        &::after {
            border: none;
        }

        &.download-btn {
            background: #52c41a;
        }
    }
}

// 动画效果
.fade-in {
    animation: fadeIn 0.3s ease-out;
}

.slide-in {
    animation: slideIn 0.3s ease-out 0.1s both;
}

.slide-in-delay {
    animation: slideIn 0.3s ease-out 0.2s both;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(20rpx);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
