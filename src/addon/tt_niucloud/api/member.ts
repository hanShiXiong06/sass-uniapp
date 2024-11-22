import request from "@/utils/request";

/***************************************************** hello world ****************************************************/
export function getParentMember() {
  return request.get(`tt_niucloud/member/parentMember`);
}

export function getTeamMember(params: Record<string, any>) {
  return request.get(`tt_niucloud/member/teamMember`, params, {
    showErrorMessage: true,
  });
}

export function getMemberPoster(params: Record<string, any>) {
  return request.get("tt_niucloud/member/poster", params, {
    showErrorMessage: true,
  });
}

export function getMemberWxInfo(params: Record<string, any>) {
  return request.get("tt_niucloud/member/wxInfo", params);
}

export function modifyMemberWxInfo(params: Record<string, any>) {
  return request.put("tt_niucloud/member/wxInfo", params, {
    showSuccessMessage: true,
    showErrorMessage: true,
  });
}
