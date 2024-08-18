﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Engraved.Core.Application.Persistence;
using Engraved.Core.Application.Persistence.Demo;
using Engraved.Core.Application.Queries.Journals.GetThresholdValues;
using Engraved.Core.Domain.Entries;
using Engraved.Core.Domain.Journals;
using Engraved.Core.Domain.Users;
using FluentAssertions;
using NUnit.Framework;

namespace Engraved.Core.Application.Queries.Journals;

public class GetThresholdValuesQueryExecutorShould
{
  private const string JournalId = "journal-id";

  private InMemoryRepository _testRepository = null!;
  private string _userId = null!;
  private UserScopedInMemoryRepository _userScopedInMemoryRepository = null!;

  [SetUp]
  public async Task SetUp()
  {
    _testRepository = new InMemoryRepository();

    UpsertResult upsertResult = await _testRepository.UpsertUser(new User { Name = "max" });
    _userId = upsertResult.EntityId;

    _userScopedInMemoryRepository = new UserScopedInMemoryRepository(
      _testRepository,
      new FakeCurrentUserService("max")
    );
  }

  [Test]
  public async Task CountThresholds()
  {
    _testRepository.Journals.Add(
      new GaugeJournal
      {
        UserId = _userId,
        Id = JournalId,
        Attributes = new Dictionary<string, JournalAttribute>
        {
          {
            "colors",
            new JournalAttribute
            {
              Name = "Colors",
              Values = new Dictionary<string, string> { { "blue", "Blue" }, { "green", "Green" } }
            }
          }
        },
        Thresholds = new Dictionary<string, Dictionary<string, ThresholdDefinition>>
        {
          {
            "colors",
            new Dictionary<string, ThresholdDefinition>
            {
              { "green", new ThresholdDefinition { Value = 3 } },
              { "blue", new ThresholdDefinition { Value = 6 } }
            }
          },
          {
            "-",
            new Dictionary<string, ThresholdDefinition> { { "-", new ThresholdDefinition { Value = 5 } } }
          }
        }
      }
    );

    AddEntry(2, "blue");
    AddEntry(5, "blue");
    AddEntry(4, "green");
    AddEntry(3, "blue");

    var query = new GetThresholdValuesQuery
    {
      FromDate = DateTime.UtcNow.AddHours(-1),
      ToDate = DateTime.UtcNow.AddHours(1),
      JournalId = JournalId
    };

    IDictionary<string, IDictionary<string, ThresholdResult>> results =
      await new GetThresholdValuesQueryExecutor(_userScopedInMemoryRepository).Execute(query);

    results.Should().NotBeNull();

    results.Should().ContainKey("colors");

    IDictionary<string, ThresholdResult> globalThresholds = results["-"];
    globalThresholds.Should().NotBeNull();
    globalThresholds.Count.Should().Be(1);

    globalThresholds.Should().ContainKey("-");
    globalThresholds["-"].ActualValue.Should().Be(14);
    globalThresholds["-"].ThresholdDefinition.Value.Should().Be(5);

    IDictionary<string, ThresholdResult> colorsThresholds = results["colors"];
    colorsThresholds.Should().NotBeNull();
    colorsThresholds.Count.Should().Be(2);

    colorsThresholds.Should().ContainKey("blue");
    colorsThresholds["blue"].ActualValue.Should().Be(10);
    colorsThresholds["blue"].ThresholdDefinition.Value.Should().Be(6);

    colorsThresholds.Should().ContainKey("green");
    colorsThresholds["green"].ActualValue.Should().Be(4);
    colorsThresholds["green"].ThresholdDefinition.Value.Should().Be(3);
  }

  private void AddEntry(int value, string attributeValueKey)
  {
    _testRepository.Entries.Add(
      new GaugeEntry
      {
        UserId = _userId,
        ParentId = JournalId,
        DateTime = DateTime.UtcNow,
        Value = value,
        JournalAttributeValues = new Dictionary<string, string[]> { { "colors", [attributeValueKey] } }
      }
    );
  }
}
