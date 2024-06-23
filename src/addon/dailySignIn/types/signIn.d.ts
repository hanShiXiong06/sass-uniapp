export type SingInData = {
    showSignDays: Array
    rule: rule[]
    signState: number
    rewardRuleDay: Array
    cycle: number
    reward: {}
}
/** 签到是否开启 */
export type BannerItem = {
    status: number
}
export type rule = {
    day: number
    growth: number
    point:number
}  