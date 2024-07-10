export function nowUnix() {
  return Math.round(new Date().getTime() / 1000);
}

export function formatTime(dateTime: number, flag: boolean) {
  // 格式化时间
  // dateTime：时间戳； flag：取值为true/false，用于判断是否需要显示时分秒
  if (dateTime != null) {
    // 若传入的dateTime为字符串类型，需要进行转换成数值，若不是无需下面注释代码
    const date = new Date(dateTime * 1000);
    // 获取年份
    const YY = date.getFullYear();
    // 获取月份
    const MM =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    // 获取日期
    const DD = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    if (flag) {
      // flag为true，显示时分秒格式
      // 获取小时
      const hh = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
      // 获取分
      const mm =
        date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
      /// 获取秒
      const ss =
        date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
      // 返回时间格式： 2020-11-09 13:14:52
      return `${YY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
    } else {
      // 返回时间格式： 2020-11-09
      return `${YY}-${MM}-${DD}`;
    }
  } else {
    return '';
  }
}
