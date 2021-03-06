/* tslint:disable:no-any
 * Disabling here is necessary because this is a generic wrapper
 * and will receive React components with different types of props
*/
import React from "react";
import { connect } from "react-redux";
import store from "../store/index";

type ComponentMapping = ((
  arg1: React.FunctionComponent<any>,
  arg2: any) => React.FunctionComponent<any>);

const reduxWrapper: ComponentMapping =
  (componentToWrap: React.FunctionComponent<any>,
   mapStateToProps: any,
  ): React.FunctionComponent<any> => {

  /* tslint:disable-next-line:variable-name
   * Disabling here is necessary due a conflict
   * between lowerCamelCase var naming rule from tslint
   * and PascalCase rule for naming JSX elements
   */
  const ComponentWrapper: React.ComponentClass =
    connect(mapStateToProps)(componentToWrap);

  return (props: any): JSX.Element => (
    <ComponentWrapper {...props} store={store}/>
  );
};

export = reduxWrapper;
