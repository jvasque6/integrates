import { AxiosError, AxiosResponse } from "axios";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { msgError, msgSuccess } from "../../../../utils/notifications";
import rollbar from "../../../../utils/rollbar";
import translate from "../../../../utils/translations/translate";
import Xhr from "../../../../utils/xhr";
import * as actionTypes from "./actionTypes";

export interface IActionStructure {
  payload?: { [key: string]: string | string[] };
  type: string;
}

export type ThunkDispatcher = ThunkDispatch<{}, undefined, IActionStructure>;

type ThunkResult<T> = ThunkAction<T, {}, undefined, IActionStructure>;

export const loadRecords: ((findingId: string) => ThunkResult<void>) = (findingId: string): ThunkResult<void> =>
  (dispatch: ThunkDispatcher): void => {
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
          type: actionTypes.LOAD_RECORDS,
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

export const editRecords: (() => IActionStructure) =
  (): IActionStructure => ({
    payload: undefined,
    type: actionTypes.EDIT_RECORDS,
  });

export const updateRecords: ((findingId: string) => ThunkResult<void>) = (findingId: string): ThunkResult<void> =>
  (dispatch: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `mutation {
    updateEvidence (
      id: "8",
      findingId: "${findingId}") {
      success
      finding {
        records
      }
    }
  }`;
    new Xhr().upload(gQry, "#evidence8", "An error occurred updating records")
      .then((response: AxiosResponse) => {
        const { data } = response.data;
        if (data.updateEvidence.success) {
          dispatch({
            payload: { records: JSON.parse(data.updateEvidence.finding.records) },
            type: actionTypes.LOAD_RECORDS,
          });
          msgSuccess(
            translate.t("proj_alerts.file_updated"),
            translate.t("search_findings.tab_users.title_success"),
          );
        } else {
          msgError(translate.t("proj_alerts.error_textsad"));
        }
      })
      .catch((error: AxiosError) => {
        if (error.response !== undefined) {
          const { errors } = error.response.data;

          switch (errors[0].message) {
            case "File exceeds the size limits":
              msgError(translate.t("proj_alerts.file_size"));
              break;
            case "Extension not allowed":
              msgError(translate.t("proj_alerts.file_type_wrong"));
              break;
            default:
              msgError(translate.t("proj_alerts.no_file_update"));
              rollbar.error(error.message, errors);
          }

        }
      });
  };
