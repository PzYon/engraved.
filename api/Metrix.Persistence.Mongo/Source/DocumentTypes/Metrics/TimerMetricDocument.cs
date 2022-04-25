﻿using Metrix.Core.Domain.Metrics;

namespace Metrix.Persistence.Mongo.DocumentTypes.Metrics;

public class TimerMetricDocument : BaseMetricDocument
{
  public override MetricType Type => MetricType.Timer;

  public DateTime? StartDate { get; set; }
}
