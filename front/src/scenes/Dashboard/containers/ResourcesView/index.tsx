/* tslint:disable:jsx-no-multiline-js
 *
 * NO-MULTILINE-JS: Disabling this rule is necessary for the sake of
  * readability of the code that defines the headers of the table
 */
import _ from "lodash";
import mixpanel from "mixpanel-browser";
import React from "react";
import { Mutation, MutationFn, MutationResult, Query, QueryResult } from "react-apollo";
import { Col, Glyphicon, Row } from "react-bootstrap";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { InferableComponentEnhancer, lifecycle } from "recompose";
import { Button } from "../../../../components/Button/index";
import { dataTable as DataTable } from "../../../../components/DataTable/index";
import { hidePreloader, showPreloader } from "../../../../utils/apollo";
import { handleGraphQLErrors } from "../../../../utils/formatHelpers";
import { msgError } from "../../../../utils/notifications";
import rollbar from "../../../../utils/rollbar";
import translate from "../../../../utils/translations/translate";
import { isValidFileName, isValidFileSize } from "../../../../utils/validations";
import { addEnvironmentsModal as AddEnvironmentsModal } from "../../components/AddEnvironmentsModal/index";
import { addRepositoriesModal as AddRepositoriesModal } from "../../components/AddRepositoriesModal/index";
import { addResourcesModal as AddResourcesModal } from "../../components/AddResourcesModal/index";
import { addTagsModal as AddTagsModal } from "../../components/AddTagsModal/index";
import { fileOptionsModal as FileOptionsModal } from "../../components/FileOptionsModal/index";
import { IDashboardState } from "../../reducer";
import * as actions from "./actions";
import { ADD_TAGS_MUTATION, GET_TAGS, REMOVE_TAG_MUTATION } from "./queries";
import { IAddTagsAttr, IProjectTagsAttr, IRemoveTagsAttr, IResourcesViewBaseProps,
  IResourcesViewDispatchProps, IResourcesViewProps, IResourcesViewStateProps } from "./types";

const enhance: InferableComponentEnhancer<{}> = lifecycle<IResourcesViewProps, {}>({
  componentDidMount(): void {
    mixpanel.track(
      "ProjectResources",
      {
        Organization: (window as Window & { userOrganization: string }).userOrganization,
        User: (window as Window & { userName: string }).userName,
      });
    this.props.onLoad();
  },
});

const getSelectedRow: ((tableId: string) => HTMLTableRowElement | undefined) =
  (tableId: string): HTMLTableRowElement | undefined => {
    const selectedQry: NodeListOf<Element> = document.querySelectorAll(`#${tableId} tr input:checked`);
    const selectedRow: HTMLTableRowElement | null | undefined =
      _.isEmpty(selectedQry) ? undefined : selectedQry[0].closest("tr");

    return selectedRow === undefined || selectedRow === null ? undefined : selectedRow;
  };

const handleRemoveRepo: ((props: IResourcesViewProps) => void) = (props: IResourcesViewProps): void => {
  const selectedRow: HTMLTableRowElement | undefined = getSelectedRow("tblRepositories");
  if (selectedRow === undefined) {
    msgError(translate.t("search_findings.tab_resources.no_selection"));
  } else {
    const repository: string | null = selectedRow.children[1].textContent;
    const branch: string | null = selectedRow.children[2].textContent;
    mixpanel.track(
      "RemoveProjectRepo",
      {
        Organization: (window as Window & { userOrganization: string }).userOrganization,
        User: (window as Window & { userName: string }).userName,
      });

    props.onRemoveRepo(String(repository), String(branch));
  }
};

