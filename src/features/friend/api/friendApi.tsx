import https from "../../../shared/https";

export const friendApi = {
  // 搜索用户
  searchUsers: (keyword: string) =>
    https.get(`/api/friend/search?keyword=${keyword}`),
  // 发送好友申请
  sendRequest: (target_id: number, apply_msg: string) =>
    https.post("/api/friend/request", { target_id, apply_msg }),
  // 获取好友列表
  getFriends: () => https.get("/api/friend/list"),
  // 获取好友申请列表(所有申请，包括已处理和未处理)
  getRequests: () => https.get("/api/friend/requestlist"),
  // 处理好友申请 (1 同意/ 0 拒绝)
  handleRequest: (target_id: number, status: number) =>
    https.put(`/api/friend/request`, { target_id, status }),
  // 删除好友
  deleteFriend: (friendId: number) => https.delete(`/api/friend/${friendId}`),
  // 获取用户详细信息
  getUserProfile: (userId: number) =>
    https.get(`/api/user/profile?userId=${userId}`),
};
