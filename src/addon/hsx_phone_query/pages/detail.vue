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

        <!-- 水印层 -->
        <view class="watermark" :style="watermarkStyle">
            {{ watermarkConfig.text }}
        </view>

        <!-- 绘制区域（隐藏） -->
        <canvas canvas-id="shareCanvas"
            style="width: 750rpx; height: 1200rpx; position: fixed; left: -9999rpx;"></canvas>

        <!-- #ifdef MP-WEIXIN -->
        <view class="action-bar" :class="{ 'fade-in': showContent }">
            <button class="action-btn share-btn" @click="handleDownload">
                <u-icon name="download" size="32" color="#fff"></u-icon>
                <text>保存图片</text>
            </button>
        </view>
        <!-- #endif -->
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getModelDetail, getWatermark } from '@/addon/hsx_phone_query/api/index'
import { onLoad, onShow } from '@dcloudio/uni-app'

const detail = ref<any>({})
const deviceInfo = ref<any>(null)
const loading = ref(true)
const showContent = ref(false)
const currentId = ref<number | null>(null)

// 画布尺寸
const canvasWidth = ref(750)
const canvasHeight = ref(1200)

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
            const padding = 40
            let currentHeight = padding

            // 设置背景
            ctx.setFillStyle('#ffffff')
            ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

            // 绘制标题
            ctx.setFillStyle('#333333')
            ctx.setFontSize(32)
            ctx.fillText('设备询结果', padding, currentHeight)
            currentHeight += 60

            // 绘制序列号
            ctx.setFontSize(28)
            ctx.fillText('序列号：' + detail.value.sn, padding, currentHeight)
            currentHeight += 50

            // 绘制设备信息
            if (deviceInfo.value) {
                ctx.setFontSize(30)
                ctx.fillText('设备信息', padding, currentHeight)
                currentHeight += 50

                // 机型信息
                ctx.setFontSize(28)
                ctx.fillText(deviceInfo.value.机型 || '未知设备', padding, currentHeight)
                currentHeight += 40

                if (deviceInfo.value.容量 || deviceInfo.value.颜色) {
                    ctx.setFontSize(26)
                    ctx.setFillStyle('#666666')
                    let specs = deviceInfo.value.容量 || ''
                    if (deviceInfo.value.颜色) {
                        specs += ' · ' + deviceInfo.value.颜色
                    }
                    ctx.fillText(specs, padding, currentHeight)
                    currentHeight += 50
                }

                // 绘制详细信息
                ctx.setFontSize(28)
                ctx.setFillStyle('#333333')
                for (const [key, value] of Object.entries(deviceInfo.value)) {
                    if (key !== '机型' && key !== '容量' && key !== '颜色') {
                        // 检查是否是图片URL
                        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'))) {
                            try {
                                const imagePath = await loadImage(value)
                                // 绘制图片标题
                                ctx.fillText(key + '', padding, currentHeight)
                                currentHeight += 30

                                // 计算图片尺寸
                                const imageWidth = canvasWidth.value - (padding * 2)
                                const imageHeight = 200 // 固定高度，可以根据需要调整

                                // 绘制图片
                                ctx.drawImage(imagePath, padding, currentHeight, imageWidth, imageHeight)
                                currentHeight += imageHeight + 30
                            } catch (error) {
                                console.error('加载图片失败:', error)
                                ctx.fillText(`${key}：${value}`, padding, currentHeight)
                                currentHeight += 40
                            }
                        } else {
                            // 普通文本
                            ctx.fillText(`${key}：${value}`, padding, currentHeight)
                            currentHeight += 40
                        }
                    }
                }
            }

            // 绘制时间
            ctx.setFontSize(24)
            ctx.setFillStyle('#999999')
            ctx.fillText('查询时间：' + formatTime(detail.value.create_time), padding, currentHeight + 40)

            // 修改水印绘制方式
            ctx.save()
            ctx.setFillStyle('#999999')
            ctx.setGlobalAlpha(0.1)

            // 绘制重复的水印
            const watermarkSize = 200
            const angle = -15
            const text = '仅供参考'

            ctx.setFontSize(32)

            for (let y = 0; y < canvasHeight.value; y += watermarkSize) {
                for (let x = 0; x < canvasWidth.value; x += watermarkSize) {
                    ctx.save()
                    ctx.translate(x + watermarkSize / 2, y + watermarkSize / 2)
                    ctx.rotate(angle * Math.PI / 180)
                    ctx.fillText(text, -50, 0)
                    ctx.restore()
                }
            }

            // 添加时间水印在底部
            ctx.setGlobalAlpha(0.6)
            ctx.setFontSize(24)
            const timeText = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
            ctx.fillText(timeText, padding, currentHeight + 80)

            ctx.restore()

            // 绘制完成
            ctx.draw(false, () => {
                setTimeout(() => {
                    uni.canvasToTempFilePath({
                        canvasId: 'shareCanvas',
                        success: (res) => {
                            resolve(res.tempFilePath)
                        },
                        fail: reject
                    })
                }, 300) // 增加延时，确保图片绘制完成
            })
        } catch (error) {
            reject(error)
        }
    })
}

// 处理下载
const handleDownload = async () => {
    try {
        uni.showLoading({
            title: '生成图片中...',
            mask: true
        })

        // 请求相册权限
        await uni.authorize({
            scope: 'scope.writePhotosAlbum'
        })

        const tempFilePath = await generateImage()

        // 保存图片到相册
        await uni.saveImageToPhotosAlbum({
            filePath: tempFilePath
        })

        uni.showToast({
            title: '保存成功',
            icon: 'success'
        })
    } catch (error) {
        console.error('生成/保存图片失败:', error)
        uni.showToast({
            title: error.errMsg || '保存失败',
            icon: 'none'
        })
    } finally {
        uni.hideLoading()
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

// 底部操作栏
.action-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20rpx;
    background: #fff;
    box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
    display: flex;
    justify-content: center;

    .action-btn {
        display: flex;
    align-items: center;
        justify-content: center;
        gap: 8rpx;
        width: 320rpx;
        height: 80rpx;
        border-radius: 40rpx;
        background: var(--primary-color);
        border: none;

        text {
            color: #fff;
            font-size: 28rpx;
        }

        &:active {
            opacity: 0.9;
        }
    }
}

// 水印样式
.watermark {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    white-space: nowrap;
    pointer-events: none;
    z-index: 1;
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