const handleSaveRepos: ((resources: IResourcesViewProps["repositories"], props: IResourcesViewProps) => void) =
  (resources: IResourcesViewProps["repositories"], props: IResourcesViewProps): void => {
    let containsRepeated: boolean;
    containsRepeated = resources.filter(
      (newItem: IResourcesViewProps["repositories"][0]) => _.findIndex(
        props.repositories,
        (currentItem: IResourcesViewProps["repositories"][0]) =>
          currentItem.urlRepo === newItem.urlRepo && currentItem.branch === newItem.branch,
      ) > -1).length > 0;
    if (containsRepeated) {
      msgError(translate.t("search_findings.tab_resources.repeated_item"));
    } else {
      mixpanel.track(
        "AddProjectRepo",
        {
          Organization: (window as Window & { userOrganization: string }).userOrganization,
          User: (window as Window & { userName: string }).userName,
        });
      props.onSaveRepos(resources);
    }
  };

const handleRemoveEnv: ((props: IResourcesViewProps) => void) = (props: IResourcesViewProps): void => {
  const selectedRow: HTMLTableRowElement | undefined = getSelectedRow("tblEnvironments");
  if (selectedRow === undefined) {
    msgError(translate.t("search_findings.tab_resources.no_selection"));
  } else {
    mixpanel.track(
      "RemoveProjectEnv",
      {
        Organization: (window as Window & { userOrganization: string }).userOrganization,
        User: (window as Window & { userName: string }).userName,
      });
    const env: string | null = selectedRow.children[1].textContent;
    props.onRemoveEnv(String(env));
  }
};

const handleSaveEnvs: ((resources: IResourcesViewProps["environments"], props: IResourcesViewProps) => void) =
  (resources: IResourcesViewProps["environments"], props: IResourcesViewProps): void => {
    let containsRepeated: boolean;
    containsRepeated = resources.filter(
      (newItem: IResourcesViewProps["environments"][0]) => _.findIndex(
        props.environments,
        (currentItem: IResourcesViewProps["environments"][0]) =>
          currentItem.urlEnv === newItem.urlEnv,
      ) > -1).length > 0;
    if (containsRepeated) {
      msgError(translate.t("search_findings.tab_resources.repeated_item"));
    } else {
      mixpanel.track(
        "AddProjectEnv",
        {
          Organization: (window as Window & { userOrganization: string }).userOrganization,
          User: (window as Window & { userName: string }).userName,
        });
      props.onSaveEnvs(resources);
    }
  };

const handleSaveFiles: ((files: IResourcesViewProps["files"], props: IResourcesViewProps) => void) =
  (files: IResourcesViewProps["files"], props: IResourcesViewProps): void => {
    const selected: FileList | null = (document.querySelector("#file") as HTMLInputElement).files;
    if (_.isNil(selected) || selected.length === 0) {
      msgError(translate.t("proj_alerts.no_file_selected"));
      throw new Error();
    } else {
      files[0].fileName = selected[0].name;
    }
    let fileSize: number; fileSize = 100;
    if (isValidFileName(files[0].fileName)) {
      if (isValidFileSize(selected[0], fileSize)) {
        mixpanel.track(
          "AddProjectFiles",
          {
            Organization: (window as Window & { userOrganization: string }).userOrganization,
            User: (window as Window & { userName: string }).userName,
          });
        let containsRepeated: boolean;
        containsRepeated = files.filter(
          (newItem: IResourcesViewProps["files"][0]) => _.findIndex(
            props.files,
            (currentItem: IResourcesViewProps["files"][0]) =>
              currentItem.fileName === newItem.fileName,
          ) > -1).length > 0;
        if (containsRepeated) {
          msgError(translate.t("search_findings.tab_resources.repeated_item"));
        } else {
          props.onSaveFiles(files);
        }
      }
    } else {
      msgError(translate.t("search_findings.tab_resources.invalid_chars"));
    }
  };

