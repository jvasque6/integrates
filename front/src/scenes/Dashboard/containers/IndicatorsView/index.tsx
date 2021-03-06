/* tslint:disable:jsx-no-multiline-js
 *
 * NO-MULTILINE-JS: Disabling this rule is necessary for the sake of
  * readability of the code in graphql queries
 */
import { LineDatum } from "@nivo/line";
import _ from "lodash";
import mixpanel from "mixpanel-browser";
import React from "react";
import { Query, QueryResult } from "react-apollo";
import { Col, Row } from "react-bootstrap";
import { hidePreloader, showPreloader } from "../../../../utils/apollo";
import { handleGraphQLErrors } from "../../../../utils/formatHelpers";
import translate from "../../../../utils/translations/translate";
import { IndicatorBox } from "../../components/IndicatorBox/index";
import { IndicatorChart } from "../../components/IndicatorChart";
import { IndicatorGraph } from "../../components/IndicatorGraph/index";
import style from "./index.css";
import { GET_INDICATORS } from "./queries";
import { IGraphData, IIndicatorsProps, IIndicatorsViewBaseProps } from "./types";

const calcPercent: ((value: number, total: number) => number) = (value: number, total: number): number =>
  _.round(value * 100 / total, 1);

const statusGraph: ((props: IIndicatorsProps["project"]) => { [key: string]: string | string[] | IGraphData[]}) =
(props: IIndicatorsProps["project"]): { [key: string]: string | string[] | IGraphData[]} => {
  const statusDataset: IGraphData = {
    backgroundColor: ["#ff1a1a", "#27BF4F"],
    data: [props.openVulnerabilities, props.closedVulnerabilities],
    hoverBackgroundColor: ["#e51414", "#069D2E"],
  };
  const totalVulnerabilities: number = props.openVulnerabilities + props.closedVulnerabilities;
  const openPercent: number = calcPercent(props.openVulnerabilities, totalVulnerabilities);
  const closedPercent: number = calcPercent(props.closedVulnerabilities, totalVulnerabilities);
  const statusGraphData: { [key: string]: string | string[] | IGraphData[]} = {
    datasets: [statusDataset],
    labels: [`${openPercent}% ${translate.t("search_findings.tab_indicators.open")}`,
             `${closedPercent}% ${translate.t("search_findings.tab_indicators.closed")}`],
  };

  return statusGraphData;
};

const treatmentGraph: ((props: IIndicatorsProps["project"]) => { [key: string]: string | string[] | IGraphData[]}) =
(props: IIndicatorsProps["project"]): { [key: string]: string | string[] | IGraphData[]} => {
  const totalTreatment: { [key: string]: number } = JSON.parse(props.totalTreatment);
  const treatmentDataset: IGraphData = {
    backgroundColor: ["#b7b7b7", "#FFAA63", "#CD2A86"],
    data: [totalTreatment.accepted, totalTreatment.inProgress, totalTreatment.undefined],
    hoverBackgroundColor: ["#999797", "#FF9034", "#A70762"],
  };
  const acceptedPercent: number = calcPercent(totalTreatment.accepted, props.openVulnerabilities);
  const inProgressPercent: number = calcPercent(totalTreatment.inProgress, props.openVulnerabilities);
  const undefinedPercent: number = calcPercent(totalTreatment.undefined, props.openVulnerabilities);
  const treatmentGraphData: { [key: string]: string | string[] | IGraphData[]} = {
    datasets: [treatmentDataset],
    labels: [`${acceptedPercent}% ${translate.t("search_findings.tab_indicators.treatment_accepted")}`,
             `${inProgressPercent}% ${translate.t("search_findings.tab_indicators.treatment_in_progress")}`,
             `${undefinedPercent}% ${translate.t("search_findings.tab_indicators.treatment_no_defined")}`],
  };

  return treatmentGraphData;
};

