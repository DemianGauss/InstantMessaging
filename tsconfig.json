import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../auth/auth-store";
import { getMessages, getRooms, sendMessage } from "./api";

export function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState("");

  const numericRoomId = useMemo(() => Number(roomId), [roomId]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getRooms(),
    enabled: isAuthenticated,
  });

  const room = roomsQuery.data?.data.results.find(
    (item) => item.id === numericRoomId,
  );

  const messagesQuery = useQuery({
    queryKey: ["messages", numericRoomId],
    queryFn: () => getMessages(numericRoomId),
    enabled: isAuthenticated && Number.isFinite(numericRoomId),
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (nextContent: string) =>
      sendMessage(numericRoomId, nextContent),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({
        queryKey: ["messages", numericRoomId],
      });
    },
  });

  // 抽离核心提交逻辑，避免重复代码和类型断言
  const handleSend = () => {
    const clean = content.trim();
    if (!clean || sendMutation.isPending) return;
    sendMutation.mutate(clean);
  };

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    handleSend();
  }

  // 修复：使用标准的 KeyboardEvent 类型，无 any
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <section className="max-w-4xl mx-auto flex flex-col h-[85vh] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <header className="p-4 border-b flex justify-between items-center bg-white">
          <div>
            <h1 className="font-bold text-slate-800">
              {room?.name || `Room ${roomId}`}
            </h1>
            <p className="text-xs text-slate-500">
              {room?.participants?.length || 0} participants
            </p>
          </div>
          <Link className="text-sm text-indigo-600 hover:underline" to="/">
            返回列表
          </Link>
        </header>

        <section className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messagesQuery.data?.data.results.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-bold text-indigo-600">
                  {msg.sender.username}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-slate-200 max-w-[85%] text-sm text-slate-700">
                {msg.content}
              </div>
            </div>
          ))}
        </section>

        <footer className="p-4 border-t bg-white">
          <form onSubmit={onSubmit} className="flex gap-2">
            <textarea
              className="flex-1 p-2 bg-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 text-sm resize-none"
              rows={1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="按 Enter 发送，Shift+Enter 换行"
            />
            <button
              disabled={sendMutation.isPending || !content.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
              type="submit"
            >
              发送
            </button>
          </form>
        </footer>
      </section>
    </main>
  );
}
