﻿using System.Collections.Generic;
using Metrix.Core.Application.Persistence;
using Metrix.Core.Domain.Measurements;
using Metrix.Core.Domain.Metrics;

namespace Metrix.Core.Application.Commands.Measurements.Add;

internal class TestDb : IDb
{
  public List<BaseMeasurement> Measurements { get; } = new();

  public List<Metric> Metrics { get; } = new();
}
