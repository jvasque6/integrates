import { configure, shallow, ShallowWrapper } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
import * as React from "react";
import { Provider } from "react-redux";
import { Action, createStore, Store } from "redux";
import { addEnvironmentsModal as AddEnvironmentsModal } from "./index";

configure({ adapter: new ReactSixteenAdapter() });

const functionMock: (() => void) = (): void => undefined;

describe("Add Environments modal", () => {

  const store: Store<{}, Action<{}>> = createStore(() => ({}));
  const wrapper: ShallowWrapper = shallow(
    <Provider store={store}>
      <AddEnvironmentsModal
        isOpen={true}
        onClose={functionMock}
        onSubmit={functionMock}
      />
    </Provider>,
  );

  it("should return a function", () => {
    expect(typeof (AddEnvironmentsModal))
      .toEqual("function");
  });

  it("should render", () => {
    expect(wrapper)
      .toHaveLength(1);
  });
});
