import { MetricType } from "../serverApi/MetricType";
import React from "react";
import { IMetric } from "../serverApi/IMetric";
import { IMeasurementsTableColumnDefinition } from "../components/details/measurementsTable/IMeasurementsTableColumnDefinition";
import { IMeasurement } from "../serverApi/IMeasurement";

export interface IMetricType {
  type: MetricType;

  // consider: removing isGroupable as currently it is true everywhere.
  isGroupable?: boolean;

  getIcon(): React.ReactNode;

  getMeasurementsTableColumns(): IMeasurementsTableColumnDefinition[];

  getOverviewProperties(metric: IMetric): IMetricOverviewPropertyDefinition[];

  getYAxisLabel(metric: IMetric): string;

  getValueLabel?(value: number): string;

  getValue(measurement: IMeasurement): number;

  formatTotalValue?(totalValue: number): string;
}

export interface IMetricOverviewPropertyDefinition {
  node: React.ReactNode;
  label: string;
  key: string;
}
