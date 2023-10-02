import React, { useEffect, useMemo, useState } from "react";
import { Scrap } from "./Scrap";
import {
  CheckBoxOutlined,
  FormatAlignLeftOutlined,
  SelfImprovementOutlined,
} from "@mui/icons-material";
import { useJournalContext } from "../JournalDetailsContext";
import { JournalPageTitle } from "../JournalPageTitle";
import { getCommonActions } from "../../overview/getCommonActions";
import { Page } from "../../layout/pages/Page";
import { IScrapEntry, ScrapType } from "../../../serverApi/IScrapEntry";
import { Route, Routes } from "react-router-dom";
import { DeleteEntryLauncher } from "../edit/DeleteEntryLauncher";
import { ScrapsJournalType } from "../../../journalTypes/ScrapsJournalType";
import { GenericEmptyPlaceholder } from "../../common/search/GenericEmptyPlaceholder";
import { useHotkeys } from "react-hotkeys-hook";
import { ScrapWrapperCollection } from "./ScrapWrapperCollection";
import { IAction } from "../../common/actions/IAction";

export const ScrapsViewPage: React.FC = () => {
  const { journal, entries: scraps, setDateConditions } = useJournalContext();

  const [newScrap, setNewScrap] = useState<IScrapEntry>(null);

  useEffect(() => {
    // we need to set date conditions in order for data to be loaded
    setDateConditions({});
  }, []);

  useEffect(() => {
    setNewScrap(null);
  }, [scraps]);

  const keyToken = useMemo(() => {
    return Math.random();
  }, [scraps]);

  const [focusIndex, setFocusIndex] = useState(-1);

  const collection = useMemo(
    () => new ScrapWrapperCollection(focusIndex, setFocusIndex),
    [scraps],
  );

  // alt+s (save) is handled by code mirror resp. list

  useHotkeys("alt+up", () => {
    collection.moveFocusUp();
  });

  useHotkeys("alt+down", () => {
    collection.moveFocusDown();
  });

  if (!scraps || !journal) {
    return;
  }

  return (
    <Page
      title={<JournalPageTitle journal={journal} />}
      documentTitle={journal.name}
      actions={[
        getAddNewAction("markdown"),
        getAddNewAction("list"),
        null,
        ...getCommonActions(journal, false),
      ]}
    >
      {newScrap ? <Scrap key="new" scrap={newScrap} /> : null}

      {scraps.length
        ? (scraps as IScrapEntry[]).map((scrap, i) => (
            <Scrap
              key={scrap.id + keyToken}
              onClick={() => collection.setFocus(i)}
              addScrapWrapper={(scrapWrapper) =>
                collection.add(scrap.id, scrapWrapper)
              }
              scrap={scrap}
              index={i}
              hasFocus={i === focusIndex}
            />
          ))
        : null}

      {!scraps.length && !newScrap ? (
        <GenericEmptyPlaceholder
          icon={SelfImprovementOutlined}
          message={"Nothing here..."}
        />
      ) : null}

      <Routes>
        <Route
          path="/entries/:entryId/delete"
          element={<DeleteEntryLauncher journal={journal} />}
        />
      </Routes>
    </Page>
  );

  function getAddNewAction(type: "markdown" | "list"): IAction {
    const isMarkdown = type === "markdown";

    return {
      hotkey: isMarkdown ? "alt+m" : "alt+l",
      key: "add-scrap-" + type,
      label: "Add " + type,
      icon: isMarkdown ? <MarkdownScrapIcon /> : <ListScrapIcon />,
      onClick: () => {
        setNewScrap(
          ScrapsJournalType.createBlank(
            journal.id,
            isMarkdown ? ScrapType.Markdown : ScrapType.List,
          ),
        );
      },
    };
  }
};

export const MarkdownScrapIcon = () => {
  return <FormatAlignLeftOutlined fontSize="small" />;
};

export const ListScrapIcon = () => {
  return <CheckBoxOutlined fontSize="small" />;
};
