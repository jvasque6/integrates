/* tslint:disable jsx-no-lambda number-literal-format jsx-no-multiline-js
 * JSX-NO-LAMBDA: Disabling this rule is necessary for the sake of simplicity and
 * readability of the code that binds click events
 *
 * JSX-NO-MULTILINE-JS: necessary for the sake of readability of the code that dynamically renders fields
 * as input or <p> depending on their state
 */
import { NetworkStatus } from "apollo-boost";
import _ from "lodash";
import mixpanel from "mixpanel-browser";
import React from "react";
import { Mutation, MutationFn, MutationResult, Query, QueryResult } from "react-apollo";
import { Col, Row } from "react-bootstrap";
import { Reducer } from "redux";
import { formValueSelector, submit } from "redux-form";
import { StateType } from "typesafe-actions";
import { Button } from "../../../../components/Button/index";
import { FluidIcon } from "../../../../components/FluidIcon";
import store from "../../../../store/index";
import { hidePreloader, showPreloader } from "../../../../utils/apollo";
import { castEnvironmentCVSS3Fields, castFieldsCVSS3, castPrivileges,
  handleGraphQLErrors } from "../../../../utils/formatHelpers";
import { dropdownField } from "../../../../utils/forms/fields";
import { msgSuccess } from "../../../../utils/notifications";
import reduxWrapper from "../../../../utils/reduxWrapper";
import translate from "../../../../utils/translations/translate";
import { required } from "../../../../utils/validations";
import { EditableField } from "../../components/EditableField";
import { GenericForm } from "../../components/GenericForm/index";
import * as actions from "./actions";
import style from "./index.css";
import { GET_SEVERITY, UPDATE_SEVERITY_MUTATION } from "./queries";
import { ISeverityAttr, ISeverityField, ISeverityViewProps, IUpdateSeverityAttr } from "./types";

const renderEditPanel: ((arg1: ISeverityViewProps, data: ISeverityAttr) => JSX.Element) =
(props: ISeverityViewProps, data: ISeverityAttr): JSX.Element => (
  <Row>
    <Row>
      <Col md={2} mdOffset={10} xs={12} sm={12}>
        <Button
          bsStyle="primary"
          block={true}
          onClick={(): void => {
            store.dispatch(actions.editSeverity());
            store.dispatch(actions.calcCVSS(data.finding.severity, data.finding.cvssVersion));
          }}
        >
          <FluidIcon icon="edit" /> {translate.t("search_findings.tab_severity.editable")}
        </Button>
      </Col>
    </Row>
    <br />
    {props.isEditing
      ?
      <Row>
        <Col md={2} mdOffset={10} xs={12} sm={12}>
          <Button bsStyle="success" block={true} type="submit" onClick={(): void => { submit("editSeverity"); }}>
            <FluidIcon icon="loading" /> {translate.t("search_findings.tab_severity.update")}
          </Button>
        </Col>
      </Row>
      : undefined
    }
  </Row>
);

const renderCVSSFields: ((props: ISeverityViewProps, data: ISeverityAttr) => JSX.Element[]) =
  (props: ISeverityViewProps, data: ISeverityAttr): JSX.Element[] =>
  castFieldsCVSS3(data.finding.severity)
        .map((field: ISeverityField, index: number) => {
        const value: string = field.currentValue;
        const text: string = field.options[value];

        return (
          <Row className={style.row} key={index}>
            <EditableField
              alignField="horizontal"
              component={dropdownField}
              currentValue={`${value} | ${translate.t(text)}`}
              label={field.title}
              name={field.name}
              renderAsEditable={props.isEditing}
              validate={[required]}
            >
              <option value="" selected={true} />
              {Object.keys(field.options)
                .map((key: string) => (
                <option value={`${key}`}>
                  {translate.t(field.options[key])}
                </option>
              ))}
            </EditableField>
          </Row>
        );
      });

const renderEnvironmentFields: ((props: ISeverityViewProps, data: ISeverityAttr) => JSX.Element[]) =
  (props: ISeverityViewProps,  data: ISeverityAttr): JSX.Element[] =>
  castEnvironmentCVSS3Fields(data.finding.severity)
        .map((field: ISeverityField, index: number) => {
        const value: string = field.currentValue;
        const text: string = field.options[value];

        return (
          <Row className={style.row} key={index}>
            <EditableField
              alignField="horizontal"
              component={dropdownField}
              currentValue={`${value} | ${translate.t(text)}`}
              label={field.title}
              name={field.name}
              renderAsEditable={props.isEditing}
              validate={[required]}
              visible={props.isEditing}
            >
              <option value="" selected={true} />
              {Object.keys(field.options)
                .map((key: string) => (
                <option value={`${key}`}>
                  {translate.t(field.options[key])}
                </option>
              ))}
            </EditableField>
          </Row>
        );
      });

