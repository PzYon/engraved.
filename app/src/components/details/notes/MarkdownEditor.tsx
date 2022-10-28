import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { Button, styled } from "@mui/material";
import React, { useState } from "react";
import { ServerApi } from "../../../serverApi/ServerApi";
import { IMetric } from "../../../serverApi/IMetric";
import { useAppContext } from "../../../AppContext";
import { useNavigate } from "react-router-dom";

export const MarkdownEditor: React.FC<{
  metric: IMetric;
  onSaved: (notes: string) => void;
}> = ({ metric, onSaved }) => {
  const navigate = useNavigate();

  const { setAppAlert } = useAppContext();

  const [notes, setNotes] = useState(metric.notes ?? "");

  return (
    <>
      <CodeMirror
        value={notes}
        extensions={[markdown({})]}
        onChange={(value) => setNotes(value)}
      />
      <ButtonContainer>
        <Button variant="outlined" onClick={saveNote}>
          Save
        </Button>
      </ButtonContainer>
    </>
  );

  function saveNote() {
    ServerApi.editMetric(
      metric.id,
      metric.name,
      metric.description,
      notes,
      metric.attributes
    )
      .then(() => {
        setAppAlert({
          title: "Saved metric",
          type: "success",
        });

        onSaved(notes);

        navigate("..");
      })
      .catch((e) => {
        setAppAlert({
          title: "Failed to edit metric",
          message: e.message,
          type: "error",
        });
      });
  }
};

const ButtonContainer = styled("div")`
  text-align: right;
  margin-top: ${(p) => p.theme.spacing(2)};
`;
