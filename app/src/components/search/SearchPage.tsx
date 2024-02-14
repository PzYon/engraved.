import React from "react";
import { Page } from "../layout/pages/Page";
import { PageTitle } from "../layout/pages/PageTitle";
import { Icon } from "../common/Icon";
import { SearchOutlined } from "@mui/icons-material";
import { GlobalSearch } from "./GlobalSearch";
import { FilterMode } from "../layout/pages/PageContext";
import { IconStyle } from "../common/IconStyle";

export const SearchPage: React.FC = () => {
  return (
    <Page
      pageType="search"
      title={
        <PageTitle
          title={"Search"}
          icon={
            <Icon style={IconStyle.PageTitle}>
              <SearchOutlined />
            </Icon>
          }
        />
      }
      filterMode={FilterMode.Text}
      showFilters={true}
      hideActions={true}
    >
      <GlobalSearch />
    </Page>
  );
};
