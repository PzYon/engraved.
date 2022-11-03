﻿namespace Metrix.Core.Application.Queries.Metrics.GetThresholdValues;

public class GetThresholdValuesQuery : IQuery<IDictionary<string, IDictionary<string, ThresholdResult>>>
{
  public string? MetricId { get; set; }

  public DateTime? FromDate { get; set; }

  public DateTime? ToDate { get; set; }

  public IQueryExecutor<IDictionary<string, IDictionary<string, ThresholdResult>>> CreateExecutor()
  {
    return new GetThresholdValuesQueryExecutor(this);
  }
}
