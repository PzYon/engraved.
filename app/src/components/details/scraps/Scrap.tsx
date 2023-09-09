import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { IScrapMeasurement } from "../../../serverApi/IScrapMeasurement";
import { useAppContext } from "../../../AppContext";
import { Button } from "@mui/material";
import { ScrapInner } from "./ScrapInner";

import { ScrapWrapper } from "./ScrapWrapper";

export const Scrap: React.FC<{
  scrap: IScrapMeasurement;
  hideDate?: boolean;
  hideActions?: boolean;
  onSuccess?: () => void;
  style?: CSSProperties;
  addScrapWrapper: (scrapWrapper: ScrapWrapper) => void;
  index?: number;
}> = ({
  scrap: currentScrap,
  hideDate,
  hideActions,
  onSuccess,
  style,
  addScrapWrapper,
  index,
}) => {
  const { setAppAlert } = useAppContext();

  const [notes, setNotes] = useState<string>(currentScrap.notes);
  const [title, setTitle] = useState<string>(currentScrap.title);
  const [scrapToRender, setScrapToRender] = useState(currentScrap);

  const [isEditMode, setIsEditMode] = useState(!scrapToRender.id);

  const domElementRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (!addScrapWrapper) {
      return;
    }

    const scrapWrapper = new ScrapWrapper(currentScrap, () =>
      setIsEditMode(true)
    );

    scrapWrapper.setRef(domElementRef);
    addScrapWrapper(scrapWrapper);
  }, []);

  useEffect(() => {
    if (
      !currentScrap.editedOn ||
      currentScrap.editedOn === scrapToRender.editedOn ||
      (currentScrap.notes === notes && currentScrap.title === title)
    ) {
      return;
    }

    if (!isEditMode) {
      updateScrapInState();
      return;
    }

    setAppAlert({
      message: (
        <>
          <div>Would you like to update? Any changes will be lost.</div>
          <div style={{ margin: "8px 0" }}>
            <Button
              sx={{
                color: "common.white",
                border: "1px solid white;",
                marginRight: "10px",
              }}
              variant={"outlined"}
              onClick={() => {
                updateScrapInState();
                setAppAlert(null);
              }}
            >
              YES
            </Button>

            <Button
              sx={{
                color: "common.white",
                border: "1px solid white;",
                paddingRight: "10px",
              }}
              variant={"outlined"}
              onClick={() => {
                setAppAlert(null);
              }}
            >
              NO
            </Button>
          </div>
        </>
      ),
      type: "info",
      hideDurationSec: 2,
      title: "Scrap has changed...",
    });
  }, [currentScrap]);

  return (
    <div ref={domElementRef} tabIndex={index}>
      <ScrapInner
        scrap={scrapToRender}
        title={title}
        setTitle={setTitle}
        notes={notes}
        setNotes={setNotes}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        hideDate={hideDate}
        hideActions={hideActions}
        onSuccess={onSuccess}
        style={style}
      />
    </div>
  );

  function updateScrapInState() {
    setScrapToRender(currentScrap);
    setTitle(currentScrap.title);
    setNotes(currentScrap.notes);
  }
};
