<template>
	<text class="text-[20px]">{{helloWorld}}</text>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getHelloWorld } from '@/addon/hsx_yinsheng_pay/api/hello_world'
import { onLoad } from '@dcloudio/uni-app'
let helloWorld = ref('');
onLoad(() => {
    getHelloWorld().then((res) => {
        helloWorld.value = res.data
    })
})
</script>
<style lang="scss" scoped>

</style>
