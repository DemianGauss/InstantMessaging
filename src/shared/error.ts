// 定义错误类型
export interface ApiError {
  // 后端返回错误
  response?: {
    data?: {
      message?: string;
    };
  };
  // 前端返回错误
  message?: string;
}
