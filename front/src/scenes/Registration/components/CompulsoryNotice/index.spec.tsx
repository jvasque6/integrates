import { expect } from "chai";
import { configure, shallow, ShallowWrapper } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
import { describe, it } from "mocha";
import React from "react";
import { default as Modal } from "../../../../components/Modal/index";
import {
  compulsoryNotice as CompulsoryNotice,
} from "./index";

configure({ adapter: new ReactSixteenAdapter() });

const functionMock: (() => void) = (): void => undefined;

describe("Compulsory notice modal", () => {
  it("should return a function", () => {
    expect(typeof (CompulsoryNotice)).to
      .equal("function");
  });

  it("should be rendered", () => {
    const wrapper: ShallowWrapper = shallow(
      <CompulsoryNotice
        content=""
        id="testModal"
        open={true}
        rememberDecision={false}
        onAccept={functionMock}
        onCheckRemember={functionMock}
      />,
    );

    const component: ShallowWrapper = wrapper.find(Modal);
    expect(component).to.have
      .lengthOf(1);
  });
});
