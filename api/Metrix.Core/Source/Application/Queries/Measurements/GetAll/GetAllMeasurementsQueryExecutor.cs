using Metrix.Core.Application.Persistence;
using Metrix.Core.Domain.Measurements;

namespace Metrix.Core.Application.Queries.Measurements.GetAll;

public class GetAllMeasurementsQueryExecutor : IQueryExecutor<Measurement[]>
{
  private readonly GetAllMeasurementsQuery _query;

  public GetAllMeasurementsQueryExecutor(GetAllMeasurementsQuery query)
  {
    _query = query;
  }

  public Measurement[] Execute(IDb db)
  {
    return db.Measurements
      .Where(m => m.MetricKey == _query.MetricKey)
      .OrderBy(m => m.DateTime)
      .ToArray();
  }
}
