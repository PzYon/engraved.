﻿using System.Security.Authentication;
using Metrix.Core.Application.Persistence;
using Metrix.Core.Domain.Measurements;
using Metrix.Core.Domain.Metrics;
using Metrix.Core.Domain.Permissions;
using Metrix.Core.Domain.User;
using Metrix.Persistence.Mongo.DocumentTypes;
using Metrix.Persistence.Mongo.DocumentTypes.Measurements;
using Metrix.Persistence.Mongo.DocumentTypes.Metrics;
using Metrix.Persistence.Mongo.DocumentTypes.Users;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace Metrix.Persistence.Mongo;

public class MongoRepository : IRepository
{
  private readonly IMongoCollection<MeasurementDocument> _measurements;
  private readonly IMongoCollection<MetricDocument> _metrics;
  private readonly IMongoCollection<UserDocument> _users;

  static MongoRepository()
  {
    // below stuff is required for polymorphic document types to work. it would
    // somehow be nicer if this handled by every document-class itself, but that
    // doesn't work for whatever reasons.
    BsonClassMap.RegisterClassMap<CounterMeasurementDocument>();
    BsonClassMap.RegisterClassMap<TimerMeasurementDocument>();
    BsonClassMap.RegisterClassMap<GaugeMeasurementDocument>();
    BsonClassMap.RegisterClassMap<CounterMetricDocument>();
    BsonClassMap.RegisterClassMap<TimerMetricDocument>();
    BsonClassMap.RegisterClassMap<GaugeMetricDocument>();
  }

  public MongoRepository(IMongoRepositorySettings settings)
  {
    IMongoClient client = CreateMongoClient(settings);
    IMongoDatabase? db = client.GetDatabase(settings.DatabaseName);

    _metrics = db.GetCollection<MetricDocument>(settings.MetricsCollectionName);
    _measurements = db.GetCollection<MeasurementDocument>(settings.MeasurementsCollectionName);
    _users = db.GetCollection<UserDocument>(settings.UsersCollectionName);
  }

  public virtual async Task<IUser?> GetUser(string? name)
  {
    if (string.IsNullOrEmpty(name))
    {
      throw new ArgumentNullException(nameof(name), "Username must be specified.");
    }

    UserDocument? document = await _users
      .Find(Builders<UserDocument>.Filter.Where(d => d.Name == name))
      .FirstOrDefaultAsync();

    return UserDocumentMapper.FromDocument(document);
  }

  public virtual async Task<UpsertResult> UpsertUser(IUser user)
  {
    return await UpsertUserInternal(user);
  }

  public async Task<IUser[]> GetUsers(params string[] userIds)
  {
    if (userIds.Length == 0)
    {
      return Array.Empty<IUser>();
    }

    List<UserDocument> users = await _users
      .Find(Builders<UserDocument>.Filter.Or(userIds.Distinct().Select(MongoUtil.GetDocumentByIdFilter<UserDocument>)))
      .ToListAsync();

    return users.Select(UserDocumentMapper.FromDocument).ToArray();
  }

  private async Task<UpsertResult> UpsertUserInternal(IUser user)
  {
    UserDocument document = UserDocumentMapper.ToDocument(user);

    IUser? existingUser = await GetUser(user.Name);
    if (existingUser != null && string.IsNullOrEmpty(user.Id))
    {
      throw new ArgumentException("ID must be specified for existing users.");
    }

    ReplaceOneResult replaceOneResult = await _users.ReplaceOneAsync(
      Builders<UserDocument>.Filter.Where(d => d.Name == user.Name),
      document,
      new ReplaceOptions { IsUpsert = true }
    );

    return CreateUpsertResult(user.Id, replaceOneResult);
  }

  public async Task<IUser[]> GetAllUsers()
  {
    List<UserDocument> users = await _users.Find(MongoUtil.GetAllDocumentsFilter<UserDocument>()).ToListAsync();
    return users.Select(UserDocumentMapper.FromDocument).ToArray();
  }

  public async Task<IMetric[]> GetAllMetrics()
  {
    List<MetricDocument> metrics = await _metrics
      .Find(GetAllMetricDocumentsFilter<MetricDocument>(PermissionKind.Read))
      .ToListAsync();

    return metrics.Select(MetricDocumentMapper.FromDocument<IMetric>).ToArray();
  }

  public async Task<IMetric?> GetMetric(string metricId)
  {
    return await GetMetric(metricId, PermissionKind.Read);
  }

  protected async Task<IMetric?> GetMetric(string metricId, PermissionKind permissionKind)
  {
    if (string.IsNullOrEmpty(metricId))
    {
      throw new ArgumentNullException(nameof(metricId), "Id must be specified.");
    }

    MetricDocument? document = await _metrics
      .Find(GetMetricDocumentByIdFilter<MetricDocument>(metricId, permissionKind))
      .FirstOrDefaultAsync();

    return MetricDocumentMapper.FromDocument<IMetric>(document);
  }

