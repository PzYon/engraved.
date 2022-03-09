﻿using Metrix.Core.Application;
using Metrix.Core.Application.Commands.Measurements.Add;
using Metrix.Core.Application.Queries.Measurements.GetAll;
using Metrix.Core.Domain.Measurements;
using Microsoft.AspNetCore.Mvc;

namespace Metrix.Api.Controllers;

[ApiController]
[Route("api/measurements")]
public class MeasurementsController : ControllerBase
{
  private readonly Dispatcher _dispatcher;

  public MeasurementsController(Dispatcher dispatcher)
  {
    _dispatcher = dispatcher;
  }

  [HttpGet]
  public Measurement[] GetAll([FromQuery] string metricKey)
  {
    return _dispatcher.Query(new GetAllMeasurementsQuery { MetricKey = metricKey });
  }

  [HttpPost]
  public void Add([FromBody] AddMeasurementCommand measurement)
  {
    _dispatcher.Command(measurement);
  }
}