const containsRepeatedTags: (
  (currTags: IProjectTagsAttr["project"]["tags"], tags: IProjectTagsAttr["project"]["tags"]) => boolean) =
  (currTags: IProjectTagsAttr["project"]["tags"], tags: IProjectTagsAttr["project"]["tags"]): boolean => {
    let containsRepeated: boolean;
    containsRepeated = currTags.filter(
      (newItem: IProjectTagsAttr["project"]["tags"][0]) => _.findIndex(
        tags,
        (currentItem: IProjectTagsAttr["project"]["tags"][0]) =>
          currentItem === newItem,
      ) > -1).length > 0;

    return containsRepeated;
  };

const renderTagsView: ((props: IResourcesViewProps) => JSX.Element) = (props: IResourcesViewProps): JSX.Element => {
  const handleOpenTagsModal: (() => void) = (): void => { props.onOpenTagsModal(); };
  const handleCloseTagsModal: (() => void) = (): void => { props.onCloseTagsModal(); };
  const projectName: string = props.match.params.projectName;

  return (
    <Query query={GET_TAGS} variables={{ projectName }}>
      {
        ({loading, error, data, refetch, networkStatus}: QueryResult<IProjectTagsAttr>): React.ReactNode => {
          if (loading || networkStatus === 4) {
            showPreloader();

            return <React.Fragment/>;
          }
          if (!_.isUndefined(error)) {
            hidePreloader();
            handleGraphQLErrors("An error occurred getting tags", error);

            return <React.Fragment/>;
          }
          if (!_.isUndefined(data) && !_.isEmpty(data.project.subscription) && _.isEmpty(data.project.deletionDate)) {
            mixpanel.track(
              "ProjectTags",
              {
                Organization: (window as Window & { userOrganization: string }).userOrganization,
                User: (window as Window & { userName: string }).userName,
              });
            hidePreloader();
            const tagsDataset: Array<{ tagName: string }> = data.project.tags.map(
              (tagName: string) => ({ tagName }));

            const handleMtRemoveTagRes: ((mtResult: IRemoveTagsAttr) => void) = (mtResult: IRemoveTagsAttr): void => {
              if (!_.isUndefined(mtResult)) {
                if (mtResult.removeTag.success) {
                  hidePreloader();
                  refetch()
                      .catch();
                  mixpanel.track(
                    "RemoveProjectTags",
                    {
                      Organization: (window as Window & { userOrganization: string }).userOrganization,
                      User: (window as Window & { userName: string }).userName,
                    });
                }
              }
            };

            const handleMtAddTagRes: ((mtResult: IAddTagsAttr) => void) = (mtResult: IAddTagsAttr): void => {
              if (!_.isUndefined(mtResult)) {
                if (mtResult.addTags.success) {
                  refetch()
                    .catch();
                  handleCloseTagsModal();
                  hidePreloader();
                  mixpanel.track(
                    "AddProjectTags",
                    {
                      Organization: (window as Window & { userOrganization: string }).userOrganization,
                      User: (window as Window & { userName: string }).userName,
                    });
                }
              }
            };

            return (
              <React.Fragment>
                <hr/>
                <Row>
                  <Col md={12} sm={12}>
                    <DataTable
                      dataset={tagsDataset}
                      enableRowSelection={true}
                      exportCsv={false}
                      search={false}
                      headers={[
                        {
                          dataField: "tagName",
                          header: translate.t("search_findings.tab_resources.tags_title"),
                          isDate: false,
                          isStatus: false,
                        },
                      ]}
                      id="tblTags"
                      pageSize={15}
                      title={translate.t("search_findings.tab_resources.tags_title")}
                    />
                  </Col>
                  <Col md={12}>
                    <br />
                    <Col mdOffset={4} md={2} sm={6}>
                      <Button id="addTag" block={true} bsStyle="primary" onClick={handleOpenTagsModal}>
                        <Glyphicon glyph="plus" />&nbsp;
                        {translate.t("search_findings.tab_resources.add_repository")}
                      </Button>
                    </Col>
                    <Mutation mutation={REMOVE_TAG_MUTATION} onCompleted={handleMtRemoveTagRes}>
                      { (removeTag: MutationFn<IRemoveTagsAttr, {projectName: string; tagToRemove: string}>,
                         mutationRes: MutationResult): React.ReactNode => {
                          if (mutationRes.loading) {
                            showPreloader();
                          }
                          if (!_.isUndefined(mutationRes.error)) {
                            hidePreloader();
                            handleGraphQLErrors("An error occurred removing tags", mutationRes.error);

                            return <React.Fragment/>;
                          }

                          const handleRemoveTag: (() => void) = (): void => {
                            const selectedQry: NodeListOf<Element> = document.querySelectorAll(
                              "#tblTags tr input:checked");
                            if (selectedQry.length > 0) {
                              if (selectedQry[0].closest("tr") !== null) {
                                const selectedRow: Element = selectedQry[0].closest("tr") as Element;
                                const tag: string | null = selectedRow.children[1].textContent;
                                removeTag({
                                  variables: { projectName: props.match.params.projectName, tagToRemove: String(tag)},
                                })
                                  .catch();
                              } else {
                                msgError(translate.t("proj_alerts.error_textsad"));
                                rollbar.error("An error occurred removing tags");
                              }
                            } else {
                              msgError(translate.t("search_findings.tab_resources.no_selection"));
                            }
                          };

                          return (
                            <Col md={2} sm={6}>
                              <Button
                                id="removeTag"
                                block={true}
                                bsStyle="primary"
                                onClick={handleRemoveTag}
                              >
                                <Glyphicon glyph="minus" />&nbsp;
                                {translate.t("search_findings.tab_resources.remove_repository")}
                              </Button>
                            </Col>
                          );
                      }}
                    </Mutation>
                  </Col>
                  <Col md={12}>
                    <br />
                    <label style={{fontSize: "15px"}}>
                      <b>{translate.t("search_findings.tab_resources.total_tags")}</b>
                      {tagsDataset.length}
                    </label>
                  </Col>
                </Row>
                <Mutation mutation={ADD_TAGS_MUTATION} onCompleted={handleMtAddTagRes}>
                  { (addTags: MutationFn<IAddTagsAttr, {projectName: string; tagsData: string}>,
                     mutationRes: MutationResult): React.ReactNode => {
                      if (mutationRes.loading) {
                        showPreloader();
                      }
                      if (!_.isUndefined(mutationRes.error)) {
                        hidePreloader();
                        handleGraphQLErrors("An error occurred adding tags", mutationRes.error);

                        return <React.Fragment/>;
                      }

                      const handleSubmitTag: ((values: { tags: string[] }) => void) =
                        (values: { tags: string[] }): void => {
                          if (containsRepeatedTags(values.tags, data.project.tags)) {
                            msgError(translate.t("search_findings.tab_resources.repeated_item"));
                          } else {
                            addTags({
                              variables: { projectName: props.match.params.projectName,
                                           tagsData: JSON.stringify(values.tags)},
                              },
                            )
                              .catch();
                          }
                        };

                      return (
                        <AddTagsModal
                          isOpen={props.tagsModal.open}
                          onClose={handleCloseTagsModal}
                          onSubmit={handleSubmitTag}
                        />
                      );
                  }}
                </Mutation>
              </React.Fragment>
            );
          }
        }}
    </Query>
  );
};

