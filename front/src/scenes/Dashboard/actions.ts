/* tslint:disable:no-any
 * Disabling this rule is necessary because the payload type may differ between
 * actions
 */
import { AxiosError, AxiosResponse } from "axios";
import { Action, AnyAction, Dispatch } from "redux";
import { reset } from "redux-form";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { formatUserlist } from "../../utils/formatHelpers";
import { msgError, msgSuccess } from "../../utils/notifications";
import rollbar from "../../utils/rollbar";
import translate from "../../utils/translations/translate";
import Xhr from "../../utils/xhr";
import * as actionType from "./actionTypes";
import { IProjectUsersViewProps, IUserData } from "./components/ProjectUsersView/index";
import { IRecordsViewProps } from "./components/RecordsView";
import { IResourcesViewProps } from "./components/ResourcesView";

export interface IActionStructure {
  payload: any;
  type: string;
}

type DashboardAction = ((...args: any[]) => IActionStructure);
type ThunkDispatcher = Dispatch<Action> & ThunkDispatch<{}, {}, AnyAction>;
type ThunkActionStructure = ((...args: any[]) => ThunkAction<void, {}, {}, AnyAction>);

export const removeRepo: ThunkActionStructure =
  (projectName: string, repository: string, branch: string): ThunkAction<void, {}, {}, Action> =>
    (dispatch: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `mutation {
      removeRepositories (
        repositoryData: ${JSON.stringify(JSON.stringify({ urlRepo: repository, branch }))},
        projectName: "${projectName}"
      ) {
        success
        resources {
          environments
          repositories
        }
      }
    }`;
    new Xhr().request(gQry, "An error occurred removing repositories")
    .then((response: AxiosResponse) => {
      const { data } = response.data;
      if (data.removeRepositories.success) {
        dispatch({
          payload: {
            environments: JSON.parse(data.removeRepositories.resources.environments),
            repositories: JSON.parse(data.removeRepositories.resources.repositories),
          },
          type: actionType.LOAD_RESOURCES,
        });
        msgSuccess(
          translate.t("search_findings.tab_resources.success_remove"),
          translate.t("search_findings.tab_users.title_success"),
        );
      } else {
        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error("An error occurred removing repositories");
      }
    })
    .catch((error: AxiosError) => {
      if (error.response !== undefined) {
        const { errors } = error.response.data;

        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error(error.message, errors);
      }
    });
};

export const removeEnv: ThunkActionStructure =
  (projectName: string, envToRemove: string): ThunkAction<void, {}, {}, Action> =>
    (dispatch: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `mutation {
      removeEnvironments (
        repositoryData: ${JSON.stringify(JSON.stringify({ urlEnv: envToRemove }))},
        projectName: "${projectName}"
      ) {
        success
        resources {
          environments
          repositories
        }
      }
    }`;
    new Xhr().request(gQry, "An error occurred removing environments")
    .then((response: AxiosResponse) => {
      const { data } = response.data;
      if (data.removeEnvironments.success) {
        dispatch({
          payload: {
            environments: JSON.parse(data.removeEnvironments.resources.environments),
            repositories: JSON.parse(data.removeEnvironments.resources.repositories),
          },
          type: actionType.LOAD_RESOURCES,
        });
        msgSuccess(
          translate.t("search_findings.tab_resources.success_remove"),
          translate.t("search_findings.tab_users.title_success"),
        );
      } else {
        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error("An error occurred removing environments");
      }
    })
    .catch((error: AxiosError) => {
      if (error.response !== undefined) {
        const { errors } = error.response.data;

        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error(error.message, errors);
      }
    });
};

export const clearResources: DashboardAction =
  (): IActionStructure => ({
  payload: undefined,
  type: actionType.CLEAR_RESOURCES,
});

export const loadResources: ThunkActionStructure =
  (projectName: IResourcesViewProps["projectName"]): ThunkAction<void, {}, {}, Action> =>
  (dispatch: ThunkDispatcher): void => {
    dispatch(clearResources());
    let gQry: string;
    gQry = `{
        resources (projectName: "${projectName}") {
          environments
          repositories
        }
    }`;
    new Xhr().request(gQry, "An error occurred getting repositories")
    .then((response: AxiosResponse) => {
      const { data } = response.data;
      dispatch({
        payload: {
          environments: JSON.parse(data.resources.environments),
          repositories: JSON.parse(data.resources.repositories),
        },
        type: actionType.LOAD_RESOURCES,
      });
    })
    .catch((error: AxiosError) => {
      if (error.response !== undefined) {
        const { errors } = error.response.data;

        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error(error.message, errors);
      }
    });
};

