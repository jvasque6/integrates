import { AxiosError, AxiosResponse } from "axios";
import { Action, AnyAction, Dispatch } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { msgError, msgSuccess } from "../../../../utils/notifications";
import rollbar from "../../../../utils/rollbar";
import translate from "../../../../utils/translations/translate";
import Xhr from "../../../../utils/xhr";
import { IDashboardState } from "../../reducer";
import * as actionTypes from "./actionTypes";

type IResourcesViewProps = IDashboardState["resources"];

export interface IActionStructure {
  /* tslint:disable-next-line:no-any
   * Disabling this rule is necessary because the payload
   * type may differ between actions
   */
  payload: any;
  type: string;
}

type ThunkDispatcher = Dispatch<Action> & ThunkDispatch<{}, {}, AnyAction>;
/* tslint:disable-next-line:no-any
 * Disabling this rule is necessary because the args
 * of an async action may differ
 */
type ThunkActionStructure = ((...args: any[]) => ThunkAction<void, {}, {}, AnyAction>);

export const clearResources: (() => IActionStructure) =
  (): IActionStructure => ({
    payload: undefined,
    type: actionTypes.CLEAR_RESOURCES,
  });

export const loadResources: ThunkActionStructure =
  (projectName: string): ThunkAction<void, {}, {}, Action> =>
    (dispatch: ThunkDispatcher): void => {
      dispatch(clearResources());
      let gQry: string;
      gQry = `{
        resources (projectName: "${projectName}") {
          environments
          repositories
          files
        }
    }`;
      new Xhr().request(gQry, "An error occurred getting repositories")
        .then((response: AxiosResponse) => {
          const { data } = response.data;
          dispatch({
            payload: {
              environments: JSON.parse(data.resources.environments),
              files: JSON.parse(data.resources.files),
              repositories: JSON.parse(data.resources.repositories),
            },
            type: actionTypes.LOAD_RESOURCES,
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

export const openAddModal: ((type: "repository" | "environment" | "file") => IActionStructure) =
  (type: "repository" | "environment" | "file"): IActionStructure => ({
    payload: { type },
    type: actionTypes.OPEN_ADD_MODAL,
  });

export const closeAddModal: (() => IActionStructure) =
  (): IActionStructure => ({
    payload: undefined,
    type: actionTypes.CLOSE_ADD_MODAL,
  });

export const openOptionsModal: ((rowInfo: string | undefined) => IActionStructure) =
  (rowInfo: string | undefined): IActionStructure => ({
    payload: {rowInfo},
    type: actionTypes.OPEN_OPTIONS_MODAL,
  });

export const closeOptionsModal: (() => IActionStructure) =
  (): IActionStructure => ({
    payload: undefined,
    type: actionTypes.CLOSE_OPTIONS_MODAL,
  });

export const saveRepos: ThunkActionStructure =
  (projectName: string, reposData: IResourcesViewProps["repositories"],
  ): ThunkAction<void, {}, {}, Action> => (dispatch: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `mutation {
        addRepositories (
          resourcesData: ${JSON.stringify(JSON.stringify(reposData))},
          projectName: "${projectName}") {
          success
          resources {
            environments
            files
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
              files: JSON.parse(data.addRepositories.resources.files),
              repositories: JSON.parse(data.addRepositories.resources.repositories),
            },
            type: actionTypes.LOAD_RESOURCES,
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
          files
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
                files: JSON.parse(data.removeRepositories.resources.files),
                repositories: JSON.parse(data.removeRepositories.resources.repositories),
              },
              type: actionTypes.LOAD_RESOURCES,
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

export const saveEnvs: ThunkActionStructure =
  (projectName: string,
   envsData: IResourcesViewProps["environments"]): ThunkAction<void, {}, {}, Action> =>
    (dispatch: ThunkDispatcher): void => {
      let gQry: string;
      gQry = `mutation {
          addEnvironments (
            resourcesData: ${JSON.stringify(JSON.stringify(envsData))},
            projectName: "${projectName}") {
            success
            resources {
              environments
              files
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
                files: JSON.parse(data.addEnvironments.resources.files),
                repositories: JSON.parse(data.addEnvironments.resources.repositories),
              },
              type: actionTypes.LOAD_RESOURCES,
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
          files
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
                files: JSON.parse(data.removeEnvironments.resources.files),
                repositories: JSON.parse(data.removeEnvironments.resources.repositories),
              },
              type: actionTypes.LOAD_RESOURCES,
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

export const saveFiles: ThunkActionStructure =
  (projectName: string,
   filesData: IResourcesViewProps["files"]): ThunkAction<void, {}, {}, Action> =>
    (dispatch: ThunkDispatcher): void => {
      let gQry: string;

      gQry = `mutation {
          addFiles (
            filesData: ${JSON.stringify(JSON.stringify(filesData))},
            projectName: "${projectName}") {
            success
            resources {
              environments
              files
              repositories
            }
          }
        }`;
      new Xhr().upload(gQry, "#file", "An error occurred adding file")
        .then((response: AxiosResponse) => {
          const { data } = response.data;
          if (data.addFiles.success) {
            dispatch(closeAddModal());
            dispatch({
              payload: {
                environments: JSON.parse(data.addFiles.resources.environments),
                files: JSON.parse(data.addFiles.resources.files),
                repositories: JSON.parse(data.addFiles.resources.repositories),
              },
              type: actionTypes.LOAD_RESOURCES,
            });
            msgSuccess(
              translate.t("search_findings.tab_resources.success"),
              translate.t("search_findings.tab_users.title_success"),
            );
          } else {
            msgError(translate.t("proj_alerts.error_textsad"));
            rollbar.error("An error occurred adding files");
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

export const deleteFile: ThunkActionStructure =
      (projectName: string, fileToRemove: string): ThunkAction<void, {}, {}, Action> =>
        (dispatch: ThunkDispatcher): void => {
          let gQry: string;
          gQry = `mutation {
          removeFiles (
            filesData: ${JSON.stringify(JSON.stringify({ fileName: fileToRemove }))},
            projectName: "${projectName}"
          ) {
            success
            resources {
              environments
              files
              repositories
            }
          }
        }`;
          new Xhr().request(gQry, "An error occurred deleting files")
            .then((response: AxiosResponse) => {
              const { data } = response.data;
              if (data.removeFiles.success) {
                dispatch(closeOptionsModal());
                dispatch({
                  payload: {
                    environments: JSON.parse(data.removeFiles.resources.environments),
                    files: JSON.parse(data.removeFiles.resources.files),
                    repositories: JSON.parse(data.removeFiles.resources.repositories),
                  },
                  type: actionTypes.LOAD_RESOURCES,
                });
                msgSuccess(
                  translate.t("search_findings.tab_resources.success_remove"),
                  translate.t("search_findings.tab_users.title_success"),
                );
              } else {
                msgError(translate.t("proj_alerts.error_textsad"));
                rollbar.error("An error occurred deleting files");
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

export const downloadFile: ThunkActionStructure =
      (projectName: string, fileToDownload: string):
      ThunkAction<void, {}, {}, Action> =>
        (dispatch: ThunkDispatcher): void => {
          let gQry: string;
          gQry = `mutation {
              downloadFile (
                filesData: ${JSON.stringify(JSON.stringify(fileToDownload))},
                projectName: "${projectName}") {
                success
                url
              }
            }`;
          new Xhr().request(gQry, "An error occurred downloading file")
            .then((response: AxiosResponse) => {
              const { data } = response.data;
              if (data.downloadFile.success) {
                dispatch(closeOptionsModal());
                window.open(data.downloadFile.url);
              } else {
                msgError(translate.t("proj_alerts.error_textsad"));
                rollbar.error("An error occurred downloading files");
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
