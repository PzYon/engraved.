namespace Engraved.Core.Application.Queries.Activities.Get;

public class GetActivitiesQuery : IQuery<GetActivitiesQueryResult>
{
  public int? Limit { get; set; }

  public string? SearchText { get; set; }

  IQueryExecutor<GetActivitiesQueryResult> IQuery<GetActivitiesQueryResult>.CreateExecutor()
  {
    return new GetActivitiesQueryExecutor(this);
  }
}
