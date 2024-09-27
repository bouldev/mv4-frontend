declare global {
  interface Window {
    initTAC: any;
  }
}

export interface TianAiCaptchaInitConfig {
  onSuccess?: (token: string) => any;
  onFail?: () => any;
  onClickRefresh?: () => any;
  onClickClose?: () => any;
  onInitialize?: () => any;
}

export default function initTianAiCaptcha(
  elementId: string,
  initConfig: TianAiCaptchaInitConfig,
) {
  /*
  if (process.env.NODE_ENV === 'development') {
    successCallback('1145141919810');
    return;
  }
  */
  const config = {
    requestCaptchaDataUrl: '/captcha-api/gen',
    validCaptchaUrl: '/captcha-api/check',
    bindEl: elementId,
    validSuccess: (res: any, c: any, tac: any) => {
      tac.destroyWindow();
      if (initConfig.onSuccess) {
        initConfig.onSuccess(res.data.id);
      }
    },
    validFail: (res: any, c: any, tac: any) => {
      tac.reloadCaptcha();
      if (initConfig.onFail) {
        initConfig.onFail();
      }
    },
    btnRefreshFun: (el: any, tac: any) => {
      tac.reloadCaptcha();
      if (initConfig.onClickRefresh) {
        initConfig.onClickRefresh();
      }
    },
    btnCloseFun: (el: any, tac: any) => {
      tac.destroyWindow();
      if (initConfig.onClickClose) {
        initConfig.onClickClose();
      }
    },
  };
  const style = {
    logoUrl: null,
  };
  window
    .initTAC('/static', config, style)
    .then((tac: any) => {
      if (initConfig.onInitialize) {
        initConfig.onInitialize();
      }
      tac.init();
    })
    .catch((e: any) => {
      console.log('初始化tac失败', e);
    });
}
