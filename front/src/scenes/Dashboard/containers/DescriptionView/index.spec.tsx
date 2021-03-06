import { configure, mount, ReactWrapper } from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
import { GraphQLError } from "graphql";
// tslint:disable-next-line: no-import-side-effect
import "isomorphic-fetch";
import * as React from "react";
// tslint:disable-next-line: no-submodule-imports
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import { Provider } from "react-redux";
import wait from "waait";
import store from "../../../../store/index";
import { GET_VULNERABILITIES } from "../../components/Vulnerabilities/queries";
import { descriptionView as DescriptionView, IDescriptionViewProps } from "./index";

configure({ adapter: new ReactSixteenAdapter() });

describe("DescriptionView", () => {

  const mockProps: IDescriptionViewProps = {
    dataset: {
      actor: "ANYONE_INTERNET",
      affectedSystems: "",
      ambit: "",
      attackVectorDesc: "test",
      btsUrl: "http://test.html",
      category: "",
      clientCode: "TEST",
      clientProject: "TEST",
      compromisedAttributes: "",
      compromisedRecords: "0",
      cweUrl: "http://test.html",
      description: "This is a test description",
      detailedSeverity: 0,
      kbUrl: "http://test.html",
      probability: 0,
      recommendation: "This is a test recommendation",
      releaseDate: "2018-10-17 00:00:00",
      remediated: false,
      reportLevel: "GENERAL",
      requirements: "REQ.0000 Test",
      risk: "",
      riskLevel: "",
      scenario: "ANONYMOUS_INTERNET",
      state: "open",
      subscription: "ONESHOT",
      threat: "",
      title: "FIN.S.00001 Test",
      treatment: "PROGRESS",
      treatmentJustification: "Fix it",
      treatmentManager: "test@test.com",
      type: "SECURITY",
      userEmails: [{email: "user@test.com"}],
    },
    findingId: "438679960",
    formValues: {
      detailedSeverity: 0,
      probability: 0,
      reportLevel: "",
      treatment: "",
    },
    isEditing: false,
    isRemediationOpen: false,
    projectName: "TEST",
    userRole: "analyst",
  };

  const mocks: ReadonlyArray<MockedResponse> = [
    {
      request: {
        query: GET_VULNERABILITIES,
        variables: {
          identifier: "438679960",
        },
      },
      result: {
        data: {
          finding: {
            __typename: "Finding",
            id: "438679960",
            inputsVulns: [{
              __typename: "Vulnerability",
              currentState: "open",
              findingId: "438679960",
              id: "89521e9a-b1a3-4047-a16e-15d530dc1340",
              specific: "email",
              treatment: "New",
              vulnType: "inputs",
              where: "https://example.com/contact",
            }],
            linesVulns: [],
            portsVulns: [],
            releaseDate: "2019-03-12 00:00:00",
            success: true,
          },
        },
      },
    },
  ];

  const mockError: ReadonlyArray<MockedResponse> = [
    {
      request: {
        query: GET_VULNERABILITIES,
        variables: {
          identifier: "438679960",
        },
      },
      result: {
        errors: [new GraphQLError("Access denied")],
      },
    },
  ];

  it("should return a fuction", () => {
    expect(typeof (DescriptionView))
      .toEqual("function");
  });

  it("should render an error in component", async () => {
    const wrapper: ReactWrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={mockError} addTypename={true}>
          <DescriptionView {...mockProps} />
        </MockedProvider>
      </Provider>,
    );
    await wait(0);
    expect(wrapper)
      .toHaveLength(1);
  });

  it("should render a component", async () => {
    const wrapper: ReactWrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={mocks} addTypename={true}>
          <DescriptionView {...mockProps} />
        </MockedProvider>
      </Provider>,
    );
    await wait(0);
    expect(wrapper)
      .toHaveLength(1);
  });
});
