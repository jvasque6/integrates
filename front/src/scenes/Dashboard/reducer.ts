import * as actions from "./actions";
import * as actionType from "./actionTypes";
import { IVulnerabilitiesViewProps } from "./components/Vulnerabilities/index";
import { IDescriptionViewProps } from "./containers/DescriptionView";
import * as descriptionActions from "./containers/DescriptionView/actionTypes";
import * as eventDescriptionActions from "./containers/EventDescriptionView/actionTypes";
import { IEventDescriptionViewProps } from "./containers/EventDescriptionView/index";
import * as eventsActions from "./containers/EventsView/actionTypes";
import { IEventsViewProps } from "./containers/EventsView/index";
import { IEvidenceViewProps } from "./containers/EvidenceView";
import * as evidenceActions from "./containers/EvidenceView/actionTypes";
import { IExploitViewProps } from "./containers/ExploitView";
import * as exploitActions from "./containers/ExploitView/actionTypes";
import * as findingActions from "./containers/FindingContent/actionTypes";
import * as indicatorsActions from "./containers/IndicatorsView/actionTypes";
import * as projectActions from "./containers/ProjectContent/actionTypes";
import * as draftsActions from "./containers/ProjectDraftsView/actionTypes";
import * as findingsActions from "./containers/ProjectFindingsView/actionTypes";
import * as usersActions from "./containers/ProjectUsersView/actionTypes";
import * as recordsActions from "./containers/RecordsView/actionTypes";
import { IRecordsViewProps } from "./containers/RecordsView/index";
import * as resourcesActions from "./containers/ResourcesView/actionTypes";
import { ISeverityViewProps } from "./containers/SeverityView";
import * as severityActions from "./containers/SeverityView/actionTypes";
import * as trackingActions from "./containers/TrackingView/actionTypes";
import { ITrackingViewProps } from "./containers/TrackingView/index";

export interface IDashboardState {
  confirmDialog: {[name: string]: { isOpen: boolean }};
  description: Pick<IDescriptionViewProps, "dataset" | "isEditing" | "isRemediationOpen">;
  drafts: {
    dataset: Array<{
      description: string;
      id: string;
      isExploitable: string;
      openVulnerabilities: number;
      releaseDate: string;
      reportDate: string;
      severityScore: number;
      title: string;
      type: string;
    }>;
  };
  eventDescription: Pick<IEventDescriptionViewProps, "isEditable" | "eventData" >;
  events: Pick<IEventsViewProps, "eventsDataset" >;
  evidence: Pick<IEvidenceViewProps, "currentIndex" | "images" | "isImageOpen" | "isEditing">;
  exploit: Pick<IExploitViewProps, "code" | "isEditing">;
  fileInput: {
    name: string;
  };
  finding: {
    alert?: string;
    openVulns: number;
    reportDate: string;
    status: "Abierto" | "Cerrado" | "Default";
    title: string;
  };
  findings: {
    dataset: Array<{
      age: number;
      description: string;
      id: string;
      isExploitable: string;
      lastVulnerability: number;
      openVulnerabilities: number;
      severityScore: number;
      state: string;
      title: string;
      treatment: string;
      type: string;
    }>;
    reportsModal: {
      hasExecutive: boolean;
      isOpen: boolean;
    };
  };
  indicators: {
    addModal: {
      open: boolean;
    };
    closedVulnerabilities: number;
    currentMonthAuthors: number;
    currentMonthCommits: number;
    deletionDate: string;
    lastClosingVuln: number;
    maxOpenSeverity: number;
    maxSeverity: number;
    meanRemediate: number;
    openVulnerabilities: number;
    pendingClosingCheck: number;
    repositories: Array<{ branch: string; urlRepo: string }>;
    subscription: string;
    tagsDataset: string[];
    totalFindings: number;
    totalTreatment: { [value: string]: number };
  };
  records: Pick<IRecordsViewProps, "isEditing" | "dataset">;
  resources: {
    addModal: {
      open: boolean;
      type: "repository" | "environment" | "file";
    };
    environments: Array<{ urlEnv: string }>;
    files: Array<{ description: string; fileName: string; uploadDate: string}>;
    optionsModal: {
      open: boolean;
      rowInfo: { fileName: string };
    };
    repositories: Array<{ branch: string; urlRepo: string }>;
  };
  severity: Pick<ISeverityViewProps, "isEditing" | "criticity" | "dataset" | "cvssVersion">;
  tags: {
    deletionDate: string;
    subscription: string;
    tagsDataset: string[];
    tagsModal: {
      open: boolean;
    };
  };
  tracking: Pick<ITrackingViewProps, "closings">;
  user: {
    role: string;
  };
  users: {
    addModal: {
      initialValues: {};
      open: boolean;
      type: "add" | "edit";
    };
    userList: Array<{
      email: string; firstLogin: string; lastLogin: string; organization: string;
      phoneNumber: string; responsability: string; role: string;
    }>;
  };
  vulnerabilities: {
    dataInputs: IVulnerabilitiesViewProps["dataInputs"];
    dataLines: IVulnerabilitiesViewProps["dataLines"];
    dataPorts: IVulnerabilitiesViewProps["dataPorts"];
    releaseDate: IVulnerabilitiesViewProps["releaseDate"];
  };
}

