export function nowUnix() {
  return Math.round(new Date().getTime() / 1000);
}

export function formatTime(dateTime: number, flag: boolean) {
  if (dateTime != null) {
    const date = new Date(dateTime * 1000);
    const YY = date.getFullYear();
    const MM =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    const DD = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    if (flag) {
      const hh = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
      const mm =
        date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
      const ss =
        date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
      return `${YY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
    } else {
      return `${YY}-${MM}-${DD}`;
    }
  } else {
    return '';
  }
}

export function getDurationChineseString(sec: number) {
  let durationStr = '';
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor(((sec % 86400) % 3600) / 60);
  const seconds = Math.floor(((sec % 86400) % 3600) % 60);
  if (days > 0) {
    durationStr = `${days}天${hours}小时${minutes}分钟${seconds}秒`;
  } else if (hours > 0) {
    durationStr = `${hours}小时${minutes}分钟${seconds}秒`;
  } else if (minutes > 0) {
    durationStr = `${minutes}分钟${seconds}秒`;
  } else if (seconds > 0) {
    durationStr = `${seconds}秒`;
  }
  // 凑合下吧。。。
  durationStr = durationStr
    .replaceAll('0小时', '')
    .replaceAll('0分钟', '')
    .replaceAll('0秒', '');
  return durationStr;
}
