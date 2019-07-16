import { configure, mount, ReactWrapper, shallow, ShallowWrapper } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
import * as React from "react";
import { Provider } from "react-redux";
import store from "../../../../store";
import { AddFilesModal } from "./index";

configure({ adapter: new ReactSixteenAdapter() });

describe("Add Files modal", (): void => {

  it("should return a function", (): void => {
    expect(typeof (AddFilesModal))
      .toEqual("function");
  });

  it("should render", (): void => {
    const wrapper: ShallowWrapper = shallow(
      <Provider store={store}>
        <AddFilesModal
          isOpen={true}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
          showUploadProgress={false}
          uploadProgress={10}
        />
      </Provider>,
    );

    expect(wrapper)
      .toHaveLength(1);
  });

  it("should render uploadbar", (): void => {
    const wrapper: ReactWrapper = mount(
      <Provider store={store}>
        <AddFilesModal
          isOpen={true}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
          showUploadProgress={true}
          uploadProgress={10}
        />
      </Provider>,
    );
    expect(wrapper.find("ProgressBar").length)
      .toEqual(1);
  });

  it("should close on cancel", (): void => {
    const handleClose: jest.Mock = jest.fn();
    const wrapper: ReactWrapper = mount(
      <Provider store={store}>
        <AddFilesModal
          isOpen={true}
          onClose={handleClose}
          onSubmit={jest.fn()}
          showUploadProgress={true}
          uploadProgress={10}
        />
      </Provider>,
    );
    const cancelButton: ReactWrapper = wrapper.find("button")
      .findWhere((element: ReactWrapper) => element.contains("Cancel"))
      .at(0);
    cancelButton.simulate("click");
    expect(handleClose.mock.calls.length)
      .toEqual(1);
  });
});
