/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    return formatTimestamp(timestamp);
  }
}

/**
 * 复制文本到剪贴板
 */
function copyToClipboard(text, successMsg = '复制成功') {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: successMsg,
          icon: 'success',
        });
        resolve();
      },
      fail: (err) => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
}

/**
 * 显示加载提示
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true,
  });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示错误提示
 */
function showError(message) {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 3000,
  });
}

/**
 * 显示成功提示
 */
function showSuccess(message) {
  wx.showToast({
    title: message,
    icon: 'success',
    duration: 2000,
  });
}

/**
 * 场景映射
 */
const SCENE_MAP = {
  work: '工作',
  study: '学习',
  family: '家庭',
  custom: '自定义',
};

/**
 * 获取场景名称
 */
function getSceneName(scene) {
  return SCENE_MAP[scene] || scene;
}

module.exports = {
  formatTimestamp,
  formatRelativeTime,
  copyToClipboard,
  showLoading,
  hideLoading,
  showError,
  showSuccess,
  getSceneName,
};