const initialState: IDashboardState = {
  confirmDialog: {},
  description: {
    dataset: {
      actor: "",
      affectedSystems: "",
      ambit: "",
      attackVectorDesc: "",
      btsUrl: "",
      category: "",
      clientCode: "",
      clientProject: "",
      compromisedAttributes: "",
      compromisedRecords: "",
      cweUrl: "",
      description: "",
      detailedSeverity: 0,
      kbUrl: "",
      probability: 0,
      recommendation: "",
      releaseDate: "",
      remediated: false,
      reportLevel: "",
      requirements: "",
      risk: "",
      riskLevel: "",
      scenario: "",
      state: "",
      subscription: "",
      threat: "",
      title: "",
      treatment: "",
      treatmentJustification: "",
      treatmentManager: "",
      type: "",
      userEmails: [{ email: "" }],
    },
    isEditing: false,
    isRemediationOpen : false,
  },
  drafts: {
    dataset: [],
  },
  eventDescription: {
    eventData: {
      accessibility: "",
      affectation: "",
      affectedComponents: "",
      analyst: "",
      client: "",
      clientProject: "",
      detail: "",
      eventDate: "",
      eventStatus: "",
      eventType: "",
      evidence: "",
      id: "",
      projectName: "",
    },
    isEditable: false,
  },
  events: {
    eventsDataset: [{
      detail: "",
      eventDate: "",
      eventStatus: "",
      eventType: "",
      id: "",
    }],
    },
  evidence: {
    currentIndex: 0,
    images: [],
    isEditing: false,
    isImageOpen: false,
  },
  exploit: {
    code: "",
    isEditing: false,
  },
  fileInput: {
    name: "",
  },
  finding: {
    alert: undefined,
    openVulns: 0,
    reportDate: "-",
    status: "Default",
    title: "",
  },
  findings: {
    dataset: [],
    reportsModal: {
      hasExecutive: false,
      isOpen: false,
    },
  },
  indicators: {
    addModal: {
      open: false,
    },
    closedVulnerabilities: 0,
    currentMonthAuthors: 0,
    currentMonthCommits: 0,
    deletionDate: "",
    lastClosingVuln: 0,
    maxOpenSeverity: 0,
    maxSeverity: 0,
    meanRemediate: 0,
    openVulnerabilities: 0,
    pendingClosingCheck: 0,
    repositories: [],
    subscription: "",
    tagsDataset: [],
    totalFindings: 0,
    totalTreatment: {},
  },
  records: {
    dataset: [],
    isEditing: false,
  },
  resources: {
    addModal: {
      open: false,
      type: "repository",
    },
    environments: [],
    files: [],
    optionsModal: {
      open: false,
      rowInfo: {fileName: ""},
    },
    repositories: [],
  },
  severity: {
    criticity: 0,
    cvssVersion: "",
    dataset: {
      accessComplexity: "",
      accessVector: "",
      attackComplexity: "",
      attackVector: "",
      authentication: "",
      availabilityImpact: "",
      availabilityRequirement: "",
      collateralDamagePotential: "",
      confidenceLevel: "",
      confidentialityImpact: "",
      confidentialityRequirement: "",
      exploitability: "",
      findingDistribution: "",
      integrityImpact: "",
      integrityRequirement: "",
      modifiedAttackComplexity: "",
      modifiedAttackVector: "",
      modifiedAvailabilityImpact: "",
      modifiedConfidentialityImpact: "",
      modifiedIntegrityImpact: "",
      modifiedPrivilegesRequired: "",
      modifiedSeverityScope: "",
      modifiedUserInteraction: "",
      privilegesRequired: "",
      remediationLevel: "",
      reportConfidence: "",
      resolutionLevel: "",
      severityScope: "",
      userInteraction: "",
    },
    isEditing: false,
  },
  tags: {
    deletionDate: "",
    subscription: "",
    tagsDataset: [],
    tagsModal: {
      open: false,
    },
  },
  tracking: {
    closings: [],
  },
  user: {
    role: "",
  },
  users: {
    addModal: {
      initialValues: {},
      open: false,
      type: "add",
    },
    userList: [],
  },
  vulnerabilities: {
    dataInputs: [],
    dataLines: [],
    dataPorts: [],
    releaseDate: "",
  },
};

