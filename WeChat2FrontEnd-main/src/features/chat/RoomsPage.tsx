import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/auth-store";
import { createGroupRoom, getRooms } from "./api";

/**
 * 接口定义：处理 API 错误类型
 */
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

function parseParticipants(input: string): number[] {
  return input
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
}

export function RoomsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 从正确的 store 中获取状态
  const { user, isAuthenticated, logout } = useAuthStore();

  const [name, setName] = useState("");
  const [participantIdsText, setParticipantIdsText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // 权限检查
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // 获取房间列表
  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getRooms(), // 不再手动传参
    enabled: isAuthenticated,
    refetchInterval: 8000,
  });

  // 创建房间
  const createRoomMutation = useMutation({
    mutationFn: (payload: { name: string; participant_ids: number[] }) =>
      createGroupRoom(payload), // 不再手动传参
    onSuccess: async () => {
      setName("");
      setParticipantIdsText("");
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      setFormError(error.response?.data?.message || "创建房间失败");
    },
  });

  function onCreateRoom(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const participant_ids = parseParticipants(participantIdsText);

    if (!cleanName) {
      setFormError("请输入房间名称");
      return;
    }

    if (participant_ids.length === 0) {
      setFormError("请至少添加一个参与者 ID");
      return;
    }

    createRoomMutation.mutate({ name: cleanName, participant_ids });
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">聊天大厅</h1>
            <p className="text-slate-500 text-sm">欢迎回来, {user?.username}</p>
          </div>
          <button
            className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            退出登录
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 左侧：创建房间 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-lg font-bold mb-4 text-slate-700">
              创建新群聊
            </h2>
            <form className="flex flex-col gap-4" onSubmit={onCreateRoom}>
              <input
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="房间名称 (如: 开发小组)"
              />
              <input
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={participantIdsText}
                onChange={(e) => setParticipantIdsText(e.target.value)}
                placeholder="参与者 ID (英文逗号隔开: 2,3,4)"
              />
              {formError && (
                <p className="text-red-500 text-xs italic">{formError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                disabled={createRoomMutation.isPending}
              >
                {createRoomMutation.isPending ? "正在创建..." : "立即创建"}
              </button>
            </form>
          </section>

          {/* 右侧：房间列表 */}
          <section className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 text-slate-700">
              已加入的房间
            </h2>

            {roomsQuery.isLoading && (
              <p className="text-slate-400 italic">正在加载房间列表...</p>
            )}

            <div className="grid gap-3">
              {roomsQuery.data?.data.results.map((room) => (
                <Link
                  className="flex justify-between items-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl transition-all group"
                  to={`/rooms/${room.id}`}
                  key={room.id}
                >
                  <div>
                    <strong className="text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {room.name || `未命名房间 ${room.id}`}
                    </strong>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                      {room.room_type}
                    </div>
                  </div>
                  <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              ))}

              {!roomsQuery.isLoading &&
                roomsQuery.data?.data.results.length === 0 && (
                  <p className="text-center py-10 text-slate-400">
                    暂无活跃房间，创建一个吧！
                  </p>
                )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
