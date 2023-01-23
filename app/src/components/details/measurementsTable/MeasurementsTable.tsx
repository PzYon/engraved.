import React, { useEffect, useMemo, useState } from "react";
import { IMeasurement } from "../../../serverApi/IMeasurement";
import { translations } from "../../../i18n/translations";
import { IMetric } from "../../../serverApi/IMetric";
import { MetricTypeFactory } from "../../../metricTypes/MetricTypeFactory";
import { AttributeValues } from "../../common/AttributeValues";
import { IMeasurementsTableColumnDefinition } from "./IMeasurementsTableColumnDefinition";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "@mui/material";
import { MeasurementActionButtons } from "./MeasurementActionButtons";
import { MetricType } from "../../../serverApi/MetricType";
import { ITimerMeasurement } from "../../../serverApi/ITimerMeasurement";
import { format } from "date-fns";
import { IMetricType } from "../../../metricTypes/IMetricType";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { IconButtonWrapper } from "../../common/IconButtonWrapper";
import { IMeasurementsTableGroup } from "./IMeasurementsTableGroup";
import { MeasurementsDateTableCell } from "./MeasurementsDateTableCell";
import { MeasurementsTableBodyGroup } from "./MeasurementsTableBodyGroup";

export const MeasurementsTable: React.FC<{
  metric: IMetric;
  measurements: IMeasurement[];
  showGroupTotals: boolean;
}> = ({ metric, measurements, showGroupTotals }) => {
  const type = useMemo(
    () => MetricTypeFactory.create(metric.type),
    [metric?.type]
  );

  const [collapseAll, setCollapseAll] = useState<boolean>(undefined);

  const columns = useMemo(() => {
    return [
      ...getColumnsBefore(metric, collapseAll, () =>
        setCollapseAll(!collapseAll)
      ),
      ...type.getMeasurementsTableColumns(),
      ...getColumnsAfter(metric),
    ].filter((c) => c.doHide?.(metric) !== true);
  }, [metric, collapseAll]);

  const [tableGroups, setTableGroups] = useState<IMeasurementsTableGroup[]>([]);

  useEffect(() => {
    updateGroups();

    const interval =
      type.type === MetricType.Timer ? setInterval(updateGroups, 10000) : null;

    return () => clearInterval(interval);
  }, [metric, measurements]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((c) => (
            <TableCell
              key={c.key}
              sx={c.width ? { width: c.width } : undefined}
            >
              {c.getHeaderReactNode(() => setCollapseAll(!collapseAll))}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {tableGroups.map((group, i) => (
          <MeasurementsTableBodyGroup
            key={group.label}
            group={group}
            columns={columns}
            showGroupTotals={showGroupTotals}
            isGroupCollapsed={
              collapseAll === undefined && i !== 0 ? true : collapseAll
            }
          />
        ))}
      </TableBody>
      {measurements.length && columns.filter((c) => c.isSummable).length ? (
        <TableFooter>
          <TableRow>
            {columns.map((c) => (
              <TableCell key={c.key}>
                {getTotalValue(c, tableGroups, type)}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      ) : null}
    </Table>
  );

  function updateGroups() {
    setTableGroups(getMeasurementsTableGroups(measurements, type));
  }
};

function getColumnsBefore(
  metric: IMetric,
  collapseAll: boolean,
  onHeaderClick: () => void
): IMeasurementsTableColumnDefinition[] {
  return [
    {
      getHeaderReactNode: () =>
        collapseAll ? (
          <IconButtonWrapper
            action={{
              key: "collapse",
              label: "Collapse all",
              onClick: onHeaderClick,
              icon: <ExpandLess fontSize="small" />,
            }}
          />
        ) : (
          <IconButtonWrapper
            action={{
              key: "collapse",
              label: "Collapse",
              onClick: onHeaderClick,
              icon: <ExpandMore fontSize="small" />,
            }}
          />
        ),
      key: "_collapse",
      width: "40px",
      getValueReactNode: (_, isFirstRowOfGroup, onClick) => {
        if (!isFirstRowOfGroup) {
          return null;
        }

        return (
          <IconButtonWrapper
            action={{
              key: "expand",
              label: "Expand",
              onClick: onClick,
              icon: <ExpandMore fontSize="small" />,
            }}
          />
        );
      },
      getGroupReactNode: (group, onClick) => (
        <IconButtonWrapper
          action={{
            key: "collapse",
            label: "Collapse",
            onClick: onClick,
            icon: <ExpandLess fontSize="small" />,
          }}
        />
      ),
    },
    {
      getHeaderReactNode: () => translations.columnName_date,
      key: "_date",
      getGroupReactNode: (group) => (
        <MeasurementsDateTableCell date={new Date(group.label)} />
      ),
      getValueReactNode: (measurement, isFirstRowOfGroup) =>
        isFirstRowOfGroup ? (
          <MeasurementsDateTableCell date={measurement.dateTime} />
        ) : null,
      getGroupKey: (measurement) => getGroupKey(metric.type, measurement),
    },
  ];
}

function getColumnsAfter(
  metric: IMetric
): IMeasurementsTableColumnDefinition[] {
  return [
    {
      getHeaderReactNode: () => translations.columnName_attributes,
      key: "_attributes",
      doHide: (metric: IMetric): boolean =>
        !Object.keys(metric.attributes ?? {}).length,
      getValueReactNode: (measurement) => (
        <AttributeValues
          attributes={metric.attributes}
          attributeValues={measurement.metricAttributeValues}
        />
      ),
    },
    {
      getHeaderReactNode: () => translations.columnName_notes,
      key: "_notes",
      getValueReactNode: (measurement) => measurement.notes,
    },
    {
      getHeaderReactNode: () => translations.columnName_actions,
      key: "_actions",
      width: "80px",
      getValueReactNode: (measurement) => (
        <MeasurementActionButtons
          measurement={measurement}
          metricId={metric.id}
        />
      ),
    },
  ];
}

function getMeasurementsTableGroups(
  measurements: IMeasurement[],
  type: IMetricType
): IMeasurementsTableGroup[] {
  const groupsByKey: { [groupKey: string]: IMeasurementsTableGroup } = {};

  for (const measurement of measurements) {
    const groupKey = getGroupKey(type.type, measurement);

    if (!groupsByKey[groupKey]) {
      groupsByKey[groupKey] = {
        label: groupKey,
        measurements: [],
        totalValue: 0,
        totalString: "0",
      };
    }

    groupsByKey[groupKey].measurements.push(measurement);

    const total = groupsByKey[groupKey].totalValue + type.getValue(measurement);

    groupsByKey[groupKey].totalValue = total;
    groupsByKey[groupKey].totalString = type.formatTotalValue
      ? type.formatTotalValue(total)
      : total.toString();
  }

  return Object.values(groupsByKey);
}

function getGroupKey(metricType: MetricType, measurement: IMeasurement) {
  const relevantDate =
    metricType === MetricType.Timer
      ? (measurement as ITimerMeasurement).startDate
      : measurement.dateTime;

  return format(new Date(relevantDate), "u-LL-dd");
}

function getTotalValue(
  columnDefinition: IMeasurementsTableColumnDefinition,
  tableGroups: IMeasurementsTableGroup[],
  type: IMetricType
) {
  if (!columnDefinition.isSummable) {
    return null;
  }

  const totalValue = tableGroups
    .map((g) => g.totalValue)
    .reduce((total, current) => total + current, 0);

  return type.formatTotalValue?.(totalValue) ?? totalValue;
}
