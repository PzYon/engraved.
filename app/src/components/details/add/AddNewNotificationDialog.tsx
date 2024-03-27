import { ParseableDate } from "../edit/ParseableDate";
import React, { useState } from "react";
import { JournalSelector } from "../../common/JournalSelector";
import { getPermissionsForUser } from "../../overview/useJournalPermissions";
import { UserRole } from "../../../serverApi/UserRole";
import { useAppContext } from "../../../AppContext";
import { styled } from "@mui/material";
import { useUpsertEntryMutation } from "../../../serverApi/reactQuery/mutations/useUpsertEntryMutation";
import { JournalType } from "../../../serverApi/JournalType";
import { IParsedDate } from "../edit/parseDate";
import { IUpsertScrapsEntryCommand } from "../../../serverApi/commands/IUpsertScrapsEntryCommand";
import { SaveOutlined } from "@mui/icons-material";
import { ActionIconButtonGroup } from "../../common/actions/ActionIconButtonGroup";
import { StorageUtil } from "../../../util/StorageUtil";

class QuickNotificationStorage {
  private static key = "engraved::quick-notification-journal-id";

  private storageUtil = new StorageUtil(localStorage);

  getJournalId(): string {
    return this.storageUtil.getValue(QuickNotificationStorage.key);
  }

  setJournalId(journalId: string): void {
    this.storageUtil.setValue(QuickNotificationStorage.key, journalId);
  }
}

const storage = new QuickNotificationStorage();

export const AddNewNotificationDialog: React.FC<{
  onSuccess?: () => void;
}> = ({ onSuccess }) => {
  const { user } = useAppContext();
  const [journalId, setJournalId] = useState(storage.getJournalId() ?? "");
  const [parsed, setParsed] = useState<IParsedDate>({});

  const upsertEntryMutation = useUpsertEntryMutation(
    journalId,
    JournalType.Scraps,
    null,
    null,
    onSuccess,
  );

  return (
    <Host>
      <JournalSelector
        label={"Add to journal"}
        selectedJournalId={journalId}
        filterJournals={(journals) =>
          journals.filter((j) => {
            const permissions = getPermissionsForUser(j.permissions, user);
            return (
              permissions.userRole === UserRole.Owner ||
              permissions.userRole === UserRole.Writer
            );
          })
        }
        onChange={(journal) => setJournalId(journal.id)}
      />

      <ParseableDate sx={{ pt: 2 }} onChange={setParsed} onSelect={save} />

      <ActionsContainer>
        <ActionIconButtonGroup
          actions={[
            {
              key: "add",
              onClick: save,
              label: "Save",
              isDisabled: !isFormValid(),
              icon: <SaveOutlined fontSize="small" />,
            },
          ]}
        />
      </ActionsContainer>
    </Host>
  );

  function save() {
    if (!isFormValid()) {
      return;
    }

    storage.setJournalId(journalId);

    upsertEntryMutation.mutate({
      command: {
        title: parsed.text,
        journalId: journalId,
        schedule: {
          nextOccurrence: parsed.date,
        },
      } as IUpsertScrapsEntryCommand,
    });
  }

  function isFormValid() {
    return !!parsed.date && !!parsed.text && !!journalId;
  }
};

const Host = styled("div")``;

const ActionsContainer = styled("div")`
  padding-top: ${(p) => p.theme.spacing(2)};
  margin-top: ${(p) => p.theme.spacing(2)};
  border-top: 1px solid ${(p) => p.theme.palette.background.default};
  display: flex;
  flex-direction: row;
  justify-content: end;
`;
