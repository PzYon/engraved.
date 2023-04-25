import React, { useEffect, useState } from "react";
import { ClickAwayListener, styled, TextField } from "@mui/material";
import { useUpsertMeasurementMutation } from "../../../serverApi/reactQuery/mutations/useUpsertMeasurementMutation";
import { MetricType } from "../../../serverApi/MetricType";
import {
  IScrapMeasurement,
  ScrapType,
} from "../../../serverApi/IScrapMeasurement";
import { IUpsertScrapsMeasurementCommand } from "../../../serverApi/commands/IUpsertScrapsMeasurementCommand";
import { preloadLazyCodeMirror } from "./markdown/MarkdownEditor";
import { ScripListBody } from "./list/ScrapListBody";
import { ScrapMarkdownBody } from "./markdown/ScrapMarkdownBody";

export const Scrap: React.FC<{
  scrap: IScrapMeasurement;
  hideDate?: boolean;
}> = ({ scrap, hideDate }) => {
  const [notes, setNotes] = useState(scrap.notes);
  const [title, setTitle] = useState(scrap.title);

  const [isEditMode, setIsEditMode] = useState(!scrap.id);
  const [hasTitleFocus, setHasTitleFocus] = useState(false);

  useEffect(() => {
    preloadLazyCodeMirror();
  }, []);

  useEffect(() => {
    if (!isEditMode && notes !== scrap.notes) {
      upsertScrap();
    }
  }, [isEditMode]);

  const upsertMeasurementMutation = useUpsertMeasurementMutation(
    scrap.metricId,
    MetricType.Scraps,
    scrap
  );

  return (
    <ClickAwayListener onClickAway={() => setIsEditMode(false)}>
      <div
        onClick={(e) => {
          if (e.detail === 2) {
            setIsEditMode(true);
          }
        }}
      >
        <StyledTextField
          placeholder={"Title"}
          value={title}
          disabled={!isEditMode}
          onChange={(event) => setTitle(event.target.value)}
          onFocus={() => setHasTitleFocus(true)}
          onBlur={() => setHasTitleFocus(false)}
          sx={{ width: "100%" }}
        />
        {scrap.scrapType === ScrapType.List ? (
          <ScripListBody
            scrap={scrap}
            hideDate={hideDate}
            editMode={isEditMode}
            hasTitleFocus={hasTitleFocus}
            value={notes}
            onChange={onChange}
          />
        ) : (
          <ScrapMarkdownBody
            scrap={scrap}
            hideDate={hideDate}
            editMode={isEditMode}
            value={notes}
            onChange={onChange}
          />
        )}
      </div>
    </ClickAwayListener>
  );

  function onChange(value: string) {
    setNotes(value);
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

const StyledTextField = styled(TextField)`
  input {
    padding: 0;
    font-size: larger;
    color: ${(p) => p.theme.palette.primary.main} !important;
    -webkit-text-fill-color: ${(p) => p.theme.palette.primary.main} !important;
  }

  fieldset {
    border-width: 0;
  }
`;
