import http from "../../shared/http";
import type { ChatRoom, Message, PaginatedResponse } from "./types";

// 注意：现在不需要手动传 authHeader 了，http.ts 里的拦截器会自动帮你带上！

export function getRooms() {
  return http.get<PaginatedResponse<ChatRoom>>("/api/v1/chat/rooms/");
}

export function createGroupRoom(payload: {
  name: string;
  participant_ids: number[];
}) {
  return http.post<ChatRoom>("/api/v1/chat/rooms/", {
    room_type: "group",
    ...payload,
  });
}

export function getMessages(roomId: number) {
  return http.get<PaginatedResponse<Message>>(
    `/api/v1/chat/rooms/${roomId}/messages/`,
  );
}

export function sendMessage(roomId: number, content: string) {
  return http.post<Message>(`/api/v1/chat/rooms/${roomId}/messages/`, {
    content,
  });
}