export const addRepositoryField: DashboardAction =
  (): IActionStructure => ({
      payload: undefined,
      type: actionType.ADD_REPO_FIELD,
});

export const removeRepositoryField: DashboardAction =
  (index: number): IActionStructure => ({
      payload: { index },
      type: actionType.REMOVE_REPO_FIELD,
});

export const addEnvironmentField: DashboardAction =
  (): IActionStructure => ({
      payload: undefined,
      type: actionType.ADD_ENV_FIELD,
});

export const removeEnvironmentField: DashboardAction =
  (index: number): IActionStructure => ({
      payload: { index },
      type: actionType.REMOVE_ENV_FIELD,
});

export const openAddModal: DashboardAction =
  (type: "repository" | "environment"): IActionStructure => ({
      payload: { type },
      type: actionType.OPEN_ADD_MODAL,
});

export const closeAddModal: DashboardAction =
  (): IActionStructure => ({
      payload: undefined,
      type: actionType.CLOSE_ADD_MODAL,
});

export const saveRepos: ThunkActionStructure =
  (projectName: string, reposData: IResourcesViewProps["addModal"]["repoFields"],
  ): ThunkAction<void, {}, {}, Action> => (dispatch: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `mutation {
      addRepositories (
        resourcesData: ${JSON.stringify(JSON.stringify(reposData))},
        projectName: "${projectName}") {
        success
        resources {
          environments
          repositories
        }
      }
    }`;
    new Xhr().request(gQry, "An error occurred adding repositories")
    .then((response: AxiosResponse) => {
      const { data } = response.data;
      if (data.addRepositories.success) {
        dispatch(closeAddModal());
        dispatch({
          payload: {
            environments: JSON.parse(data.addRepositories.resources.environments),
            repositories: JSON.parse(data.addRepositories.resources.repositories),
          },
          type: actionType.LOAD_RESOURCES,
        });
        msgSuccess(
          translate.t("search_findings.tab_resources.success"),
          translate.t("search_findings.tab_users.title_success"),
        );
      } else {
        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error("An error occurred adding repositories");
      }
    })
    .catch((error: AxiosError) => {
      if (error.response !== undefined) {
        const { errors } = error.response.data;

        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error(error.message, errors);
      }
    });
};

export const saveEnvs: ThunkActionStructure =
  (projectName: string,
   envsData: IResourcesViewProps["addModal"]["envFields"]): ThunkAction<void, {}, {}, Action> =>
    (dispatch: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `mutation {
      addEnvironments (
        resourcesData: ${JSON.stringify(JSON.stringify(envsData))},
        projectName: "${projectName}") {
        success
        resources {
          environments
          repositories
        }
      }
    }`;
    new Xhr().request(gQry, "An error occurred adding environments")
    .then((response: AxiosResponse) => {
      const { data } = response.data;
      if (data.addEnvironments.success) {
      dispatch(closeAddModal());
      dispatch({
          payload: {
            environments: JSON.parse(data.addEnvironments.resources.environments),
            repositories: JSON.parse(data.addEnvironments.resources.repositories),
          },
          type: actionType.LOAD_RESOURCES,
        });
      msgSuccess(
          translate.t("search_findings.tab_resources.success"),
          translate.t("search_findings.tab_users.title_success"),
        );
      } else {
        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error("An error occurred adding repositories");
      }
    })
    .catch((error: AxiosError) => {
      if (error.response !== undefined) {
        const { errors } = error.response.data;

        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error(error.message, errors);
      }
    });
};

export const modifyRepoUrl: DashboardAction =
  (index: number, newValue: string): IActionStructure => ({
      payload: {
        index,
        newValue,
      },
      type: actionType.MODIFY_REPO_URL,
});

export const modifyRepoBranch: DashboardAction =
  (index: number, newValue: string): IActionStructure => ({
      payload: {
        index,
        newValue,
      },
      type: actionType.MODIFY_REPO_BRANCH,
});

export const modifyEnvUrl: DashboardAction =
  (index: number, newValue: string): IActionStructure => ({
      payload: {
        index,
        newValue,
      },
      type: actionType.MODIFY_ENV_URL,
});

export const addFileName: DashboardAction =
  (newValue: string): IActionStructure => ({
      payload: {
        newValue,
      },
      type: actionType.ADD_FILE_NAME,
});

