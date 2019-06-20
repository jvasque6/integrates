import { configure, shallow, ShallowWrapper } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
import * as React from "react";
import { Col, Row } from "react-bootstrap";
import { ProjectBox } from "./index";

configure({ adapter: new ReactSixteenAdapter() });

const functionMock: (() => JSX.Element) = (): JSX.Element => <div />;

describe("ProjectBox", () => {

  it("should return a function", () => {
    expect(typeof (ProjectBox))
      .toEqual("function");
  });

  it("should render a project box", () => {
    const wrapper: ShallowWrapper = shallow(
      <ProjectBox description="Description test" name="Name test" onClick={functionMock}/>,
    );
    expect(wrapper.contains(
        <Row componentClass="div">
          <Col md={12} componentClass="div">
            <p>
              <b>
                Name test
              </b>
            </p>
          </Col>
        </Row>,
    ))
    .toBeTruthy();
  });
});