const actionMap: {
  [key: string]: ((arg1: IDashboardState, arg2: actions.IActionStructure) => IDashboardState);
} = {};

actionMap[eventDescriptionActions.LOAD_EVENT] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    eventDescription: {
      ...state.eventDescription,
      eventData: action.payload.event,
    },
  });

actionMap[eventDescriptionActions.CHANGE_EVENT_EDITABLE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    eventDescription: {
      ...state.eventDescription,
      isEditable: !state.eventDescription.isEditable,
    },
  });

actionMap[eventDescriptionActions.CLEAR_EVENT_STATE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
    ({
      ...state,
      eventDescription: initialState.eventDescription,
    });

actionMap[eventsActions.LOAD_EVENTS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    events: {
      ...state.events,
      eventsDataset: action.payload.events,
    },
  });

actionMap[eventsActions.CLEAR_EVENTS_STATE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
    ({
      ...state,
      events: initialState.events,
    });

actionMap[resourcesActions.LOAD_RESOURCES] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      environments: action.payload.environments,
      files: action.payload.files,
      repositories: action.payload.repositories,
    },
  });

actionMap[resourcesActions.OPEN_ADD_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      addModal: {
        ...state.resources.addModal,
        open: true,
        type: action.payload.type,
      },
    },
  });

actionMap[resourcesActions.CLOSE_ADD_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      addModal: {
        ...initialState.resources.addModal,
      },
    },
  });

actionMap[resourcesActions.OPEN_OPTIONS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      optionsModal: {
        ...state.resources.optionsModal,
        open: true,
        rowInfo: action.payload.rowInfo,
      },
    },
  });

actionMap[resourcesActions.CLOSE_OPTIONS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    resources: {
      ...state.resources,
      optionsModal: {
        ...initialState.resources.optionsModal,
      },
    },
  });

actionMap[resourcesActions.LOAD_TAGS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    tags: {
      ...state.tags,
      deletionDate: action.payload.deletionDate,
      subscription: action.payload.subscription,
      tagsDataset: action.payload.tagsDataset,
    },
  });

actionMap[resourcesActions.OPEN_TAGS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    tags: {
      ...state.tags,
      tagsModal: {
        ...state.tags.tagsModal,
        open: true,
      },
    },
  });