export const clearUsers: DashboardAction =
  (): IActionStructure => ({
  payload: undefined,
  type: actionType.CLEAR_USERS,
});

export const loadUsers: ThunkActionStructure =
  (
    projectName: IProjectUsersViewProps["projectName"],
  ): ThunkAction<void, {}, {}, Action> => (dispatch: ThunkDispatcher): void => {
    dispatch(clearUsers());
    let gQry: string;
    gQry = `{
      projectUsers(projectName:"${projectName}"){
        email
        role
        responsability
        phoneNumber
        organization
        firstLogin
        lastLogin
      }
    }`;
    new Xhr().request(gQry, "An error occurred getting project users")
    .then((response: AxiosResponse) => {
      const { data } = response.data;

      dispatch({
          payload: { userlist: formatUserlist(data.projectUsers) },
          type: actionType.LOAD_USERS,
      });
    })
    .catch((error: AxiosError) => {
      if (error.response !== undefined) {
        const { errors } = error.response.data;

        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error(error.message, errors);
      }
    });
};

export const removeUser: ThunkActionStructure =
  (
    projectName: IProjectUsersViewProps["projectName"],
    email: IUserData["email"],
  ): ThunkAction<void, {}, {}, Action> => (dispatch: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `mutation {
      removeUserAccess(projectName: "${projectName}", userEmail: "${email}"){
        removedEmail
        success
      }
    }`;
    new Xhr().request(gQry, "An error occurred removing users")
    .then((response: AxiosResponse) => {
      const { data } = response.data;

      if (data.removeUserAccess.success) {
        const removedEmail: string = data.removeUserAccess.removedEmail;

        dispatch({
          payload: { removedEmail },
          type: actionType.REMOVE_USER,
        });
        msgSuccess(
          `${email} ${translate.t("search_findings.tab_users.success_delete")}`,
          translate.t("search_findings.tab_users.title_success"),
        );
      } else {
        msgError(translate.t("proj_alerts.error_textsad"));
      }
    })
    .catch((error: AxiosError) => {
      if (error.response !== undefined) {
        const { errors } = error.response.data;

        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error(error.message, errors);
      }
    });
};

export const openUsersMdl: DashboardAction =
  (type: "add" | "edit", initialValues?: {}): IActionStructure => ({
    payload: { type, initialValues },
    type: actionType.OPEN_USERS_MDL,
});

export const closeUsersMdl: DashboardAction =
  (): IActionStructure => ({
    payload: undefined,
    type: actionType.CLOSE_USERS_MDL,
});

export const addUser: ThunkActionStructure =
 (
   newUser: IUserData,
   projectName: IProjectUsersViewProps["projectName"],
 ): ThunkAction<void, {}, {}, Action> => (dispatch: ThunkDispatcher): void => {
   let gQry: string;
   gQry = `mutation {
     grantUserAccess(
       email: "${newUser.email}",
       organization: "${newUser.organization}",
       phoneNumber: "${newUser.phone}",
       projectName: "${projectName}",
       responsibility: "${newUser.responsability}",
       role: "${newUser.role}"
     ) {
       success
       grantedUser {
         email
         role
         responsability
         phoneNumber
         organization
         firstLogin
         lastLogin
       }
     }
   }`;
   new Xhr().request(gQry, "An error occurred adding user to project")
   .then((response: AxiosResponse) => {
     const { data } = response.data;

     if (data.grantUserAccess.success) {
       msgSuccess(
         `${newUser.email}${translate.t("search_findings.tab_users.success")}`,
         translate.t("search_findings.tab_users.title_success"),
       );
       dispatch(reset("addUser"));
       dispatch(closeUsersMdl());
       dispatch({
         payload: { newUser: formatUserlist([data.grantUserAccess.grantedUser])[0] },
         type: actionType.ADD_USER,
       });
     } else {
       msgError(translate.t("proj_alerts.error_textsad"));
     }
   })
   .catch((error: AxiosError) => {
     if (error.response !== undefined) {
       const { errors } = error.response.data;

       msgError(translate.t("proj_alerts.error_textsad"));
       rollbar.error(error.message, errors);
     }
   });
};