const renderSeverityFields: ((props: ISeverityViewProps, data: ISeverityAttr) => JSX.Element) =
(props: ISeverityViewProps, data: ISeverityAttr): JSX.Element => {
  const cvssVersion: string = (props.isEditing)
    ? props.formValues.editSeverity.values.cvssVersion
    : data.finding.cvssVersion;

  const severityScope: string = (props.isEditing)
    ? props.formValues.editSeverity.values.severityScope
    : data.finding.severity.severityScope;

  const modifiedSeverityScope: string = (props.isEditing)
    ? props.formValues.editSeverity.values.modifiedSeverityScope
    : data.finding.severity.modifiedSeverityScope;

  const privilegesOptions: {[value: string]: string} = castPrivileges(severityScope);
  const modPrivilegesOptions: {[value: string]: string} = castPrivileges(modifiedSeverityScope);

  const privileges: string = data.finding.severity.privilegesRequired;
  const modPrivileges: string = data.finding.severity.modifiedPrivilegesRequired;

  return (
    <React.Fragment>
      {props.canEdit ? renderEditPanel(props, data) : undefined}
      <Row className={style.row}>
        <EditableField
          alignField="horizontal"
          component={dropdownField}
          currentValue={data.finding.cvssVersion}
          label={translate.t("search_findings.tab_severity.cvss_version")}
          name="cvssVersion"
          renderAsEditable={props.isEditing}
          validate={[required]}
          visible={props.isEditing}
        >
          <option value="" selected={true} />
          <option value="3">3</option>
        </EditableField>
      </Row>
      {renderCVSSFields(props, data)}
      <Row className={style.row}>
        <EditableField
          alignField="horizontal"
          component={dropdownField}
          currentValue={`${privileges} | ${translate.t(privilegesOptions[privileges])}`}
          label={translate.t("search_findings.tab_severity.privileges_required")}
          name="privilegesRequired"
          renderAsEditable={props.isEditing}
          validate={[required]}
        >
          <option value="" selected={true} />
          {Object.keys(privilegesOptions)
            .map((key: string) => (
            <option value={`${key}`}>
              {translate.t(privilegesOptions[key])}
            </option>
          ))}
        </EditableField>
      </Row>
      { cvssVersion === "3" && props.isEditing
        ?
        <React.Fragment>
          {renderEnvironmentFields(props, data)}
          <Row className={style.row}>
            <EditableField
              alignField="horizontal"
              component={dropdownField}
              currentValue={`${modPrivileges} | ${translate.t(modPrivilegesOptions[modPrivileges])}`}
              label={translate.t("search_findings.tab_severity.modified_privileges_required")}
              name="modifiedPrivilegesRequired"
              renderAsEditable={props.isEditing}
              validate={[required]}
              visible={props.isEditing}
            >
              <option value="" selected={true} />
              {Object.keys(modPrivilegesOptions)
                .map((key: string) => (
                <option value={`${key}`}>
                  {translate.t(modPrivilegesOptions[key])}
                </option>
              ))}
            </EditableField>
          </Row>
        </React.Fragment>
        : undefined
      }
      <Row className={style.row}>
        <Col md={3} xs={12} sm={12} className={style.title}><label><b>CVSS v3 Temporal</b></label></Col>
        <Col md={9} xs={12} sm={12} className={style.desc}><p>{props.severity}</p></Col>
      </Row>
    </React.Fragment>
  );
};

const handleQryResult: ((qrResult: ISeverityAttr) => void) = (qrResult: ISeverityAttr): void => {
  mixpanel.track(
    "FindingSeverity",
    {
      Organization: (window as Window & { userOrganization: string }).userOrganization,
      User: (window as Window & { userName: string }).userName,
    });
  hidePreloader();
};

