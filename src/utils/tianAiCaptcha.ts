declare global {
  interface Window {
    initTAC: any;
  }
}

export default function initTianAiCaptcha(
  elementId: string,
  successCallback: (token: string) => any,
) {
  if (process.env.NODE_ENV === 'development') {
    successCallback('1145141919810');
    return;
  }
  const config = {
    requestCaptchaDataUrl: '/captcha-api/gen',
    validCaptchaUrl: '/captcha-api/check',
    bindEl: elementId,
    validSuccess: async (res: any, c: any, tac: any) => {
      tac.destroyWindow();
      await successCallback(res.data.id);
    },
  };
  const style = {
    logoUrl: null,
  };
  window
    .initTAC('/static', config, style)
    .then((tac: any) => {
      tac.init(); // 调用init则显示验证码
    })
    .catch((e: any) => {
      console.log('初始化tac失败', e);
    });
}
