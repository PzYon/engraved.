﻿using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Metrix.Core.Application.Persistence;
using Metrix.Core.Domain.Measurements;
using Metrix.Core.Domain.Metrics;

namespace Metrix.Core.Application.Commands.Measurements.Add;

internal class TestRepository : IRepository
{
  public List<IMeasurement> Measurements { get; } = new();

  public List<IMetric> Metrics { get; } = new();

  public Task<IMetric[]> GetAllMetrics()
  {
    return Task.FromResult(Metrics.ToArray());
  }

  public Task<IMetric?> GetMetric(string metricKey)
  {
    return Task.FromResult(Metrics.FirstOrDefault(m => m.Key == metricKey));
  }

  public Task<IMeasurement[]> GetAllMeasurements(string metricKey)
  {
    return Task.FromResult(Measurements.Where(m => m.MetricKey == metricKey).ToArray());
  }

  public Task AddMetric(IMetric metric)
  {
    Metrics.Add(metric);
    return Task.CompletedTask;
  }

  public Task UpdateMetric(IMetric metric)
  {
    // nothing to do here as metric is updated by reference and
    // hence implicitly updated in "List<IMetric> Metrics"

    return Task.CompletedTask;
  }

  public Task UpsertMeasurement<TMeasurement>(TMeasurement measurement) where TMeasurement : IMeasurement
  {
    RemoveMeasurement(measurement);

    Measurements.Add(measurement);

    return Task.CompletedTask;
  }

  private void RemoveMeasurement<TMeasurement>(TMeasurement measurement) where TMeasurement : IMeasurement
  {
    if (string.IsNullOrEmpty(measurement.Id))
    {
      return;
    }

    IMeasurement? firstOrDefault = Measurements.FirstOrDefault(m => m.Id == measurement.Id);
    if (firstOrDefault == null)
    {
      return;
    }

    Measurements.Remove(firstOrDefault);
  }
}
