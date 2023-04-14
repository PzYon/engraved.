import { MetricType } from "../serverApi/MetricType";
import { DynamicFeedOutlined } from "@mui/icons-material";
import { IMetricType } from "./IMetricType";
import { IMeasurementsTableColumnDefinition } from "../components/details/measurementsTable/IMeasurementsTableColumnDefinition";
import { IMetric } from "../serverApi/IMetric";
import { IMeasurement } from "../serverApi/IMeasurement";
import React from "react";
import { Activity } from "./Activity";
import { Scrap } from "../components/details/notes/scraps/Scrap";
import { IScrapMeasurement } from "../serverApi/IScrapMeasurement";

export class ScrapsMetricType implements IMetricType {
  type = MetricType.Scraps;

  getIcon() {
    return <DynamicFeedOutlined style={{ backgroundColor: "E6CCFF" }} />;
  }

  getActivity(metric: IMetric, measurement: IMeasurement): React.ReactNode {
    return (
      <Activity metric={metric} measurement={measurement}>
        <Scrap scrap={measurement as IScrapMeasurement} />
      </Activity>
    );
  }

  getMeasurementsTableColumns(): IMeasurementsTableColumnDefinition[] {
    throw new Error(
      "getMeasurementsTableColumns is currently not supported for Scraps."
    );
  }

  getValue(): number {
    throw new Error("getValue is currently not supported for Scraps.");
  }

  getYAxisLabel(): string {
    throw new Error("getYAxisLabel is currently not supported for Scraps.");
  }
}
