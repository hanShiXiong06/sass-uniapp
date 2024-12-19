<template>
    <view>{{ modelInfo.modelName }}</view>

    <view class="question-list">
        <view class="question-item m-2 shadow rounded p-2" v-for="(item, index) in questionList" :key="item.questionId">
            <view class="question-item-title">
                {{ item.questionName }}
            </view>
            <view class="question-item-answer " v-for="(items, keys) in item.answerList " :key="items.answerId">
                <text class="answer-item mt-2">
                    <up-button type="link"
                        :class="{ 'back-btn': isAnswerSelected(item.questionId, items.answerId), 'selected-answer': isAnswerSelected(item.questionId, items.answerId) }"
                        @click="getAnswer({ questionId: item.questionId, answerType: item.answerType, answerId: items.answerId })"
                        :disabled="!items.isAllowRecovery" :text="items.mainAnswer">
                    </up-button>
                </text>
            </view>
        </view>
        <button @click="_getPrice"> 获取报价 </button>

        <up-popup v-model:show="show">
            <view class="popup-box">
                <view class="flex ">
                    <view class="flex-1">
                        <image class="cover" src="">

                        </image>
                    </view>
                    <view class="flex-2">
                        {{ price }}
                    </view>
                </view>

            </view>
        </up-popup>
    </view>
</template>

<script lang="ts" setup>

import { getTree } from "@/addon/phone_shop_price/api/recycle"
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app'
import { getQuetionList, getPrice } from "@/addon/phone_shop_price/api/recycle"

const modelId = ref(0);
const modelInfo = ref({})
const questionList = ref([])
const activeCount = ref(0)

const questionInfo = ref({ questionList: [] })

const show = ref(false)
const price = ref(0)

onLoad((data: any) => {
    modelId.value = data.id
    questionInfo.value.modelId = (+data.id)
    _getQuetionList(data.id)
})

// 获取问题列表
const _getQuetionList = (id: number | string) => {
    getQuetionList(id).then((res: any) => {
        modelInfo.value = res.data.modelInfo
        questionList.value = res.data.list
    })
}



const getAnswer = (data: any) => {
    const obj = {
        questionId: data.questionId,
        answerIdList: [data.answerId]
    }

    const index = questionList.value.findIndex(item => item.questionId == data.questionId)

    // 判断是单选还是多选
    if (data.answerType == 0) {
        // 单选：移除当前问题的其他选项，并添加新的选项
        questionInfo.value.questionList = questionInfo.value.questionList.filter(item => item.questionId != data.questionId)
        questionInfo.value.questionList.push(obj)
    } else {
        // 多选：判断选项是否已选中，如果选中则取消，否则添加
        const question = questionInfo.value.questionList.find(item => item.questionId == data.questionId)
        if (question) {
            const answerIndex = question.answerIdList.indexOf(data.answerId)
            if (answerIndex > -1) {
                question.answerIdList.splice(answerIndex, 1)
            } else {
                question.answerIdList.push(data.answerId)
            }
        } else {
            questionInfo.value.questionList.push(obj)
        }
    }
}

const isAnswerSelected = (questionId: number, answerId: number) => {
    const question = questionInfo.value.questionList.find(item => item.questionId == questionId)
    return question ? question.answerIdList.includes(answerId) : false
}
// 获取所选机型的价格
const _getPrice = () => {
    getPrice(questionInfo.value).then(res => {
        price.value = res.data.recoveryPrice
        show.value = true
    })
}

</script>

<style>
.question-item-answer {
    display: flex;
    align-items: center;
    justify-content: center;
}

.answer-item {
    border: 1px solid #ddd;
}

.back-btn {
    background-color: #f0f8ff;
}

.selected-answer {
    background-color: #4caf50;
    color: white;
    font-weight: bold;
}

.popup-box {
    height: 70vh;
}
</style>
