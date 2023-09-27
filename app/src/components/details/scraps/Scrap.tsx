import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IScrapMeasurement } from "../../../serverApi/IScrapMeasurement";
import { useAppContext } from "../../../AppContext";
import { Button, styled } from "@mui/material";
import { ScrapInner } from "./ScrapInner";
import { IUpsertScrapsMeasurementCommand } from "../../../serverApi/commands/IUpsertScrapsMeasurementCommand";
import { useUpsertMeasurementMutation } from "../../../serverApi/reactQuery/mutations/useUpsertMeasurementMutation";
import { MetricType } from "../../../serverApi/MetricType";
import { PageSection } from "../../layout/pages/PageSection";
import { ScrapItemWrapper } from "./ScrapItemWrapper";
import { Wrapper } from "../../common/wrappers/Wrapper";

export const Scrap: React.FC<{
  scrap: IScrapMeasurement;
  hideDate?: boolean;
  hideActions?: boolean;
  onSuccess?: () => void;
  style?: CSSProperties;
  addScrapWrapper?: (scrapWrapper: ScrapItemWrapper) => void;
  index?: number;
  withoutSection?: boolean;
  onClick?: () => void;
  hasFocus?: boolean;
}> = ({
  scrap: currentScrap,
  hideDate,
  hideActions,
  onSuccess,
  style,
  addScrapWrapper,
  index,
  withoutSection,
  onClick,
  hasFocus,
}) => {
  const { setAppAlert } = useAppContext();

  const [notes, setNotes] = useState<string>(currentScrap.notes);
  const [title, setTitle] = useState<string>(currentScrap.title);
  const [scrapToRender, setScrapToRender] = useState(currentScrap);

  const [isEditMode, setIsEditMode] = useState(!scrapToRender.id);

  const domElementRef = useRef<HTMLDivElement>();

  const upsertMeasurementMutation = useUpsertMeasurementMutation(
    currentScrap.metricId,
    MetricType.Scraps,
    currentScrap.id
  );

  const initialScrap = useMemo(() => {
    return currentScrap;
  }, []);

  const isDirty = useMemo(
    () => initialScrap.notes !== notes || initialScrap.title !== title,
    [initialScrap, notes, title]
  );

  useEffect(() => {
    if (!addScrapWrapper) {
      return;
    }

    addScrapWrapper(
      new ScrapItemWrapper(
        domElementRef,
        currentScrap,
        () => setIsEditMode(!isEditMode),
        upsertScrap
      )
    );
  }, [isDirty, isEditMode, currentScrap.editedOn]);

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

  const Container = withoutSection ? SimpleDiv : PageSection;

  return (
    <Wrapper ref={domElementRef} tabIndex={index} onClick={onClick}>
      <Container>
        <ScrapInner
          key={isEditMode.toString()}
          scrap={scrapToRender}
          title={title}
          setTitle={setTitle}
          notes={notes}
          setNotes={setNotes}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          hideDate={hideDate}
          hideActions={hideActions}
          upsertScrap={upsertScrap}
          style={style}
          cancelEditing={getCancelEditingFunction()}
          hasFocus={hasFocus}
        />
      </Container>
    </Wrapper>
  );

  function getCancelEditingFunction() {
    if (isEditMode && isDirty) {
      return function () {
        setScrapToRender(initialScrap);
        setTitle(initialScrap.title);
        setNotes(initialScrap.notes);
        setIsEditMode(false);
      };
    }

    return null;
  }

  function updateScrapInState() {
    setScrapToRender(currentScrap);
    setTitle(currentScrap.title);
    setNotes(currentScrap.notes);
  }

  async function upsertScrap() {
    if (currentScrap.notes === notes && currentScrap.title === title) {
      return;
    }

    if (!notes) {
      return;
    }

    await upsertMeasurementMutation.mutateAsync({
      command: {
        id: currentScrap?.id,
        scrapType: currentScrap.scrapType,
        notes: notes,
        title: title,
        metricAttributeValues: {},
        metricId: currentScrap.metricId,
        dateTime: new Date(),
      } as IUpsertScrapsMeasurementCommand,
    });

    onSuccess?.();
    setIsEditMode(false);
  }
};

const SimpleDiv = styled("div")``;
