import { RouteComponentProps } from "react-router";
import { IDashboardState } from "../../reducer";

export interface IProjectTagsAttr {
  project: {
    deletionDate: string;
    name: string;
    subscription: string;
    tags: string[];
  };
}

export interface IRemoveTagsAttr {
  removeTag: {
    project: {
      deletionDate: string;
      name: string;
      subscription: string;
      tags: string[];
    };
    success: boolean;
  };
}

export interface IAddTagsAttr {
  addTags: {
    project: {
      deletionDate: string;
      name: string;
      subscription: string;
      tags: string[];
    };
    success: boolean;
  };
}

export interface IRepositoriesAttr {
  branch: string;
  protocol: string;
  urlRepo: string;
}

export interface IResourcesAttr {
  resources: {
    environments: string;
    repositories: string;
  };
}

export interface IRemoveRepoAttr {
  removeRepositories: {
    resources: {
      repositories: string;
    };
    success: boolean;
  };
}

export interface IAddReposAttr {
  addRepositories: {
    resources: {
      repositories: string;
    };
    success: boolean;
  };
}

export interface IEnvironmentsAttr {
  urlEnv: string;
}

export interface IRemoveEnvAttr {
  removeEnvironments: {
    resources: {
      environments: string;
    };
    success: boolean;
  };
}

export interface IAddEnvAttr {
  addEnvironments: {
    resources: {
      environments: string;
    };
    success: boolean;
  };
}

export type IResourcesViewBaseProps = Pick<RouteComponentProps<{ projectName: string }>, "match">;

export type IResourcesViewStateProps = IDashboardState["resources"] & IDashboardState["tags"];

export interface IResourcesViewDispatchProps {
  onCloseEnvsModal(): void;
  onCloseFilesModal(): void;
  onCloseOptionsModal(): void;
  onCloseReposModal(): void;
  onCloseTagsModal(): void;
  onDeleteFile(fileName: string): void;
  onDownloadFile(fileName: string): void;
  onLoad(): void;
  onOpenEnvsModal(): void;
  onOpenFilesModal(): void;
  onOpenOptionsModal(row: string): void;
  onOpenReposModal(): void;
  onOpenTagsModal(): void;
  onSaveFiles(files: IResourcesViewStateProps["files"]): void;
}

export type IResourcesViewProps = IResourcesViewBaseProps & (IResourcesViewStateProps & IResourcesViewDispatchProps);
