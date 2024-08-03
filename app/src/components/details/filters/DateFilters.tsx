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

// todo:
// - naming (is "relative" and "range" good?)
// - "last n days" must grow

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
                const days = Number(x.target.value);

                setDateFilterConfig({
                  dateType: "relative",
                  value: days,
                });

                const now = new Date();

                setDateConditions({
                  from: sub(now, { days: days }),
                  to: now,
                });
              }}
            />
          )}
        </RangeContainer>
      </FiltersRow>

      <FiltersRow>
        <StepperContainer>
          <ActionIconButton
            action={{
              onClick: () =>
                setDateConditions(
                  createNextDateConditions(
                    "previous",
                    dateFilterConfig,
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
                    dateFilterConfig,
                    dateConditions,
                  ),
                ),
              icon: <ChevronRight fontSize="small" />,
              label: "Next",
              key: "go_left",
            }}
          />
        </StepperContainer>
        <PickerContainer>
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
        </PickerContainer>
        <PickerContainer>
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
        </PickerContainer>
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

const StepperContainer = styled("div")`
  flex-shrink: 1;
  display: flex;
  justify-content: center;
  height: 56px;
`;

const PickerContainer = styled("div")`
  flex-shrink: 2;
`;
