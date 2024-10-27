import { model } from '@modern-js/runtime/model';
import { MV4UserInfo } from '@/api/user';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import { formatTime, nowUnix } from '@/utils/timeUtils';

export interface GlobalUserModelInterface {
  loaded: boolean;
  loggedIn: boolean;
  error: boolean;
  errMsg: string;
  user: MV4UserInfo;
  wm: string[];
}

export const GlobalUserModel = model<GlobalUserModelInterface>(
  'mv4GlobalUserModel',
).define({
  state: {
    loaded: false,
    error: false,
    loggedIn: false,
    errMsg: '',
    user: {
      username: 'Loading...',
      email: '',
      permission: 0,
      balance: 0,
      fbCoins: 0,
      plan: 0,
      planExpire: 0,
      isLifetimePlan: false,
      apiKey: '',
    },
    wm: [''],
  },
  actions: {
    init: {
      fulfilled: (state, value) => {
        state.loaded = true;
        state.loggedIn = true;
        state.user = value.user;
        state.wm = [
          (value.user as MV4UserInfo).username,
          formatTime(nowUnix(), true),
        ];
      },
      rejected: (state, error) => {
        state.loaded = true;
        state.error = true;
        console.error(error);
        if (error instanceof MV4RequestError) {
          state.loggedIn = false;
          state.errMsg = error.message;
        }
        if (error instanceof Error) {
          state.errMsg = error.message;
        }
      },
    },
    update: {
      fulfilled: (state, value) => {
        state.user = value.user;
        state.loggedIn = true;
        state.wm = [
          (value.user as MV4UserInfo).username,
          formatTime(nowUnix(), true),
        ];
      },
      rejected: (state, error) => {
        state.error = true;
        console.error(error);
        if (error instanceof MV4RequestError) {
          state.loggedIn = false;
          state.errMsg = error.message;
        }
        if (error instanceof Error) {
          state.errMsg = error.message;
        }
      },
    },
  },
  effects: {
    async init() {
      return await baseUpdateFunction();
    },
    async update() {
      return await baseUpdateFunction();
    },
  },
});

async function baseUpdateFunction() {
  const req = await mv4RequestApi<any, MV4UserInfo>({
    methodGet: true,
    path: '/user/info',
  });
  return {
    loaded: true,
    user: req.data,
  };
}
