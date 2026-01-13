/**
 * 错误码枚举
 */
const ErrorCode = {
  PARAM_INVALID: 'PARAM_INVALID',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL: 'INTERNAL',
};

/**
 * 错误消息映射
 */
const ERROR_MESSAGES = {
  [ErrorCode.PARAM_INVALID]: '参数无效',
  [ErrorCode.NOT_FOUND]: '记录不存在',
  [ErrorCode.FORBIDDEN]: '无权访问此记录',
  [ErrorCode.INTERNAL]: '服务内部错误',
};

/**
 * 简单错误类
 */
class AppError extends Error {
  constructor(code, message, details) {
    super(message || ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

/**
 * 截断错误堆栈
 */
function truncateErrorStack(error, maxLength = 500) {
  if (!error.stack) return '';
  return error.stack.length > maxLength
    ? error.stack.substring(0, maxLength) + '...'
    : error.stack;
}

module.exports = {
  ErrorCode,
  ERROR_MESSAGES,
  AppError,
  truncateErrorStack,
};