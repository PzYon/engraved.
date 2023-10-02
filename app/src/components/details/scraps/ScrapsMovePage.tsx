import React, { useEffect, useState } from "react";
import { JournalType } from "../../../serverApi/JournalType";
import { useJournalsQuery } from "../../../serverApi/reactQuery/queries/useJournalsQuery";
import { Page } from "../../layout/pages/Page";
import {
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useMoveEntryMutation } from "../../../serverApi/reactQuery/mutations/useMoveEntryMutation";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { usePageContext } from "../../layout/pages/PageContext";
import { PageSection } from "../../layout/pages/PageSection";
import { PageFormButtonContainer } from "../../common/FormButtonContainer";
import { Scrap } from "./Scrap";
import { useJournalContext } from "../JournalDetailsContext";
import { IScrapEntry } from "../../../serverApi/IScrapEntry";
import { SearchBox } from "../../common/search/SearchBox";
import { DeviceWidth, useDeviceWidth } from "../../common/useDeviceWidth";
import { FiltersColumn, FiltersRow } from "../filters/FiltersRow";

export const ScrapsMovePage: React.FC = () => {
  const { setSubTitle } = usePageContext();

  const { entries } = useJournalContext();

  const [targetJournalId, setTargetJournalId] = useState<string>(undefined);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

  const { entryId, journalId } = useParams();
  const mutation = useMoveEntryMutation(entryId, journalId, () =>
    navigate(`/journals/${targetJournalId}`),
  );

  useEffect(() => setSubTitle("Move scrap to..."), []);

  const journals = useJournalsQuery(searchText, [JournalType.Scraps]);

  const deviceWidth = useDeviceWidth();
  const Row = deviceWidth === DeviceWidth.Small ? FiltersColumn : FiltersRow;

  return (
    <Page subTitle="Move scrap to..." actions={[]}>
      <PageSection>
        <Row>
          <SearchBox searchText={searchText} setSearchText={setSearchText} />
        </Row>
        {journals?.length ? (
          <List dense={true}>
            {journals
              .filter((m) => m.id !== journalId)
              .map((m) => {
                const isChecked = targetJournalId === m.id;
                return (
                  <ListItem key={m.id} sx={{ padding: 0 }}>
                    <ListItemButton
                      role={undefined}
                      onClick={() => {
                        setTargetJournalId(isChecked ? undefined : m.id);
                      }}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isChecked}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText>{m.name}</ListItemText>
                    </ListItemButton>
                  </ListItem>
                );
              })}
          </List>
        ) : null}
      </PageSection>

      {targetJournalId ? (
        <PageSection>
          <PageFormButtonContainer style={{ paddingTop: 0 }}>
            <Button
              variant="contained"
              onClick={() => {
                mutation.mutate({ targetJournalId: targetJournalId });
              }}
            >
              Move
            </Button>
          </PageFormButtonContainer>
        </PageSection>
      ) : null}

      <Scrap
        scrap={entries.find((m) => m.id === entryId) as IScrapEntry}
        hideActions={true}
      />
    </Page>
  );
};