actionMap[resourcesActions.CLOSE_TAGS_MODAL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    tags: {
      ...state.tags,
      tagsModal: initialState.tags.tagsModal,
    },
  });

actionMap[actionType.ADD_FILE_NAME] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    fileInput: {
      name: action.payload.newValue[0].name,
    },
  });

actionMap[usersActions.LOAD_USERS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    users: {
      ...state.users,
      userList: action.payload.userlist,
    },
  });

actionMap[usersActions.ADD_USER] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    users: {
      ...state.users,
      userList: [...state.users.userList, action.payload.newUser],
    },
  });

actionMap[usersActions.REMOVE_USER] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    users: {
      ...state.users,
      userList: [...state.users.userList.filter(
        (user: IDashboardState["users"]["userList"][0]) =>
        user.email !== action.payload.removedEmail,
      )],
    },
  });

actionMap[usersActions.OPEN_USERS_MDL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    users: {
      ...state.users,
      addModal: {
        ...state.users.addModal,
        initialValues: action.payload.initialValues,
        open: true,
        type: action.payload.type,
      },
    },
  });

actionMap[usersActions.CLOSE_USERS_MDL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    users: {
      ...state.users,
      addModal: initialState.users.addModal,
    },
  });

actionMap[actionType.LOAD_VULNERABILITIES] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    vulnerabilities: {
      dataInputs: action.payload.dataInputs,
      dataLines: action.payload.dataLines,
      dataPorts: action.payload.dataPorts,
      releaseDate: action.payload.releaseDate,
    },
  });

actionMap[recordsActions.EDIT_RECORDS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    records: {
      ...state.records,
      isEditing: !state.records.isEditing,
    },
  });

actionMap[recordsActions.LOAD_RECORDS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    records: {
      ...state.records,
      dataset: action.payload.records,
    },
  });

actionMap[trackingActions.LOAD_TRACKING] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    tracking: {
      closings: action.payload.closings,
    },
  });

actionMap[severityActions.LOAD_SEVERITY] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    severity: {
      ...state.severity,
      cvssVersion: action.payload.cvssVersion,
      dataset: action.payload.dataset,
    },
  });

actionMap[severityActions.EDIT_SEVERITY] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    severity: {
      ...state.severity,
      isEditing: !state.severity.isEditing,
    },
  });

actionMap[severityActions.CALC_CVSS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    severity: {
      ...state.severity,
      criticity: action.payload.temporal,
    },
  });

actionMap[actionType.OPEN_CONFIRM_DIALOG] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
    ({
      ...state,
      confirmDialog: {
        ...state.confirmDialog,
        [action.payload.dialogName]: {
          ...state.confirmDialog[action.payload.dialogName],
          isOpen: true,
        },
      },
    });

actionMap[actionType.CLOSE_CONFIRM_DIALOG] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
    ({
      ...state,
      confirmDialog: {
        ...state.confirmDialog,
        [action.payload.dialogName]: {
          ...state.confirmDialog[action.payload.dialogName],
          isOpen: false,
        },
      },
    });

actionMap[exploitActions.LOAD_EXPLOIT] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    exploit: {
      ...state.exploit,
      code: action.payload.code,
    },
  });

actionMap[exploitActions.EDIT_EXPLOIT] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    exploit: {
      ...state.exploit,
      isEditing: !state.exploit.isEditing,
    },
  });

actionMap[evidenceActions.OPEN_EVIDENCE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    evidence: {
      ...state.evidence,
      currentIndex: action.payload.imgIndex,
      isImageOpen: true,
    },
  });

actionMap[evidenceActions.CLOSE_EVIDENCE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    evidence: {
      ...state.evidence,
      isImageOpen: false,
    },
  });

actionMap[evidenceActions.MOVE_EVIDENCE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    evidence: {
      ...state.evidence,
      currentIndex: action.payload.index,
    },
  });