const projectResourcesView: React.FunctionComponent<IResourcesViewProps> =
  (props: IResourcesViewProps): JSX.Element => {

    const handleRemoveRepoClick: (() => void) = (): void => { handleRemoveRepo(props); };
    const handleRemoveEnvClick: (() => void) = (): void => { handleRemoveEnv(props); };
    const handleAddRepoClick: (() => void) = (): void => { props.onOpenReposModal(); };
    const handleAddEnvClick: (() => void) = (): void => { props.onOpenEnvsModal(); };
    const handleAddFileClick: (() => void) = (): void => { props.onOpenAddModal("file"); };
    const handleCloseEnvModalClick: (() => void) = (): void => { props.onCloseEnvsModal(); };
    const handleCloseReposModalClick: (() => void) = (): void => { props.onCloseReposModal(); };
    const handleCloseAddModalClick: (() => void) = (): void => { props.onCloseAddModal(); };
    const handleCloseOptionsModalClick: (() => void) = (): void => { props.onCloseOptionsModal(); };
    const handleDeleteFileClick: (() => void) = (): void => {
      mixpanel.track(
        "RemoveProjectFiles",
        {
          Organization: (window as Window & { userOrganization: string }).userOrganization,
          User: (window as Window & { userName: string }).userName,
        });
      props.onDeleteFile(props.optionsModal.rowInfo.fileName);
    };
    const handleDownloadFileClick: (() => void) = (): void => {
      props.onDownloadFile(props.optionsModal.rowInfo.fileName);
    };
    const handleFileRowClick: ((row: string) => void) = (row: string): void => { props.onOpenOptionsModal(row); };

    const handleAddEnv: ((values: { resources: IResourcesViewProps["environments"] }) => void) =
      (values: { resources: IResourcesViewProps["environments"] }): void => {
        handleSaveEnvs(values.resources, props);
      };

    const handleAddRepo: ((values: { resources: IResourcesViewProps["repositories"] }) => void) =
      (values: { resources: IResourcesViewProps["repositories"] }): void => {
        handleSaveRepos(values.resources, props);
      };

    const handleAddFile: ((values: { resources: IResourcesViewProps["files"] }) => void) =
      (values: { resources: IResourcesViewProps["files"] }): void => {
        handleSaveFiles(values.resources, props);
      };

    const userEmail: string = (window as Window & { userEmail: string }).userEmail;
    const shouldDisplayTagsView: boolean =
      (_.endsWith(userEmail, "@fluidattacks.com") || _.endsWith(userEmail, "@bancolombia.com.co"));

    return (
  <React.StrictMode>
    <div id="resources" className="tab-pane cont active">
      <Row>
        <Col md={12} sm={12} xs={12}>
          <Row>
            <Col md={12} sm={12} xs={12}>
              <Row>
                <Col md={12} sm={12}>
                  <DataTable
                    dataset={props.repositories}
                    enableRowSelection={true}
                    exportCsv={true}
                    search={true}
                    headers={[
                      {
                        dataField: "urlRepo",
                        header: translate.t("search_findings.repositories_table.repository"),
                        isDate: false,
                        isStatus: false,
                        width: "70%",
                        wrapped: true,
                      },
                      {
                        dataField: "branch",
                        header: translate.t("search_findings.repositories_table.branch"),
                        isDate: false,
                        isStatus: false,
                        width: "30%",
                        wrapped: true,
                      },
                    ]}
                    id="tblRepositories"
                    pageSize={15}
                    title={translate.t("search_findings.tab_resources.repositories_title")}
                  />
                </Col>
                <Col md={12}>
                  <br />
                  <Col mdOffset={4} md={2} sm={6}>
                    <Button
                      id="addRepository"
                      block={true}
                      bsStyle="primary"
                      onClick={handleAddRepoClick}
                    >
                      <Glyphicon glyph="plus"/>&nbsp;
                      {translate.t("search_findings.tab_resources.add_repository")}
                    </Button>
                  </Col>
                  <Col md={2} sm={6}>
                    <Button
                      id="removeRepository"
                      block={true}
                      bsStyle="primary"
                      onClick={handleRemoveRepoClick}
                    >
                      <Glyphicon glyph="minus"/>&nbsp;
                      {translate.t("search_findings.tab_resources.remove_repository")}
                    </Button>
                  </Col>
                </Col>
                <Col md={12}>
                  <br />
                  <label style={{fontSize: "15px"}}>
                    <b>{translate.t("search_findings.tab_resources.total_repos")}</b>
                    {props.repositories.length}
                  </label>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
      <hr/>
      <Row>
        <Col md={12} sm={12} xs={12}>
          <Row>
            <Col md={12} sm={12} xs={12}>
              <Row>
                <Col md={12} sm={12}>
                  <DataTable
                    dataset={props.environments}
                    enableRowSelection={true}
                    exportCsv={true}
                    search={true}
                    headers={[
                      {
                        dataField: "urlEnv",
                        header: translate.t("search_findings.environment_table.environment"),
                        isDate: false,
                        isStatus: false,
                        wrapped: true,
                      },
                    ]}
                    id="tblEnvironments"
                    pageSize={15}
                    title={translate.t("search_findings.tab_resources.environments_title")}
                  />
                </Col>
                <Col md={12}>
                  <br />
                  <Col mdOffset={4} md={2} sm={6}>
                    <Button
                      id="addEnvironment"
                      block={true}
                      bsStyle="primary"
                      onClick={handleAddEnvClick}
                    >
                      <Glyphicon glyph="plus"/>&nbsp;
                      {translate.t("search_findings.tab_resources.add_repository")}
                    </Button>
                  </Col>
                  <Col md={2} sm={6}>
                    <Button
                      id="removeEnvironment"
                      block={true}
                      bsStyle="primary"
                      onClick={handleRemoveEnvClick}
                    >
                      <Glyphicon glyph="minus"/>&nbsp;
                      {translate.t("search_findings.tab_resources.remove_repository")}
                    </Button>
                  </Col>
                </Col>
                <Col md={12}>
                  <br />
                  <label style={{fontSize: "15px"}}>
                    <b>{translate.t("search_findings.tab_resources.total_envs")}</b>
                    {props.environments.length}
                  </label>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
      <hr/>
        <Row>
          <Col md={12} sm={12} xs={12}>
            <Row>
              <Col md={12} sm={12} xs={12}>
                <Row>
                  <Col md={12} sm={12}>
                    <DataTable
                      dataset={props.files}
                      onClickRow={handleFileRowClick}
                      enableRowSelection={false}
                      exportCsv={false}
                      search={true}
                      headers={[
                        {
                          dataField: "fileName",
                          header: translate.t("search_findings.files_table.file"),
                          isDate: false,
                          isStatus: false,
                          width: "25%",
                          wrapped: true,
                        },
                        {
                          dataField: "description",
                          header: translate.t("search_findings.files_table.description"),
                          isDate: false,
                          isStatus: false,
                          width: "50%",
                          wrapped: true,
                        },
                        {
                          dataField: "uploadDate",
                          header: translate.t("search_findings.files_table.upload_date"),
                          isDate: false,
                          isStatus: false,
                          width: "25%",
                          wrapped: true,
                        },
                      ]}
                      id="tblFiles"
                      pageSize={15}
                      title={translate.t("search_findings.tab_resources.files_title")}
                    />
                  </Col>
                  <Col md={12}>
                    <br />
                    <Col mdOffset={5} md={2} sm={6}>
                      <Button
                        id="addFile"
                        block={true}
                        bsStyle="primary"
                        onClick={handleAddFileClick}
                      >
                        <Glyphicon glyph="plus"/>&nbsp;
                        {translate.t("search_findings.tab_resources.add_repository")}
                      </Button>
                    </Col>
                  </Col>
                  <Col md={12}>
                    <br />
                    <label style={{fontSize: "15px"}}>
                      <b>{translate.t("search_findings.tab_resources.total_files")}</b>
                      {props.files.length}
                    </label>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        {shouldDisplayTagsView ? renderTagsView(props) : undefined}
      <AddEnvironmentsModal
        isOpen={props.envModal.open}
        onClose={handleCloseEnvModalClick}
        onSubmit={handleAddEnv}
      />
      <AddRepositoriesModal
        isOpen={props.reposModal.open}
        onClose={handleCloseReposModalClick}
        onSubmit={handleAddRepo}
      />
      <AddResourcesModal
        isOpen={props.addModal.open}
        type={props.addModal.type}
        onClose={handleCloseAddModalClick}
        onSubmit={handleAddFile}
        showUploadProgress={props.showUploadProgress}
        uploadProgress={props.uploadProgress}
      />
      <FileOptionsModal
        fileName={props.optionsModal.rowInfo.fileName}
        isOpen={props.optionsModal.open}
        onClose={handleCloseOptionsModalClick}
        onSubmit={handleAddFile}
        onDelete={handleDeleteFileClick}
        onDownload={handleDownloadFileClick}
      />
    </div>
  </React.StrictMode>
); };

