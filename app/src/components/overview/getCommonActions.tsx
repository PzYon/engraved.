import { IJournal } from "../../serverApi/IJournal";
import { IDialogProps } from "../layout/dialogs/DialogContext";
import { ActionFactory } from "../common/actions/ActionFactory";
import { IAction } from "../common/actions/IAction";
import { IUser } from "../../serverApi/IUser";

export function getCommonActions(
  journal: IJournal,
  enableHotkeys: boolean,
  user: IUser,
  renderDialog?: (dialogProps: IDialogProps) => void,
): IAction[] {
  if (!journal) {
    return [];
  }

  const actions: IAction[] = [];

  if (renderDialog) {
    actions.push(ActionFactory.addEntry(journal, renderDialog, enableHotkeys));
  }

  actions.push(
    ActionFactory.editJournalPermissions(journal.id),
    ActionFactory.editJournalSchedule(journal.id, enableHotkeys),
    ActionFactory.editJournal(journal.id, enableHotkeys),
    ActionFactory.deleteJournal(journal.id, enableHotkeys),
  );

  if (journal.schedules?.[user.id]?.nextOccurrence) {
    actions.push(ActionFactory.markJournalScheduleAsDone(journal));
  }

  return actions;
}

export function getCommonEditModeActions(
  onCancel: () => void,
  onSave: () => Promise<void>,
  disableSave?: boolean,
): IAction[] {
  return [
    ActionFactory.cancel(onCancel),
    ActionFactory.save(onSave, disableSave, true),
  ];
}
