import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import { App } from "./app";

describe("App root", () => {
  it("should render", () => {
    const renderedComponent: ReactTestRenderer = renderer.create(<App />);
    expect(renderedComponent.toJSON())
      .toBeTruthy();
  });
});
