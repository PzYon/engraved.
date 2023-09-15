import { MetricType } from "../serverApi/MetricType";
import { CounterMetricType } from "./CounterMetricType";
import { GaugeMetricType } from "./GaugeMetricType";
import { TimerMetricType } from "./TimerMetricType";
import { IMetricType } from "./IMetricType";
import { ScrapsMetricType } from "./ScrapsMetricType";

export class MetricTypeFactory {
  static create(type: MetricType): IMetricType {
    switch (type) {
      case MetricType.Counter:
        return new CounterMetricType();
      case MetricType.Gauge:
        return new GaugeMetricType();
      case MetricType.Timer:
        return new TimerMetricType();
      case MetricType.Scraps:
        return new ScrapsMetricType();
    }
  }
}
