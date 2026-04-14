import { create } from "zustand";
import { friendApi } from "../api/friendApi";

// 用户
export interface User {
  userId: number;
  username: string;
  avatar: string;
  email: string | null;
}

// 好友
export interface Friend extends User {
  labelName: string | null; // 标签名
  remark: string | null; // 备注名
}

// 用户关系枚举
export type Relation = 0 | 1 | 2; // 0:好友, 1:已经发送好友申请但是未处理, 2:陌生人/已拒绝

// 用户详细资料接口
export interface UserProfile extends User {
  labelName?: string;
  remark?: string;
  relation: Relation; // 关系枚举
  applyMsg?: string; // 如果是申请中，带上对方的留言
}

// 好友申请状态枚举
export type RequestStatus = 0 | 1 | 2; // 0:待处理, 1:已同意, 2:已拒绝

// 好友申请
export interface FriendRequest {
  requestId: number;
  sender: User;
  applyMsg: string | null;
  status: RequestStatus;
  createTime: string;
  handleTime: string | null;
}

interface FriendStore {
  friends: Friend[]; // 好友列表
  requests: FriendRequest[]; // 好友申请列表
  searchResults: User[]; // 全局搜索用户结果
  selectedId: string | number | null; //当前选中的ID
  fetchFriends: () => Promise<void>; // 获取好友列表
  fetchRequests: () => Promise<void>; // 获取申请列表
  searchUsers: (keyword: string) => Promise<void>; // 搜索用户
  setSelectedId: (id: string | number | null) => void; // 设置选中的ID
  clearSearchResults: () => void; // 清空搜索结果
}

export const useFriendStore = create<FriendStore>((set) => ({
  friends: [],
  requests: [],
  searchResults: [],
  selectedId: null,
  fetchFriends: async () => {
    const res = await friendApi.getFriends();
    set({ friends: res.data.data.friendList });
  },
  fetchRequests: async () => {
    const res = await friendApi.getRequests();
    set({ requests: res.data.data.requestList });
  },
  searchUsers: async (keyword: string) => {
    if (!keyword.trim()) {
      set({ searchResults: [] });
      return;
    }
    const res = await friendApi.searchUsers(keyword);
    set({ searchResults: res.data.data.userList });
  },
  setSelectedId: (id) => set({ selectedId: id }),
  clearSearchResults: () => set({ searchResults: [] }),
}));
