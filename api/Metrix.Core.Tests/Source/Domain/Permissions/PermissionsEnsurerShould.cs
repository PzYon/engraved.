﻿using System.Collections.Generic;
using System.Threading.Tasks;
using Metrix.Core.Application.Persistence;
using Metrix.Core.Application.Persistence.Demo;
using NUnit.Framework;

namespace Metrix.Core.Domain.Permissions;

public class PermissionsEnsurerShould
{
  private static IRepository _repository = null!;
  private PermissionsEnsurer _permissionsEnsurer = null!;

  [SetUp]
  public void SetUp()
  {
    _repository = new InMemoryRepository
    {
      Users =
      {
        new User.User
        {
          Id = "123",
          Name = "mar@foo.ch",
          DisplayName = "Mar Dog"
        }
      }
    };

    _permissionsEnsurer = new PermissionsEnsurer(_repository, _repository.UpsertUser);
  }

  [Test]
  public async Task RemovePermissions_When_None()
  {
    var holder = new TestPermissionHolder
    {
      Permissions = new UserPermissions { { "123", new PermissionDefinition { Kind = PermissionKind.Read } } }
    };

    await _permissionsEnsurer.EnsurePermissions(
      holder,
      new Dictionary<string, PermissionKind> { { "mar@foo.ch", PermissionKind.None } }
    );

    Assert.AreEqual(0, holder.Permissions.Count);
  }

  [Test]
  public async Task ChangePermissions_When_AlreadySet()
  {
    var holder = new TestPermissionHolder
    {
      Permissions = new UserPermissions { { "123", new PermissionDefinition { Kind = PermissionKind.Read } } }
    };

    await _permissionsEnsurer.EnsurePermissions(
      holder,
      new Dictionary<string, PermissionKind> { { "mar@foo.ch", PermissionKind.Write } }
    );

    Assert.AreEqual(1, holder.Permissions.Count);
    Assert.AreEqual(PermissionKind.Write, holder.Permissions["123"].Kind);
  }

  [Test]
  public async Task AddPermissions_When_NotThereYet()
  {
    var holder = new TestPermissionHolder
    {
      Permissions = new UserPermissions { { "123", new PermissionDefinition { Kind = PermissionKind.Read } } }
    };

    await _permissionsEnsurer.EnsurePermissions(
      holder,
      new Dictionary<string, PermissionKind> { { "bar@foo.ch", PermissionKind.Read } }
    );

    Assert.AreEqual(2, holder.Permissions.Count);
  }
}

public class TestPermissionHolder : IPermissionHolder
{
  public UserPermissions Permissions { get; set; } = null!;
}
