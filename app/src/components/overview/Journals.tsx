import React, { useMemo, useState } from "react";
import { usePageContext } from "../layout/pages/PageContext";
import { useJournalsQuery } from "../../serverApi/reactQuery/queries/useJournalsQuery";
import { NoResultsFound } from "../common/search/NoResultsFound";
import { JournalListItem } from "./JournalListItem";
import { useHotkeys } from "react-hotkeys-hook";
import { JournalWrapperCollection } from "./JournalWrapperCollection";

export const Journals: React.FC<{ favoritesOnly?: boolean }> = ({
  favoritesOnly,
}) => {
  const { searchText, journalTypes } = usePageContext();
  const journals = useJournalsQuery(searchText, journalTypes, favoritesOnly);

  const [focusIndex, setFocusIndex] = useState(-1);

  const collection = useMemo(
    () => new JournalWrapperCollection(focusIndex, setFocusIndex),
    [focusIndex],
  );

  useHotkeys("alt+up", () => {
    collection.moveFocusUp();
  });

  useHotkeys("alt+down", () => {
    collection.moveFocusDown();
  });

  const keyToken = useMemo(
    () => Math.random(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [journals],
  );

  if (!journals) {
    return null;
  }

  if (!journals.length && searchText) {
    return <NoResultsFound />;
  }

  return (
    <>
      {journals.map((journal, i) => (
        <JournalListItem
          key={journal.id + keyToken}
          journal={journal}
          addWrapper={(wrapper) => {
            collection.add(journal.id, wrapper);
          }}
          onClick={() => collection.setFocus(i)}
          index={i}
          isFocused={i === collection.currentIndex}
        />
      ))}
    </>
  );
};
