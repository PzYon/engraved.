﻿using Engraved.Core.Domain.Metrics;

namespace Engraved.Persistence.Mongo.DocumentTypes.Metrics;

public class ScrapsMetricDocument : MetricDocument
{
  public override MetricType Type => MetricType.Scraps;
}