export const component: React.FC<ISeverityViewProps> =
  (props: ISeverityViewProps): JSX.Element => (
    <React.StrictMode>
      <Row>
        <Col md={12} sm={12} xs={12}>
          <Query
            query={GET_SEVERITY}
            variables={{ identifier: props.findingId }}
            notifyOnNetworkStatusChange={true}
            onCompleted={handleQryResult}
          >
          {
            ({loading, error, data, refetch, networkStatus}: QueryResult<ISeverityAttr>): React.ReactNode => {
              const isRefetching: boolean = networkStatus === NetworkStatus.refetch;
              if (loading || isRefetching) {
                showPreloader();

                return <React.Fragment/>;
              }
              if (!_.isUndefined(error)) {
                hidePreloader();
                handleGraphQLErrors("An error occurred getting severity", error);

                return <React.Fragment/>;
              }
              if (!_.isUndefined(data)) {

                const handleMtUpdateSeverityRes: ((mtResult: IUpdateSeverityAttr) => void) =
                (mtResult: IUpdateSeverityAttr): void => {
                  if (!_.isUndefined(mtResult)) {
                    if (mtResult.updateSeverity.success) {
                      refetch()
                        .catch();
                      hidePreloader();
                      msgSuccess(translate.t("proj_alerts.updated"), translate.t("proj_alerts.updated_title"));
                      store.dispatch(actions.calcCVSS(mtResult.updateSeverity.finding.severity,
                                                      mtResult.updateSeverity.finding.cvssVersion));
                      store.dispatch(actions.editSeverity());
                      mixpanel.track(
                        "UpdateSeverity",
                        {
                          Organization: (window as Window & { userOrganization: string }).userOrganization,
                          User: (window as Window & { userName: string }).userName,
                        });
                    }
                  }
                };

                return (
                  <Mutation mutation={UPDATE_SEVERITY_MUTATION} onCompleted={handleMtUpdateSeverityRes}>
                  { (updateSeverity: MutationFn<IUpdateSeverityAttr, {
                    data: { attackComplexity: string; attackVector: string; availabilityImpact: string;
                            availabilityRequirement: string; confidentialityImpact: string;
                            confidentialityRequirement: string; cvssVersion: string; exploitability: string; id: string;
                            integrityImpact: string; integrityRequirement: string; modifiedAttackComplexity: string;
                            modifiedAttackVector: string; modifiedAvailabilityImpact: string;
                            modifiedConfidentialityImpact: string; modifiedIntegrityImpact: string;
                            modifiedPrivilegesRequired: string; modifiedSeverityScope: string;
                            modifiedUserInteraction: string; privilegesRequired: string; remediationLevel: string;
                            reportConfidence: string; severity: string; severityScope: string; userInteraction: string;
                          };
                    findingId: string; }>,
                     mutationRes: MutationResult): React.ReactNode => {
                      if (mutationRes.loading) {
                        showPreloader();
                      }
                      if (!_.isUndefined(mutationRes.error)) {
                        hidePreloader();
                        handleGraphQLErrors("An error occurred updating severity", mutationRes.error);

                        return <React.Fragment/>;
                      }

                      const handleUpdateSeverity: (
                        (values: ISeverityAttr["finding"]["severity"] & { cvssVersion: string }) => void) =
                        (values: ISeverityAttr["finding"]["severity"] & { cvssVersion: string }): void => {
                          updateSeverity({
                            variables: {
                              data: {
                                attackComplexity: values.attackComplexity, attackVector: values.attackVector,
                                availabilityImpact: values.availabilityImpact,
                                availabilityRequirement: values.availabilityRequirement,
                                confidentialityImpact: values.confidentialityImpact,
                                confidentialityRequirement: values.confidentialityRequirement,
                                cvssVersion: values.cvssVersion, exploitability: values.exploitability,
                                id: props.findingId, integrityImpact: values.integrityImpact,
                                integrityRequirement: values.integrityRequirement,
                                modifiedAttackComplexity: values.modifiedAttackComplexity,
                                modifiedAttackVector: values.modifiedAttackVector,
                                modifiedAvailabilityImpact: values.modifiedAvailabilityImpact,
                                modifiedConfidentialityImpact: values.modifiedConfidentialityImpact,
                                modifiedIntegrityImpact: values.modifiedIntegrityImpact,
                                modifiedPrivilegesRequired: values.modifiedPrivilegesRequired,
                                modifiedSeverityScope: values.modifiedSeverityScope,
                                modifiedUserInteraction: values.modifiedUserInteraction,
                                privilegesRequired: values.privilegesRequired,
                                remediationLevel: values.remediationLevel, reportConfidence: values.reportConfidence,
                                severity: String(props.severity), severityScope: values.severityScope,
                                userInteraction: values.userInteraction,
                              },
                              findingId: props.findingId,
                              },
                            },
                          )
                            .catch();
                        };

                      return (
                        <GenericForm
                          name="editSeverity"
                          initialValues={{...data.finding.severity, ...{cvssVersion: data.finding.cvssVersion}}}
                          onSubmit={handleUpdateSeverity}
                          onChange={(values: ISeverityAttr["finding"]["severity"] & {cvssVersion: string}): void => {
                                store.dispatch(actions.calcCVSS(
                                  values as ISeverityAttr["finding"]["severity"], values.cvssVersion));
                              }}
                        >
                          {renderSeverityFields(props, data)}
                        </GenericForm>
                      );
                     }}
                  </Mutation>
                );
              }
            }}
          </Query>
        </Col>
      </Row>
    </React.StrictMode>
  );

const fieldSelector: ((state: {}, ...fields: string[]) => string) = formValueSelector("editSeverity");

export const severityView: React.ComponentType<ISeverityViewProps> = reduxWrapper(
  component,
  (state: StateType<Reducer>): ISeverityViewProps => ({
    ...state.dashboard.severity,
    formValues: {
      editSeverity: {
        values: {
          cvssVersion: fieldSelector(state, "cvssVersion"),
          modifiedSeverityScope: fieldSelector(state, "modifiedSeverityScope"),
          severityScope: fieldSelector(state, "severityScope"),
        },
      },
    },
    isMdlConfirmOpen: state.dashboard.isMdlConfirmOpen,
  }),
);