export const loadVulnerabilities: ThunkActionStructure =
  (findingId: string): ThunkAction<void, {}, {}, Action> =>
    (dispatch: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `{
      finding(identifier: "${findingId}") {
        id
        success
        errorMessage
        portsVulns: vulnerabilities(
          vulnType: "ports") {
          ...vulnInfo
        }
        linesVulns: vulnerabilities(
          vulnType: "lines") {
          ...vulnInfo
        }
        inputsVulns: vulnerabilities(
          vulnType: "inputs") {
          ...vulnInfo
        }
      }
    }
    fragment vulnInfo on Vulnerability {
      vulnType
      where
      specific
      currentState
      id
      findingId
    }`;
    new Xhr().request(gQry, "An error occurred getting vulnerabilities")
    .then((response: AxiosResponse) => {
      const { data } = response.data;

      if (data.finding.success) {
        dispatch({
          payload: {
            dataInputs: data.finding.inputsVulns,
            dataLines: data.finding.linesVulns,
            dataPorts: data.finding.portsVulns,
          },
          type: actionType.LOAD_VULNERABILITIES,
        });
      } else if (data.finding.errorMessage === "Error in file") {
        msgError(translate.t("search_findings.tab_description.errorFileVuln"));
      }
    })
    .catch((error: AxiosError) => {
      if (error.response !== undefined) {
        const { errors } = error.response.data;

        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error(error.message, errors);
      }
    });
};

export const deleteVulnerability: ThunkActionStructure =
  (vulnInfo: { [key: string]: string }): ThunkAction<void, {}, {}, Action> =>
    (_: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `mutation {
      deleteVulnerability(id: "${vulnInfo.id}", findingId: "${vulnInfo.findingId}"){
        success
      }
    }`;
    new Xhr().request(gQry, "An error occurred getting vulnerabilities")
    .then((response: AxiosResponse) => {
      const { data } = response.data;

      if (data.deleteVulnerability.success) {
        msgSuccess(
          translate.t("search_findings.tab_description.vulnDeleted"),
          translate.t("proj_alerts.title_success"));
        location.reload();
      } else {
        msgError(translate.t("proj_alerts.error_textsad"));
      }
    })
    .catch((error: AxiosError) => {
      if (error.response !== undefined) {
        const { errors } = error.response.data;

        msgError(translate.t("proj_alerts.error_textsad"));
        rollbar.error(error.message, errors);
      }
    });
};

export const editUser: ThunkActionStructure =
 (
   modifiedUser: IUserData,
   projectName: IProjectUsersViewProps["projectName"],
 ): ThunkAction<void, {}, {}, Action> => (dispatch: ThunkDispatcher): void => {
   let gQry: string;
   gQry = `mutation {
     editUser(
       projectName: "${projectName}",
       email: "${modifiedUser.email}",
       organization: "${modifiedUser.organization}",
       phoneNumber: "${modifiedUser.phone}",
       responsibility: "${modifiedUser.responsability}",
       role: "${modifiedUser.role}"
     ) {
       success
     }
   }`;
   new Xhr().request(gQry, "An error occurred editing user information")
   .then((response: AxiosResponse) => {
     const { data } = response.data;

     if (data.editUser.success) {
       msgSuccess(
         translate.t("search_findings.tab_users.success_admin"),
         translate.t("search_findings.tab_users.title_success"),
       );
       dispatch(reset("addUser"));
       dispatch(closeUsersMdl());
       location.reload();
     } else {
       msgError(translate.t("proj_alerts.error_textsad"));
     }
   })
   .catch((error: AxiosError) => {
     if (error.response !== undefined) {
       const { errors } = error.response.data;

       msgError(translate.t("proj_alerts.error_textsad"));
       rollbar.error(error.message, errors);
     }
   });
};

export const loadRecords: ThunkActionStructure =
(
  findingId: IRecordsViewProps["findingId"],
): ThunkAction<void, {}, {}, Action> => (dispatch: ThunkDispatcher): void => {
  let gQry: string;
  gQry = `{
    finding(identifier: "${findingId}") {
      records
    }
  }`;
  new Xhr().request(gQry, "An error occurred getting compromised records")
  .then((response: AxiosResponse) => {
    const { data } = response.data;
    dispatch({
      payload: { records: JSON.parse(data.finding.records) },
      type: actionType.LOAD_RECORDS,
    });
  })
  .catch((error: AxiosError) => {
    if (error.response !== undefined) {
      const { errors } = error.response.data;

      msgError("There was an error :(");
      rollbar.error(error.message, errors);
    }
  });
};

export const editRecords: DashboardAction =
  (): IActionStructure => ({
    payload: undefined,
    type: actionType.EDIT_RECORDS,
});
