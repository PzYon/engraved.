﻿using Engraved.Core.Domain.Measurements;
using Engraved.Core.Domain.Metrics;
using Engraved.Core.Domain.Permissions;
using Engraved.Core.Domain.User;

namespace Engraved.Core.Application.Persistence.Demo;

public class UserScopedInMemoryRepository : IUserScopedRepository
{
  private readonly IRepository _repository;
  private readonly ICurrentUserService _currentUserService;

  public Lazy<IUser> CurrentUser { get; }

  public UserScopedInMemoryRepository(IRepository repository, ICurrentUserService currentUserService)
  {
    _repository = repository;
    _currentUserService = currentUserService;
    CurrentUser = new Lazy<IUser>(LoadUser);
  }

  public Task<IUser?> GetUser(string name)
  {
    return _repository.GetUser(name);
  }

  public Task<UpsertResult> UpsertUser(IUser user)
  {
    return _repository.UpsertUser(user);
  }

  public Task<IUser[]> GetUsers(string[] userIds)
  {
    return _repository.GetAllUsers();
  }

  public async Task<IUser[]> GetAllUsers()
  {
    return (await _repository.GetAllUsers())
      .Where(u => u.Id == CurrentUser.Value.Id)
      .ToArray();
  }

  public async Task<IMetric[]> GetAllMetrics()
  {
    IMetric[] allMetrics = await _repository.GetAllMetrics();
    return allMetrics
      .Where(m => m.UserId == CurrentUser.Value.Id)
      .ToArray();
  }

  public async Task<IMetric?> GetMetric(string metricId)
  {
    IMetric? metric = await _repository.GetMetric(metricId);
    return metric?.UserId == CurrentUser.Value.Id ? metric : null;
  }

  public async Task<IMeasurement[]> GetAllMeasurements(
      string metricId,
      DateTime? fromDate,
      DateTime? toDate,
      IDictionary<string, string[]>? attributeValues
    )
  {
    return (await _repository.GetAllMeasurements(metricId, fromDate, toDate, attributeValues))
      .Where(m => m.UserId == CurrentUser.Value.Id)
      .ToArray();
  }

  public Task<IMeasurement[]> GetNewestMeasurements(string[] metricIds, int limit)
  {
    return _repository.GetNewestMeasurements(metricIds, limit);
  }

  public Task<UpsertResult> UpsertMetric(IMetric metric)
  {
    metric.UserId = CurrentUser.Value.Id;
    return _repository.UpsertMetric(metric);
  }

  public async Task DeleteMetric(string metricId)
  {
    // get metric only returns if metric belongs to current user
    IMetric? metric = await GetMetric(metricId);

    if (metric == null)
    {
      return;
    }

    await _repository.DeleteMetric(metricId);
  }

  public async Task ModifyMetricPermissions(string metricId, Dictionary<string, PermissionKind> permissions)
  {
    IMetric? metric = await GetMetric(metricId);
    if (metric == null)
    {
      throw new Exception("Does not exist or no access");
    }

    await _repository.ModifyMetricPermissions(metricId, permissions);
  }

  public Task<UpsertResult> UpsertMeasurement<TMeasurement>(TMeasurement measurement) where TMeasurement : IMeasurement
  {
    measurement.UserId = CurrentUser.Value.Id;
    return _repository.UpsertMeasurement(measurement);
  }

  public async Task DeleteMeasurement(string measurementId)
  {
    // get measurement only returns if measurement belongs to current user
    IMeasurement? measurement = await GetMeasurement(measurementId);

    if (measurement == null)
    {
      return;
    }

    await _repository.DeleteMeasurement(measurementId);
  }

  public async Task<IMeasurement?> GetMeasurement(string measurementId)
  {
    IMeasurement? measurement = await _repository.GetMeasurement(measurementId);

    return measurement != null && measurement.UserId == CurrentUser.Value.Id
      ? measurement
      : null;
  }

  public Task WakeMeUp()
  {
    return Task.CompletedTask;
  }

  private IUser LoadUser()
  {
    string? name = _currentUserService.GetUserName();
    EnsureUserNameIsSet(name);

    IUser? result = _repository.GetUser(name!).Result;
    if (result == null)
    {
      throw new NotAllowedOperationException($"Current user '{name}' does not exist.");
    }

    return result;
  }

  private static void EnsureUserNameIsSet(string? name)
  {
    if (string.IsNullOrEmpty(name))
    {
      throw new NotAllowedOperationException($"Current user is not available.");
    }
  }
}
