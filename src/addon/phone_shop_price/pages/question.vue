<template>
    <view>{{ modelInfo.modelName }}</view>

    <view class="question-list">
        {{ displayedQuestions }}
        <view class="question-item m-2 shadow rounded p-2" v-for="(item, index) in displayedQuestions"
            :key="item.questionId">
            <view class="question-item-title">
                {{ item.questionName }}
            </view>
            <view class="question-item-answer " v-for="(items, keys) in item.answerList " :key="items.answerId">
                <text class="answer-item mt-2">
                    <up-button type="link"
                        :class="{ 'back-btn': isAnswerSelected(item.questionId, items.answerId), 'selected-answer': isAnswerSelected(item.questionId, items.answerId) }"
                        @click="getAnswerAndShowNext({ questionId: item.questionId, answerType: item.answerType, answerId: items.answerId })"
                        :disabled="!items.isAllowRecovery" :text="items.mainAnswer">
                    </up-button>
                </text>
            </view>
        </view>

        <button v-if="displayedQuestions.length < questionList.length" @click="_getPrice"> 获取报价 </button>

        <up-popup v-model:show="show">
            <view class="popup-box">
                <view class="flex ">
                    <view class="flex-1">
                        <image class="cover" src=""></image>
                    </view>
                    <view class="flex-2">{{ price }}</view>
                </view>
            </view>
        </up-popup>
    </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { getQuetionList, getPrice } from "@/addon/phone_shop_price/api/recycle";
import useQuestion from '@/addon/phone_shop_price/utils/useQuestion';

const { questionInfo, getAnswer, isAnswerSelected } = useQuestion();

const modelId = ref(0);
const modelInfo = ref({});
const questionList = ref([]);
const displayedQuestionCount = ref(1); // 初始化显示1个问题
const show = ref(false);
const price = ref(0);



const displayedQuestions = computed(() => questionList.value.slice(0, displayedQuestionCount.value));


// 获取问题列表
const _getQuetionList = (id: number | string) => {
    getQuetionList(id).then((res: any) => {
        modelInfo.value = res.data.modelInfo;
        questionList.value = res.data.list;
    });
};

// 选择答案并显示下一个问题
const getAnswerAndShowNext = (data: any) => {
    getAnswer(data);  // 处理选项选择逻辑

    const selectedQuestion = questionList.value.find(item => item.questionId === data.questionId);
    const selectedAnswer = selectedQuestion.answerList.find(item => item.answerId === data.answerId);

    let nextQuestionId;

    if (selectedAnswer.nextQuestionSortId) {
        // 如果有指定的下一个问题
        nextQuestionId = selectedAnswer.nextQuestionSortId;
    } else {
        // 如果 nextQuestionSortId 为 null，按顺序获取下一个问题
        const currentIndex = questionList.value.findIndex(item => item.questionId === data.questionId);
        nextQuestionId = questionList.value[currentIndex + 1]?.questionId || null;
    }

    console.log('Next Question ID:', nextQuestionId);

    // 查找下一个问题，并确保它存在
    if (nextQuestionId) {
        const nextQuestion = questionList.value.find(item => item.questionId === nextQuestionId);

        if (nextQuestion) {
            // 将 displayedQuestionCount 增加以显示更多问题
            displayedQuestionCount.value += 1;
            console.log('Next question added:', nextQuestion);
        }
    } else {
        console.log('No more questions to display.');
    }

};

// 获取所选机型的价格
const _getPrice = () => {
    questionInfo.value.modelId = +modelId.value;
    getPrice(questionInfo.value).then(res => {
        price.value = res.data.recoveryPrice;
        show.value = true;
    });
};

// 加载页面时初始化问题列表
onMounted(() => {
    const query = new URLSearchParams(window.location.search);
    modelId.value = query.get('id');
    if (modelId.value) {
        _getQuetionList(modelId.value);
    }
});

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