  private FilterDefinition<TDocument> GetMetricDocumentByIdFilter<TDocument>(string metricId, PermissionKind kind)
    where TDocument : IDocument
  {
    return Builders<TDocument>.Filter.And(
      GetAllMetricDocumentsFilter<TDocument>(kind),
      MongoUtil.GetDocumentByIdFilter<TDocument>(metricId)
    );
  }

  public async Task<IMeasurement[]> GetAllMeasurements(
    string metricId,
    DateTime? fromDate,
    DateTime? toDate,
    IDictionary<string, string[]>? attributeValues
  )
  {
    IMetric? metric = await GetMetric(metricId);
    if (metric == null)
    {
      return Array.Empty<IMeasurement>();
    }

    var filters = new List<FilterDefinition<MeasurementDocument>>
    {
      Builders<MeasurementDocument>.Filter.Where(d => d.MetricId == metricId)
    };

    if (fromDate.HasValue)
    {
      filters.Add(Builders<MeasurementDocument>.Filter.Where(d => d.DateTime >= fromDate.Value));
    }

    if (toDate.HasValue)
    {
      filters.Add(Builders<MeasurementDocument>.Filter.Where(d => d.DateTime <= toDate.Value));
    }

    if (attributeValues != null)
    {
      filters.AddRange(
        attributeValues
          .Select(
            attributeValue =>
              Builders<MeasurementDocument>.Filter.Or(
                attributeValue.Value.Select(
                  s => Builders<MeasurementDocument>.Filter.Where(
                    d => d.MetricAttributeValues[attributeValue.Key].Contains(s)
                  )
                )
              )
          )
      );
    }

    List<MeasurementDocument> measurements = await _measurements
      .Find(Builders<MeasurementDocument>.Filter.And(filters))
      .ToListAsync();

    return measurements
      .Select(MeasurementDocumentMapper.FromDocument<IMeasurement>)
      .ToArray();
  }

  public virtual async Task<UpsertResult> UpsertMetric(IMetric metric)
  {
    MetricDocument document = MetricDocumentMapper.ToDocument(metric);

    ReplaceOneResult replaceOneResult = await _metrics.ReplaceOneAsync(
      MongoUtil.GetDocumentByIdFilter<MetricDocument>(metric.Id),
      document,
      new ReplaceOptions { IsUpsert = true }
    );

    return CreateUpsertResult(metric.Id, replaceOneResult);
  }

  public async Task ModifyMetricPermissions(string metricId, Dictionary<string, PermissionKind> permissions)
  {
    IMetric? metric = await GetMetric(metricId);
    if (metric == null)
    {
      // should we throw here?
      return;
    }

    var permissionsEnsurer = new PermissionsEnsurer(this, UpsertUserInternal);
    await permissionsEnsurer.EnsurePermissions(metric, permissions);

    await UpsertMetric(metric);
  }

  public virtual async Task<UpsertResult> UpsertMeasurement<TMeasurement>(TMeasurement measurement)
    where TMeasurement : IMeasurement
  {
    MeasurementDocument document = MeasurementDocumentMapper.ToDocument(measurement);

    ReplaceOneResult replaceOneResult = await _measurements.ReplaceOneAsync(
      MongoUtil.GetDocumentByIdFilter<MeasurementDocument>(measurement.Id),
      document,
      new ReplaceOptions { IsUpsert = true }
    );

    return CreateUpsertResult(measurement.Id, replaceOneResult);
  }

  public async Task DeleteMeasurement(string measurementId)
  {
    await _measurements.DeleteOneAsync(MongoUtil.GetDocumentByIdFilter<MeasurementDocument>(measurementId));
  }

  public async Task<IMeasurement?> GetMeasurement(string measurementId)
  {
    if (string.IsNullOrEmpty(measurementId))
    {
      throw new ArgumentNullException(nameof(measurementId), "Id must be specified.");
    }

    MeasurementDocument? document = await _measurements
      .Find(MongoUtil.GetDocumentByIdFilter<MeasurementDocument>(measurementId))
      .FirstOrDefaultAsync();

    return MeasurementDocumentMapper.FromDocument<IMeasurement>(document);
  }

  protected virtual FilterDefinition<TDocument> GetAllMetricDocumentsFilter<TDocument>(PermissionKind kind)
    where TDocument : IDocument
  {
    return MongoUtil.GetAllDocumentsFilter<TDocument>();
  }

  private static UpsertResult CreateUpsertResult(string? entityId, ReplaceOneResult replaceOneResult)
  {
    string id = (string.IsNullOrEmpty(entityId)
      ? replaceOneResult.UpsertedId.ToString()
      : entityId)!;

    return new UpsertResult
    {
      EntityId = id
    };
  }

  private static IMongoClient CreateMongoClient(IMongoRepositorySettings settings)
  {
    MongoClientSettings clientSettings = MongoClientSettings.FromUrl(new MongoUrl(settings.MongoDbConnectionString));
    clientSettings.SslSettings = new SslSettings { EnabledSslProtocols = SslProtocols.Tls12 };

    return new MongoClient(clientSettings);
  }
}