const indicatorsView: React.FC<IIndicatorsViewBaseProps> = (props: IIndicatorsViewBaseProps): JSX.Element => {
  const projectName: string = props.match.params.projectName;

  const handleQryResult: ((qrResult: IIndicatorsProps) => void) = (qrResult: IIndicatorsProps): void => {
    mixpanel.track(
      "ProjectIndicator",
      {
        Organization: (window as Window & { userOrganization: string }).userOrganization,
        User: (window as Window & { userName: string }).userName,
      });
    hidePreloader();
  };

  return (
    <Query query={GET_INDICATORS} variables={{ projectName }} onCompleted={handleQryResult}>
      {
        ({ loading, error, data }: QueryResult<IIndicatorsProps>): React.ReactNode => {
          if (loading) {
            showPreloader();

            return <React.Fragment />;
          }
          if (!_.isUndefined(error)) {
            hidePreloader();
            handleGraphQLErrors("An error occurred getting indicators", error);

            return <React.Fragment />;
          }
          if (!_.isUndefined(data)) {
            const totalVulnerabilities: number =
              data.project.openVulnerabilities + data.project.closedVulnerabilities;
            const undefinedTreatment: number = JSON.parse(data.project.totalTreatment).undefined;
            const dataChart: LineDatum[][] = JSON.parse(data.project.remediatedOverTime);

            return (
              <React.StrictMode>
                <Row>
                  <Col md={12} sm={12} xs={12}>
                    <h1 className={style.title}>{translate.t("search_findings.tab_indicators.project_title")}</h1>
                    {dataChart.length > 0 ? (
                      <IndicatorChart
                        dataChart={dataChart}
                      />
                    ) : undefined}
                    <Row>
                      <Col md={8} sm={12} xs={12}>
                        <Col md={6} sm={12} xs={12}>
                          <IndicatorBox
                            icon="findings"
                            name={translate.t("search_findings.tab_indicators.total_findings")}
                            quantity={data.project.totalFindings}
                            title=""
                            total=""
                          />
                        </Col>
                        <Col md={6} sm={12} xs={12}>
                          <IndicatorBox
                            icon="vulnerabilities"
                            name={translate.t("search_findings.tab_indicators.total_vulnerabilitites")}
                            quantity={totalVulnerabilities}
                            title=""
                            total=""
                          />
                        </Col>
                        <Col md={6} sm={12} xs={12}>
                          <IndicatorBox
                            icon="totalVulnerabilities"
                            name={translate.t("search_findings.tab_indicators.pending_closing_check")}
                            quantity={data.project.pendingClosingCheck}
                            title=""
                            total=""
                          />
                        </Col>
                        <Col md={6} sm={12} xs={12}>
                          <IndicatorBox
                            icon="calendar"
                            name={translate.t("search_findings.tab_indicators.last_closing_vuln")}
                            quantity={data.project.lastClosingVuln}
                            title=""
                            total=""
                          />
                        </Col>
                        <Col md={6} sm={12} xs={12}>
                          <IndicatorBox
                            icon="integrityHigh"
                            name={translate.t("search_findings.tab_indicators.undefined_treatment")}
                            quantity={undefinedTreatment}
                            title=""
                            total=""
                          />
                        </Col>
                        <Col md={6} sm={12} xs={12}>
                          <IndicatorBox
                            icon="graph"
                            name={translate.t("search_findings.tab_indicators.mean_remediate")}
                            quantity={data.project.meanRemediate}
                            title=""
                            total={translate.t("search_findings.tab_indicators.days")}
                          />
                        </Col>
                        <Col md={6} sm={12} xs={12}>
                          <IndicatorBox
                            icon="vectorLocal"
                            name={translate.t("search_findings.tab_indicators.max_severity")}
                            quantity={data.project.maxSeverity}
                            title=""
                            total="/10"
                          />
                        </Col>
                        <Col md={6} sm={12} xs={12}>
                          <IndicatorBox
                            icon="openVulnerabilities"
                            name={translate.t("search_findings.tab_indicators.max_open_severity")}
                            quantity={data.project.maxOpenSeverity}
                            title=""
                            total="/10"
                          />
                        </Col>
                      </Col>
                      <Col md={4} sm={12} xs={12}>
                        <Col md={12} sm={12} xs={12} className={style.box_size}>
                          <IndicatorGraph
                            data={statusGraph(data.project)}
                            name={translate.t("search_findings.tab_indicators.status_graph")}
                          />
                        </Col>
                        <Col md={12} sm={12} xs={12} className={style.box_size}>
                          <IndicatorGraph
                            data={treatmentGraph(data.project)}
                            name={translate.t("search_findings.tab_indicators.treatment_graph")}
                          />
                        </Col>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <br />
                <br />
                <hr />
                <Row>
                  <Col md={12} sm={12} xs={12}>
                    <h1 className={style.title}>{translate.t("search_findings.tab_indicators.git_title")}</h1>
                    <Col md={4} sm={12} xs={12}>
                      <IndicatorBox
                        icon="integrityNone"
                        name={translate.t("search_findings.tab_indicators.repositories")}
                        quantity={JSON.parse(data.resources.repositories).length}
                        title=""
                        total=""
                      />
                    </Col>
                    <Col md={4} sm={12} xs={12}>
                      <IndicatorBox
                        icon="authors"
                        name={translate.t("search_findings.tab_indicators.authors")}
                        quantity={data.project.currentMonthAuthors}
                        title=""
                        total=""
                      />
                    </Col>
                    <Col md={4} sm={12} xs={12}>
                      <IndicatorBox
                        icon="terminal"
                        name={translate.t("search_findings.tab_indicators.commits")}
                        quantity={data.project.currentMonthCommits}
                        title=""
                        total=""
                      />
                    </Col>
                  </Col>
                </Row>
              </React.StrictMode>
            );
          }
        }}
    </Query>
  );
};

export { indicatorsView as ProjectIndicatorsView };
