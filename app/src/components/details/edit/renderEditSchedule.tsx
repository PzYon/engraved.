import { NavigateFunction } from "react-router-dom";
import { IJournal } from "../../../serverApi/IJournal";
import { IDialogProps } from "../../layout/dialogs/DialogContext";
import { EditSchedule } from "./EditSchedule";

export const renderEditSchedule = (
  journalId: string,
  entryId: string,
  journal: IJournal,
  renderDialog: (dialogProps: IDialogProps) => void,
  navigate?: NavigateFunction,
) => {
  renderDialog({
    title: "Schedule for " + (entryId ? "entry" : "journal"),
    render: (closeDialog) => (
      <EditSchedule
        journal={journal}
        journalId={journalId}
        entryId={entryId}
        onCancel={closeDialog}
      />
    ),
    onClose: () => {
      navigate?.(`/journals/${journalId}`);
    },
  });
};
