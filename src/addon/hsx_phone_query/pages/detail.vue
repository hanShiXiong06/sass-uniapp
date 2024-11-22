<template>
    <view class="container">
        <view class="card" v-if="modelInfo.id">
            <view class="title text-center">查询项目: {{ modelInfo.type_name }}</view>

            <view class="sn  text-center">SN: {{ modelInfo.sn }}</view>

            <view class="info">
                <text class="info-title">详细信息</text>
                <view class="info-items">
                    <view v-for="(value, key) in modelInfo.info" :key="key" class="info-item">
                        <text class="info-key">{{ key }}:</text>
                        <template v-if="isImageUrl(value)">
                            <image :src="value" class="info-image" />
                        </template>
                        <text v-else class="info-value">{{ value }}</text>
                    </view>
                </view>
            </view>
            <text class="create-time">查询时间: {{ modelInfo.create_time }}</text>
            <canvas canvas-id="watermarkCanvas" class="watermark-canvas"></canvas>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getModelDetail } from '@/addon/hsx_phone_query/api/index'
import { onLoad } from '@dcloudio/uni-app'

let modelInfo = ref({});
onLoad((params) => {
    getModelDetail(params.id).then(res => {
        modelInfo.value = res.data
    });
});

const isImageUrl = (url) => {
    return url.startsWith('http');
};

const drawWatermark = () => {
    const canvas = uni.createCanvasContext('watermarkCanvas');
    const canvasWidth = 300;  // Change to fit your needs
    const canvasHeight = 400; // Change to fit your needs
    const watermarkText = '你的水印内容';

    canvas.setFillStyle('rgba(0, 0, 0, 0.1)'); // Set watermark color
    canvas.setFontSize(12); // Font size for watermark
    canvas.rotate(-20 * Math.PI / 180); // Rotate the text slightly for watermark effect

    for (let x = 0; x < canvasWidth; x += 100) {
        for (let y = 0; y < canvasHeight; y += 100) {
            canvas.fillText(watermarkText, x, y); // Draw watermark repeatedly
        }
    }

    canvas.draw();
};

onMounted(() => {
    drawWatermark();
});
</script>
<style scoped>
.watermark-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
    /* Ensure the canvas does not block interaction with the page */
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    background-color: #f0f0f0;
    position: relative;
    /* Required for positioning the canvas */
}

.card {
    background-color: #ffffff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    /* Ensure the watermark canvas stays over this */
    z-index: 1;
    min-width: 600rpx;
}

.title,
.id,
.sn,
.type-id,
.create-time {
    margin-bottom: 10px;
}

.info {
    margin-top: 20px;
}

.info-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
}

.info-items {
    background-color: #fafafa;
    border-radius: 5px;
    padding: 10px;
}

.info-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.info-key {
    font-weight: bold;
    min-width: 170rpx;
    margin-right: 10px;
}

.info-value {
    flex-grow: 1;
}

.info-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    margin-right: 10px;
}
</style>
