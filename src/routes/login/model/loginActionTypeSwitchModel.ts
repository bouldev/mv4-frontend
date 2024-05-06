import { model } from '@modern-js/runtime/model';

export enum LoginActionType {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD,
}

export type LoginSwitchStateFunc = (type: LoginActionType) => void;

export const LoginActionTypeSwitchModel = model('loginActionTypeSwitch').define(
  {
    state: {
      state: LoginActionType.LOGIN,
      pendingNewState: LoginActionType.LOGIN,
    },
  },
);
