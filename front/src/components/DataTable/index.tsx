/* tslint:disable jsx-no-multiline-js
 * Disabling this rule is necessary for the sake of
 * readability of the code that dynamically creates the columns
 */
import PropTypes from "prop-types";
import React from "react";
import ReactTable, { Column, ReactTableDefaults, RowInfo } from "react-table";
/* tslint:disable-next-line:no-import-side-effect no-submodule-imports
 * Disabling this two rules is necessary for
 * allowing the import of default styles that ReactTable needs
 * to display properly even if some of them are overridden later
 */
import "react-table/react-table.css";
import globalStyle from "../../styles/global.css";
import style from "./index.css";

interface ITableProps {
  /* tslint:disable-next-line:no-any
   * Disabling this rule is necessary because the dataset
   * array may contain different types since this is a
   * generic component
   */
  dataset: any[];
  title: string;
  onClickRow(arg1: RowInfo | undefined): void;
}

const customColumn: Column = {
  ...ReactTableDefaults.column,
  className: style.td,
  headerClassName: style.th,
};

const dataTable: React.StatelessComponent<ITableProps> =
  (props: ITableProps): JSX.Element => (
    <React.StrictMode>
      <div>
        <h1 className={globalStyle.title}>{props.title}</h1>
        <ReactTable
          className="-striped -highlight"
          showPagination={props.dataset.length > 25}
          defaultPageSize={25}
          showPageSizeOptions={false}
          sortable={true}
          minRows={0}
          data={props.dataset}
          columns={
            Object.keys(props.dataset[0])
            .map((key: string) =>
              ({
                Header: key,
                accessor: key,
              }))
          }
          column={customColumn}
          getTrProps={
            /* tslint:disable-next-line jsx-no-lambda
             * Disabling this rule is necessary for binding the onClick
             * event performing a callback to the props-specified function
             */
            (_0: undefined, rowInfo?: RowInfo): ({onClick(): void}) =>
            ({
              onClick: (): void => {
                if (rowInfo !== undefined) {
                  props.onClickRow(rowInfo.original);
                }
              },
            })}
        />
      </div>
    </React.StrictMode>
  );

dataTable.propTypes = {
  dataset: PropTypes.any,
  onClickRow: PropTypes.func,
  title: PropTypes.string,
};

dataTable.defaultProps = {
  dataset: [{}],
  onClickRow: (arg1: RowInfo): void => undefined,
};

export = dataTable;
