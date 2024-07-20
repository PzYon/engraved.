import { IAction } from "../../common/actions/IAction";
import { IPageTab } from "../tabs/IPageTab";
import { FilterMode, PageContext } from "./PageContext";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { JournalType } from "../../../serverApi/JournalType";
import { useCustomSearchParams } from "../../common/actions/itemActionHook";

export const PageContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramSearchText = searchParams?.get("q") ?? "";
  const paramJournalTypes = searchParams?.get("journalTypes");

  const asdf = useCustomSearchParams();

  const [title, setTitle] = useState<React.ReactNode>(undefined);
  const [subTitle, setSubTitle] = useState<React.ReactNode>(undefined);
  const [documentTitle, setDocumentTitle] = useState<string>(undefined);
  const [hideActions, setHideActions] = useState(false);
  const [pageActions, setPageActions] = useState<IAction[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.None);
  const [tabs, setTabs] = useState<IPageTab[]>([]);

  useEffect(() => {
    setUrlParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramSearchText, paramJournalTypes, searchParams, setSearchParams]);

  useEffect(() => {
    document.title = [
      documentTitle,
      paramSearchText ? `Search '${paramSearchText}'` : null,
      "engraved.",
    ]
      .filter((v) => v)
      .join(" | ");
  }, [documentTitle, paramSearchText]);

  const contextValue = useMemo(() => {
    return {
      documentTitle,
      setDocumentTitle,
      title,
      setTitle,
      subTitle,
      setSubTitle,
      pageActions,
      setPageActions,
      hideActions,
      setHideActions,
      filterMode,
      setFilterMode,
      showFilters,
      setShowFilters,
      searchText: paramSearchText,
      setSearchText: (value: string) => {
        setUrlParams({ searchText: value });
      },
      journalTypes: getJournalTypes(),
      setJournalTypes: (value: JournalType[]) => {
        setUrlParams({ journalTypes: value });
      },
      tabs,
      setTabs,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    subTitle,
    documentTitle,
    pageActions,
    hideActions,
    showFilters,
    filterMode,
    paramSearchText,
    paramJournalTypes,
    searchParams,
    tabs,
  ]);

  return (
    <PageContext.Provider value={contextValue}>{children}</PageContext.Provider>
  );

  function setUrlParams(overrides?: {
    searchText?: string;
    journalTypes?: JournalType[];
  }) {
    const params: {
      q?: string;
      journalTypes?: string;
    } = {
      q: overrides?.searchText ?? paramSearchText,
      journalTypes: (overrides?.journalTypes ?? getJournalTypes()).join(","),
    };

    asdf.append(params);
  }

  function getJournalTypes(): JournalType[] {
    return (
      (paramJournalTypes?.split(",").filter((j) => j) as JournalType[]) ?? []
    );
  }
};
