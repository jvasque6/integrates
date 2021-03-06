import { Reducer } from "redux";

import { IActionStructure } from "../../store";

import { actionTypes } from "./actions";

/**
 * State structure of LoginView
 */
export interface ILoginState {
  authProvider: string;
  authToken: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOutdated?: boolean;
  pushToken: string;
  userInfo: {
    email?: string;
    familyName: string;
    givenName: string;
    id: string;
    name: string;
    photoUrl?: string;
  };
}

export const initialState: ILoginState = {
  authProvider: "",
  authToken: "",
  isAuthenticated: false,
  isLoading: false,
  isOutdated: undefined,
  pushToken: "",
  userInfo: {
    email: "",
    familyName: "",
    givenName: "",
    id: "",
    name: "",
    photoUrl: "",
  },
};

const actionMap: Dictionary<((state: ILoginState, action: IActionStructure) => ILoginState)> = {};

actionMap[actionTypes.GOOGLE_LOGIN_LOAD] = (state: ILoginState): ILoginState => ({
  ...state,
  isLoading: !state.isLoading,
});

actionMap[actionTypes.LOGIN_SUCCESS] = (state: ILoginState, action: IActionStructure): ILoginState => ({
  ...state,
  authProvider: action.payload.authProvider as string,
  authToken: action.payload.authToken as string,
  isAuthenticated: true,
  pushToken: action.payload.pushToken as string,
  userInfo: action.payload.userInfo as ILoginState["userInfo"],
});

actionMap[actionTypes.RESOLVE_VERSION] = (state: ILoginState, action: IActionStructure): ILoginState => ({
  ...state,
  isOutdated: action.payload.isOutdated as boolean,
});

export const loginReducer: Reducer<ILoginState, IActionStructure> = (
  state: ILoginState = initialState, action: IActionStructure,
): ILoginState => {
  if (action.type in actionMap) {
    return actionMap[action.type](state, action);
  }

  return state;
};