actionMap[evidenceActions.EDIT_EVIDENCE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    evidence: {
      ...state.evidence,
      isEditing: action.payload.value,
    },
  });

actionMap[evidenceActions.LOAD_EVIDENCE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    evidence: {
      ...state.evidence,
      images: action.payload.images,
    },
  });

actionMap[evidenceActions.CLEAR_EVIDENCE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    evidence: initialState.evidence,
  });

actionMap[descriptionActions.LOAD_DESCRIPTION] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    description: {
      ...state.description,
      dataset: {...state.description.dataset, ...action.payload.descriptionData},
    },
  });

actionMap[descriptionActions.EDIT_DESCRIPTION] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    description: {
      ...state.description,
      isEditing: !state.description.isEditing,
    },
  });

actionMap[descriptionActions.OPEN_REMEDIATION_MDL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState => ({
    ...state,
    description: {
      ...state.description,
      isRemediationOpen: true,
    },
  });

actionMap[descriptionActions.CLOSE_REMEDIATION_MDL] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState => ({
    ...state,
    description: {
      ...state.description,
      isRemediationOpen: false,
    },
  });
actionMap[indicatorsActions.LOAD_INDICATORS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
  ({
    ...state,
    indicators: {
      ...state.indicators,
      ...action.payload,
    },
  });

actionMap[descriptionActions.CLEAR_EVIDENCE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
    ({
      ...state,
      description: initialState.description,
    });

actionMap[findingActions.LOAD_FINDING] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
    ({
      ...state,
      finding: action.payload,
    });

actionMap[findingActions.CLEAR_FINDING_STATE] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState =>
    ({
      ...state,
      description: initialState.description,
      evidence: initialState.evidence,
      exploit: initialState.exploit,
      finding: initialState.finding,
      records: initialState.records,
      severity: initialState.severity,
      tracking: initialState.tracking,
    });

actionMap[findingActions.UPDATE_FINDING_HEADER] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState => ({
    ...state,
    finding: { ...state.finding, ...action.payload },
  });

actionMap[projectActions.LOAD_PROJECT] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState => ({
    ...state,
    user: { role: action.payload.role },
  });

actionMap[projectActions.CLEAR_PROJECT_STATE] = (state: IDashboardState): IDashboardState => ({
  ...state,
  drafts: initialState.drafts,
  findings: initialState.findings,
  indicators: initialState.indicators,
  resources: initialState.resources,
  users: initialState.users,
});

actionMap[findingsActions.OPEN_REPORTS_MODAL] = (state: IDashboardState): IDashboardState => ({
  ...state,
  findings: {
    ...state.findings,
    reportsModal: {
      ...state.findings.reportsModal,
      isOpen: true,
    },
  },
});

actionMap[findingsActions.CLOSE_REPORTS_MODAL] = (state: IDashboardState): IDashboardState => ({
  ...state,
  findings: {
    ...state.findings,
    reportsModal: {
      ...state.findings.reportsModal,
      isOpen: false,
    },
  },
});

actionMap[findingsActions.LOAD_FINDINGS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState => ({
    ...state,
    findings: {
      ...state.findings,
      dataset: action.payload.dataset,
      reportsModal: {
        ...state.findings.reportsModal,
        hasExecutive: action.payload.hasExecutive,
      },
    },
  });

actionMap[draftsActions.LOAD_DRAFTS] =
  (state: IDashboardState, action: actions.IActionStructure): IDashboardState => ({
    ...state,
    drafts: {
      ...state.drafts,
      dataset: action.payload.dataset,
    },
  });

type DashboardReducer = ((
  arg1: IDashboardState | undefined,
  arg2: actions.IActionStructure,
) => IDashboardState);

export const dashboard: DashboardReducer =
  (state: IDashboardState = initialState,
   action: actions.IActionStructure): IDashboardState => {
  if (action.type in actionMap) {
    return actionMap[action.type](state, action);
  } else {
    return state;
  }
};
