import React, { useState } from "react";
import { DateSelector } from "../../common/DateSelector";
import { useJournalContext } from "../JournalContext";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
} from "@mui/material";
import {
  createDateConditions,
  createNextDateConditions,
} from "./createDateConditions";
import { ActionIconButton } from "../../common/actions/ActionIconButton";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { DateRangeSelector } from "./DateRangeSelector";
import { journalDefaultUiSettings } from "../journalDefaultUiSettings";
import { DateRange } from "./DateRange";
import { sub } from "date-fns";
import { FiltersRow } from "./FiltersRow";

export type DateType = "relative" | "range";

export const DateFilters: React.FC = () => {
  const { dateConditions, setDateConditions } = useJournalContext();

  const [dateFilterConfig, setDateFilterConfig] = useState(
    journalDefaultUiSettings.dateFilter,
  );

  return (
    <>
      <FiltersRow>
        <FormControl margin={"normal"} sx={{ mt: 0 }}>
          <InputLabel id="date-type-label">Date filter type</InputLabel>
          <Select
            id="date-type"
            labelId="date-type-label"
            label="Date filter type"
            value={dateFilterConfig.dateType as unknown as string}
            onChange={(event: SelectChangeEvent) => {
              const type = event.target.value as unknown as DateType;

              setDateFilterConfig({
                dateType: type,
                value: type === "range" ? DateRange.All : 90,
              });
            }}
            sx={{ ".MuiSelect-select": { display: "flex" } }}
          >
            <MenuItem value="relative">Relative to now</MenuItem>
            <MenuItem value="range">Range</MenuItem>
          </Select>
        </FormControl>

        <RangeContainer>
          {dateFilterConfig.dateType === "range" ? (
            <DateRangeSelector
              dateRange={dateFilterConfig.value}
              onChange={onRangeChange}
            />
          ) : (
            <TextField
              label="Last n days"
              type="number"
              onBlur={(x) => {
                const now = new Date();

                setDateConditions({
                  from: sub(now, { days: Number(x.target.value) }),
                  to: now,
                });
              }}
            />
          )}
        </RangeContainer>
      </FiltersRow>

      <FiltersRow>
        <div style={{ flexShrink: 1 }}>
          <ActionIconButton
            action={{
              onClick: () =>
                setDateConditions(
                  createNextDateConditions(
                    "previous",
                    dateFilterConfig.value,
                    dateConditions,
                  ),
                ),
              icon: <ChevronLeft fontSize="small" />,
              label: "Previous",
              key: "go_left",
            }}
          />
          <ActionIconButton
            action={{
              onClick: () =>
                setDateConditions(
                  createNextDateConditions(
                    "next",
                    dateFilterConfig.value,
                    dateConditions,
                  ),
                ),
              icon: <ChevronRight fontSize="small" />,
              label: "Previous",
              key: "go_left",
            }}
          />
        </div>
        <DateSelector
          label="From"
          date={dateConditions?.from}
          setDate={(d) => {
            setDateConditions({ ...dateConditions, from: d });
            setDateFilterConfig({
              dateType: "range",
              value: DateRange.Custom,
            });
          }}
        />
        <DateSelector
          label="To"
          date={dateConditions?.to}
          setDate={(d) => {
            setDateConditions({ ...dateConditions, to: d });
            setDateFilterConfig({
              dateType: "range",
              value: DateRange.Custom,
            });
          }}
        />
      </FiltersRow>
    </>
  );

  function onRangeChange(range: DateRange): void {
    setDateFilterConfig({
      dateType: "range",
      value: range,
    });

    const conditions = createDateConditions(
      { dateType: "range", value: range },
      dateConditions.from ?? new Date(),
    );

    if (!conditions) {
      return;
    }

    setDateConditions(conditions);
  }
};

const RangeContainer = styled("div")`
  display: flex;
`;
