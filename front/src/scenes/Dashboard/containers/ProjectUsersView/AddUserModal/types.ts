export interface IUserDataAttr {
  userData: {
    organization: string;
    phoneNumber: string;
    responsibility: string;
  };
}

export interface IAddUserModalProps {
  initialValues: {};
  open: boolean;
  projectName: string;
  type: "add" | "edit";
  userRole: string;
  onClose(): void;
  onSubmit(values: {}): void;
}
