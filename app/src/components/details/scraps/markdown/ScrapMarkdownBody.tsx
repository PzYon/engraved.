import React from "react";
import { IScrapMeasurement } from "../../../../serverApi/IScrapMeasurement";
import { useAppContext } from "../../../../AppContext";
import { ScrapBody } from "../ScrapBody";
import { ContentCopyOutlined } from "@mui/icons-material";
import { ScrapMarkdown } from "./ScrapMarkdown";

export const ScrapMarkdownBody: React.FC<{
  scrap: IScrapMeasurement;
  hideDate: boolean;
  hideActions?: boolean;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}> = ({
  scrap,
  hideDate,
  hideActions,
  editMode,
  setEditMode,
  value,
  onChange,
  onSave,
}) => {
  const { setAppAlert } = useAppContext();

  return (
    <ScrapBody
      scrap={scrap}
      editMode={editMode}
      setEditMode={setEditMode}
      hideDate={hideDate}
      hideActions={hideActions}
      onSave={onSave}
      actions={[
        {
          key: "copy",
          label: "Copy",
          icon: <ContentCopyOutlined fontSize="small" />,
          onClick: async () => {
            await navigator.clipboard.writeText(value);
            setAppAlert({
              type: "success",
              title: "Successfully copied text to clipboard.",
              hideDurationSec: 1,
            });
          },
        },
      ]}
    >
      <ScrapMarkdown isEditMode={editMode} value={value} onChange={onChange} />
    </ScrapBody>
  );
};
