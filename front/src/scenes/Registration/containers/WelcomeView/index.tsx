/* tslint:disable jsx-no-lambda
 * Disabling this rule is necessary for the sake of simplicity and
 * readability of the code that binds click events
 */

import _ from "lodash";
import React, { ComponentType } from "react";
import { Button, Row } from "react-bootstrap";
import { InferableComponentEnhancer, lifecycle } from "recompose";
import { AnyAction, Reducer } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { StateType } from "typesafe-actions";
import { default as logo } from "../../../../resources/logo.png";
import store from "../../../../store/index";
import globalStyle from "../../../../styles/global.css";
import reduxWrapper from "../../../../utils/reduxWrapper";
import translate from "../../../../utils/translations/translate";
import * as actions from "../../actions";
import { compulsoryNotice as CompulsoryNotice } from "../../components/CompulsoryNotice";
import style from "./index.css";

export interface IWelcomeViewProps {
  email: string;
  isAuthorized: boolean | undefined;
  isRememberEnabled: boolean;
  legalNotice: {
    open: boolean;
    rememberDecision: boolean;
  };
  username: string;
}

const enhance: InferableComponentEnhancer<{}> =
  lifecycle({
    componentDidMount(): void {
      if (localStorage.getItem("showAlreadyLoggedin") === "1") {
        localStorage.removeItem("showAlreadyLoggedin");
      } else {
        const thunkDispatch: ThunkDispatch<{}, {}, AnyAction> = (
          store.dispatch as ThunkDispatch<{}, {}, AnyAction>
        );
        thunkDispatch(actions.loadAuthorization());
      }
    },
  });

const acceptLegal: ((rememberValue: boolean) => void) = (rememberValue: boolean): void => {
  const thunkDispatch: ThunkDispatch<{}, {}, AnyAction> = (
    store.dispatch as ThunkDispatch<{}, {}, AnyAction>
  );

  thunkDispatch(actions.acceptLegal(rememberValue));
};

const renderLegalNotice: ((props: IWelcomeViewProps) => JSX.Element) = (props: IWelcomeViewProps): JSX.Element =>

  props.isRememberEnabled ? <div /> : (
    <React.Fragment>
      <CompulsoryNotice
        content={translate.t("legalNotice.description")}
        id="legalNotice"
        onAccept={acceptLegal}
        onCheckRemember={(): void => { store.dispatch(actions.checkRemember()); }}
        open={props.legalNotice.open}
        rememberDecision={props.legalNotice.rememberDecision}
      />
    </React.Fragment>
  );

const renderUnauthorized: (() => JSX.Element) = (): JSX.Element => (
  <React.Fragment>
    <p>{translate.t("registration.unauthorized")}</p>
  </React.Fragment>
);

const renderModalIfAuthorized: ((props: IWelcomeViewProps) => JSX.Element) =
  (props: IWelcomeViewProps): JSX.Element =>
    props.isAuthorized === true
      ? renderLegalNotice(props)
      : renderUnauthorized();

const renderAlreadyLoggedIn: ((email: string) => JSX.Element) =
  (email: string): JSX.Element => (
    <React.Fragment>
      <div>
        <Row style={{ paddingBottom: "20px" }}><h3>{translate.t("registration.logged_in_title")}</h3></Row>
        <Row><p>{translate.t("registration.logged_in_message")}</p></Row>
        <Row>
          <Button bsStyle="primary" block={true} onClick={actions.loadDashboard}>
            {translate.t("registration.continue_btn")} {email}
          </Button>
        </Row>
      </div>
    </React.Fragment>
  );

export const component: React.SFC<IWelcomeViewProps> =
  (props: IWelcomeViewProps): JSX.Element => (
    <React.StrictMode>
      <div className={`${style.container} ${globalStyle.lightFg}`}>
        <div className={style.content}>
          <div style={{ paddingBottom: "50px" }}>
            <img style={{ paddingBottom: "30px" }} src={logo} alt="logo" /><br />
            <h1>{translate.t("registration.greeting")} {props.username}!</h1>
          </div>
          {localStorage.getItem("showAlreadyLoggedin") === "1" ? renderAlreadyLoggedIn(props.email) : undefined}
          {_.isUndefined(props.isAuthorized) ? undefined : renderModalIfAuthorized(props)}
        </div>
      </div>
    </React.StrictMode>
  );

export const welcomeView: ComponentType<IWelcomeViewProps> = reduxWrapper(
  enhance(component) as React.SFC<IWelcomeViewProps>,
  (state: StateType<Reducer>): Partial<IWelcomeViewProps> => ({
    ...state.registration.welcomeView,
    legalNotice: state.registration.legalNotice,
  }),
);