import { GroupByAttributeSelector } from "../chart/grouping/GroupByAttributeSelector";
import React, { useEffect, useState } from "react";
import { IJournal } from "../../../serverApi/IJournal";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
} from "@mui/material";
import { AttributeValueSelector } from "../../common/AttributeValueSelector";

export enum ThresholdScope {
  Day = "Day",
  Month = "Month",
  Overall = "Overall",
}

export interface IThresholdDefinition {
  attributeKey: string;
  attributeValueKeys: string[];
  threshold: number;
  scope: ThresholdScope;
  key?: string;
}

// todo:
// - consider improving types
// - make sure that every combination can only be defined once in the GUI
// - fix serverside calculation - nothing has been done there yet

export const ThresholdRow: React.FC<{
  journal: IJournal;
  definition: IThresholdDefinition;
  onChange: (definition: IThresholdDefinition) => void;
  styles: React.CSSProperties;
}> = ({ journal, definition, onChange, styles }) => {
  const [attributeKey, setAttributeKey] = useState(
    definition?.attributeKey || "-",
  );
  const [attributeValueKeys, setAttributeValueKeys] = useState<string[]>(
    definition?.attributeValueKeys ?? [],
  );
  const [threshold, setThreshold] = useState(definition?.threshold ?? "");
  const [thresholdScope, setThresholdScope] = useState(
    definition?.scope ?? ThresholdScope.Month,
  );

  useEffect(() => {
    onChange({
      attributeKey,
      attributeValueKeys,
      threshold: Number(threshold),
      scope: ThresholdScope.Day,
    });
  }, [onChange, attributeKey, attributeValueKeys, threshold]);

  return (
    <Host sx={styles}>
      <GroupByAttributeSelector
        attributes={journal.attributes}
        onChange={setAttributeKey}
        selectedAttributeKey={attributeKey}
        label={"Attribute"}
      />
      {attributeKey ? (
        <AttributeValueSelector
          attribute={journal.attributes[attributeKey]}
          selectedValue={attributeValueKeys[0]}
          onChange={(attributesValues) => {
            setAttributeValueKeys(attributesValues);
          }}
        />
      ) : null}
      <FormControl
        margin={"normal"}
        sx={{ backgroundColor: "common.white", mt: 1 }}
      >
        <InputLabel id="threshold-scope-label">Scope</InputLabel>
        <Select
          id="threshold-scope"
          labelId="threshold-scope-label"
          label="Scope"
          value={thresholdScope as unknown as string}
          onChange={(event: SelectChangeEvent) => {
            setThresholdScope(event.target.value as unknown as ThresholdScope);
          }}
          sx={{ ".MuiSelect-select": { display: "flex" } }}
        >
          <MenuItem value={ThresholdScope.Day}>Day</MenuItem>
          <MenuItem value={ThresholdScope.Month}>Month</MenuItem>
          <MenuItem value={ThresholdScope.Overall}>Overall</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label={"Threshold Value"}
        type="number"
        defaultValue={threshold}
        onBlur={(event) => setThreshold(event.target.value)}
      />
    </Host>
  );
};

const Host = styled("div")`
  padding: ${(p) => p.theme.spacing(1)} 0;

  display: flex;
  align-items: center;

  & > div:not(:last-of-type) {
    margin-right: ${(p) => p.theme.spacing(1)};
  }

  .MuiFormControl-root,
  .MuiAutocomplete-root {
    width: 33%;
  }

  .MuiAutocomplete-root .MuiFormControl-root {
    width: 100%;
  }
`;
