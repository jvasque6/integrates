import _ from "lodash";
import mixpanel from "mixpanel-browser";
import React from "react";
import { Col, Glyphicon, Row } from "react-bootstrap";
import { connect, ConnectedComponentClass, MapDispatchToProps, MapStateToProps } from "react-redux";
import { RouteComponentProps } from "react-router";
import { InferableComponentEnhancer, lifecycle } from "recompose";
import { Button } from "../../../../components/Button/index";
import { dataTable as DataTable } from "../../../../components/DataTable/index";
import { FluidIcon } from "../../../../components/FluidIcon";
import translate from "../../../../utils/translations/translate";
import { isValidEvidenceFile } from "../../../../utils/validations";
import { FileInput } from "../../components/FileInput/index";
import { IDashboardState } from "../../reducer";
import { editRecords, loadRecords, ThunkDispatcher, updateRecords } from "./actions";

type IRecordsViewBaseProps = Pick<RouteComponentProps<{ findingId: string }>, "match">;

type IRecordsViewStateProps = IDashboardState["records"] & { userRole: string };

interface IRecordsViewDispatchProps {
  onEdit(): void;
  onLoad(): void;
  onUpdate(): void;
}

type IRecordsViewProps = IRecordsViewBaseProps & (IRecordsViewStateProps & IRecordsViewDispatchProps);

const enhance: InferableComponentEnhancer<{}> = lifecycle<IRecordsViewProps, {}>({
  componentDidMount(): void {
    mixpanel.track(
      "FindingRecords",
      {
        Organization: (window as Window & { userOrganization: string }).userOrganization,
        User: (window as Window & { userName: string }).userName,
      });
    this.props.onLoad();
  },
});

const renderUploadField: ((arg1: IRecordsViewProps) => JSX.Element) = (props: IRecordsViewProps): JSX.Element => {
  const handleUpdateClick: (() => void) = (): void => {
    if (isValidEvidenceFile("#evidence8")) {
      mixpanel.track("UpdateRecords", {
        Organization: (window as Window & { userOrganization: string }).userOrganization,
        User: (window as Window & { userName: string }).userName,
      });
      props.onUpdate();
    }
  };

  return (
  <Row>
    <Col md={4} mdOffset={6} xs={12} sm={12}>
      <div>
        <FileInput
          icon="search"
          id="evidence8"
          type=".csv"
          visible={true}
        />
      </div>
    </Col>
      <Col sm={2}>
        <Button
          bsStyle="primary"
          block={true}
          onClick={handleUpdateClick}
        >
          <Glyphicon glyph="cloud-upload" />
          &nbsp;{translate.t("search_findings.tab_evidence.update")}
        </Button>
      </Col>
    </Row>
  );
};

const renderEditPanel: ((arg1: IRecordsViewProps) => JSX.Element) = (props: IRecordsViewProps): JSX.Element => {
  const handleEditClick: (() => void) = (): void => { props.onEdit(); };

  return (
    <React.Fragment>
      <Row>
        <Col md={2} mdOffset={10} xs={12} sm={12}>
          <Button
            bsStyle="primary"
            block={true}
            onClick={handleEditClick}
          >
            <FluidIcon icon="edit" />
            &nbsp;{translate.t("search_findings.tab_evidence.editable")}
          </Button>
        </Col>
      </Row>
      <br />
      {props.isEditing ? renderUploadField(props) : undefined}
    </React.Fragment>
  );
};

const renderTable: ((arg1: object[]) => JSX.Element) = (dataset: object[]): JSX.Element => (
    <DataTable
      dataset={dataset}
      enableRowSelection={false}
      exportCsv={false}
      headers={[]}
      id="tblRecords"
      pageSize={15}
      title=""
      selectionMode="none"
    />
);

export const recordsView: React.FC<IRecordsViewProps> = (props: IRecordsViewProps): JSX.Element => (
    <React.StrictMode>
      <Row>
        {_.includes(["admin", "analyst"], props.userRole) ? renderEditPanel(props) : undefined}
      </Row>
      <Row>
        {renderTable(props.dataset)}
      </Row>
    </React.StrictMode>
);

interface IState { dashboard: IDashboardState; }
const mapStateToProps: MapStateToProps<IRecordsViewStateProps, IRecordsViewBaseProps, IState> =
  (state: IState): IRecordsViewStateProps => ({
    ...state.dashboard.records,
    userRole: (window as Window & { userRole: string }).userRole,
  });

const mapDispatchToProps: MapDispatchToProps<IRecordsViewDispatchProps, IRecordsViewBaseProps> =
  (dispatch: ThunkDispatcher, ownProps: IRecordsViewBaseProps): IRecordsViewDispatchProps => {
    const { findingId } = ownProps.match.params;

    return ({
      onEdit: (): void => { dispatch(editRecords()); },
      onLoad: (): void => { dispatch(loadRecords(findingId)); },
      onUpdate: (): void => { dispatch(updateRecords(findingId)); },
    });
  };

const connectedRecordsView: ConnectedComponentClass<React.ComponentType<IRecordsViewProps>, IRecordsViewBaseProps> =
  connect(mapStateToProps, mapDispatchToProps)(enhance(recordsView));

export { connectedRecordsView as RecordsView };
