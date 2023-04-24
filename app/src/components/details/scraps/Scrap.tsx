import React, { useEffect, useState } from "react";
import { FormatDate } from "../../common/FormatDate";
import { styled, TextField, Typography } from "@mui/material";
import { ContentCopyOutlined, DeleteOutlined } from "@mui/icons-material";
import { useUpsertMeasurementMutation } from "../../../serverApi/reactQuery/mutations/useUpsertMeasurementMutation";
import { MetricType } from "../../../serverApi/MetricType";
import {
  IScrapMeasurement,
  ScrapType,
} from "../../../serverApi/IScrapMeasurement";
import { IUpsertScrapsMeasurementCommand } from "../../../serverApi/commands/IUpsertScrapsMeasurementCommand";
import { engravedTheme } from "../../../theming/engravedTheme";
import { preloadLazyCodeMirror } from "./markdown/MarkdownEditor";
import { Actions } from "../../common/Actions";
import { useAppContext } from "../../../AppContext";
import { ScrapList } from "./list/ScrapList";
import { ScrapMarkdown } from "./markdown/ScrapMarkdown";

export type editModeKind = "off" | "fromTitle" | "fromBody";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const timers: { [scrapId: string]: any } = {};

export const Scrap: React.FC<{
  scrap: IScrapMeasurement;
  hideDate?: boolean;
}> = ({ scrap, hideDate }) => {
  const [notes, setNotes] = useState(scrap.notes);
  const [title, setTitle] = useState(scrap.title);

  const [editMode, setEditMode] = useState<editModeKind>(
    !scrap.id ? "fromTitle" : "off"
  );

  const upsertMeasurementMutation = useUpsertMeasurementMutation(
    scrap.metricId,
    MetricType.Scraps,
    scrap
  );

  useEffect(() => {
    preloadLazyCodeMirror();
  }, []);

  const { setAppAlert } = useAppContext();

  const isNew = editMode !== "off" || !scrap.id;

  return (
    <>
      <StyledTextField
        placeholder={"Title"}
        autoFocus={isNew}
        value={title}
        onChange={(event) => {
          clearTimeout(timers[scrap.id]);
          setTitle(event.target.value);
        }}
        onFocus={() => {
          clearTimeout(timers[scrap.id]);
          setEditMode("fromTitle");
        }}
        onBlur={onBlur}
        onClick={() => setEditMode("fromTitle")}
        sx={{ width: "100%" }}
      />

      {renderBody()}

      <FooterContainer>
        {hideDate ? null : (
          <Typography fontSize="small" component="span" sx={{ mr: 2 }}>
            {scrap.dateTime ? <FormatDate value={scrap.dateTime} /> : "now"}
          </Typography>
        )}

        <Actions
          actions={[
            {
              key: "copy",
              label: "Copy",
              icon: <ContentCopyOutlined fontSize="small" />,
              onClick: async () => {
                await navigator.clipboard.writeText(scrap.notes);
                setAppAlert({
                  type: "success",
                  title: "Successfully copied text to clipboard.",
                  hideDurationSec: 1,
                });
              },
            },
            {
              key: "delete",
              label: "Delete",
              icon: <DeleteOutlined fontSize="small" />,
              href: `measurements/${scrap.id}/delete`,
            },
          ]}
        />
      </FooterContainer>
    </>
  );

  function renderBody() {
    return scrap.scrapType === ScrapType.List
      ? renderListBody()
      : renderScrapBody();
  }

  function renderListBody() {
    return (
      <ScrapList
        value={notes}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    );
  }

  function renderScrapBody() {
    return (
      <ScrapMarkdown
        editMode={editMode}
        setEditMode={setEditMode}
        value={notes}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    );
  }

  function onFocus() {
    clearTimeout(timers[scrap.id]);
  }

  function onChange(value: string) {
    console.log("Scrap.tsx-onChange: " + value);

    clearTimeout(timers[scrap.id]);
    setNotes(value);
  }

  function onBlur() {
    clearTimeout(timers[scrap.id]);

    // we use a timeout here in order to let the browser have time to
    // move the focus to the next element
    timers[scrap.id] = setTimeout(async () => {
      console.log("Scrap.tsx-onBlur: ", notes);

      await upsertScrap();
      setEditMode("off");
    });
  }

  async function upsertScrap() {
    if (scrap.notes === notes && scrap.title === title) {
      return;
    }

    if (!notes) {
      return;
    }

    await upsertMeasurementMutation.mutate({
      command: {
        id: scrap?.id,
        scrapType: scrap.scrapType,
        notes: notes,
        title: title,
        metricAttributeValues: {},
        metricId: scrap.metricId,
        dateTime: new Date(),
      } as IUpsertScrapsMeasurementCommand,
    });
  }
};

const FooterContainer = styled("div")`
  display: flex;
  justify-content: end;
  align-items: center;
`;

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    input: {
      padding: 0,
      color: engravedTheme.palette.primary.main,
      fontSize: "larger",
    },
    fieldset: {
      borderWidth: 0,
    },
  },
});