interface IState { dashboard: IDashboardState; }
const mapStateToProps: MapStateToProps<IResourcesViewStateProps, IResourcesViewBaseProps, IState> =
  (state: IState): IResourcesViewStateProps => ({
    addModal: state.dashboard.resources.addModal,
    envModal: state.dashboard.resources.envModal,
    environments: state.dashboard.resources.environments,
    files: state.dashboard.resources.files,
    optionsModal: state.dashboard.resources.optionsModal,
    reposModal: state.dashboard.resources.reposModal,
    repositories: state.dashboard.resources.repositories,
    showUploadProgress: state.dashboard.resources.showUploadProgress,
    tagsModal: state.dashboard.tags.tagsModal,
    uploadProgress: state.dashboard.resources.uploadProgress,
  });

const mapDispatchToProps: MapDispatchToProps<IResourcesViewDispatchProps, IResourcesViewBaseProps> =
  (dispatch: actions.ThunkDispatcher, ownProps: IResourcesViewBaseProps): IResourcesViewDispatchProps => {
    const { projectName } = ownProps.match.params;

    return ({
      onCloseAddModal: (): void => { dispatch(actions.closeAddModal()); },
      onCloseEnvsModal: (): void => { dispatch(actions.closeAddEnvModal()); },
      onCloseOptionsModal: (): void => { dispatch(actions.closeOptionsModal()); },
      onCloseReposModal: (): void => { dispatch(actions.closeAddRepoModal()); },
      onCloseTagsModal: (): void => { dispatch(actions.closeTagsModal()); },
      onDeleteFile: (fileName: string): void => { dispatch(actions.deleteFile(projectName, fileName)); },
      onDownloadFile: (fileName: string): void => { dispatch(actions.downloadFile(projectName, fileName)); },
      onLoad: (): void => {
        dispatch(actions.loadResources(projectName));
      },
      onOpenAddModal: (type: IResourcesViewStateProps["addModal"]["type"]): void => {
        dispatch(actions.openAddModal(type));
      },
      onOpenEnvsModal: (): void => { dispatch(actions.openAddEnvModal()); },
      onOpenOptionsModal: (row: string): void => { dispatch(actions.openOptionsModal(row)); },
      onOpenReposModal: (): void => { dispatch(actions.openAddRepoModal()); },
      onOpenTagsModal: (): void => { dispatch(actions.openTagsModal()); },
      onRemoveEnv: (environment: string): void => { dispatch(actions.removeEnv(projectName, environment)); },
      onRemoveRepo: (repository: string, branch: string): void => {
        dispatch(actions.removeRepo(projectName, repository, branch));
      },
      onSaveEnvs: (environments: IResourcesViewProps["environments"]): void => {
        dispatch(actions.saveEnvs(projectName, environments));
      },
      onSaveFiles: (files: IResourcesViewProps["files"]): void => { dispatch(actions.saveFiles(projectName, files)); },
      onSaveRepos: (repositories: IResourcesViewProps["repositories"]): void => {
        dispatch(actions.saveRepos(projectName, repositories));
      },
    });
  };

export = connect(mapStateToProps, mapDispatchToProps)(enhance(projectResourcesView));
