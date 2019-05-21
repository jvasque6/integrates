import React from "react";
import { Text, View } from "react-native";
import { RouteComponentProps } from "react-router-native";

import { translate } from "../../utils/translations/translate";

import { styles } from "./styles";

/**
 * User data returned by Google after a successful login
 */
interface IUser {
  email?: string;
  familyName: string;
  givenName: string;
  id: string;
  name: string;
  photoUrl?: string;
}

type IMenuProps = RouteComponentProps<{}, {}, { userInfo: IUser }>;

const menuView: React.FunctionComponent<IMenuProps> = (props: IMenuProps): JSX.Element => {
  const { userInfo } = props.location.state;
  const { t } = translate;

  return (
    <View style={styles.container}>
      <Text>{t("menu.welcomeText")} {userInfo.givenName}!</Text>
    </View>
  );
};

export { menuView as MenuView };
