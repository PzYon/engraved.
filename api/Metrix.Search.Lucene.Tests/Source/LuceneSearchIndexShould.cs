using System.Collections.Generic;
using System.Linq;
using Metrix.Core.Application.Search;
using NUnit.Framework;

namespace Metrix.Search.Lucene;

public class LuceneSearchIndexShould
{
  [Test]
  public void MatchSingleTerm()
  {
    List<SearchResult> search = new LuceneSearchIndex().Search(
      "red",
      GetSimpleValues().ToArray()
    );

    Assert.IsNotEmpty(search);
    Assert.AreEqual(2, search.Count);
  }

  [Test]
  public void MatchMultipleTerms()
  {
    List<SearchResult> search = new LuceneSearchIndex().Search(
      "red beta",
      GetSimpleValues().ToArray()
    );

    Assert.IsNotEmpty(search);
    Assert.AreEqual(1, search.Count);
  }

  [Test]
  public void ReturnOnlyDistinctResults()
  {
    List<SearchResult> search = new LuceneSearchIndex().Search(
      "red beta",
      GetSimpleValues().Union(GetSimpleValues()).Union(GetSimpleValues()).ToArray()
    );

    Assert.IsNotEmpty(search);
    Assert.AreEqual(1, search.Count);
  }

  [Test]
  public void ReturnOnlyDistinctResultsWeightedBasedOnOccurrence()
  {
    List<SearchResult> search = new LuceneSearchIndex().Search(
      "occurs",
      new Dictionary<string, string[]> { { "attr1", new[] { "Occurs Once" } } },
      new Dictionary<string, string[]> { { "attr1", new[] { "Occurs Three Times" } } },
      new Dictionary<string, string[]> { { "attr1", new[] { "Occurs Twice" } } },
      new Dictionary<string, string[]> { { "attr1", new[] { "Occurs Three Times" } } },
      new Dictionary<string, string[]> { { "attr1", new[] { "Occurs Twice" } } },
      new Dictionary<string, string[]> { { "attr1", new[] { "Occurs Three Times" } } }
    );

    Assert.IsNotEmpty(search);
    Assert.AreEqual(3, search.Count);

    Assert.AreEqual("Occurs Three Times", search.ToArray()[0].Values["attr1"][0]);
    Assert.AreEqual("Occurs Twice", search.ToArray()[1].Values["attr1"][0]);
    Assert.AreEqual("Occurs Once", search.ToArray()[2].Values["attr1"][0]);
  }

  private static IEnumerable<Dictionary<string, string[]>> GetSimpleValues()
  {
    yield return new Dictionary<string, string[]>
    {
      { "attr1", new[] { "Alpha" } },
      { "attr2", new[] { "Red" } }
    };

    yield return new Dictionary<string, string[]>
    {
      { "attr1", new[] { "Beta" } },
      { "attr2", new[] { "Red" } }
    };

    yield return new Dictionary<string, string[]>
    {
      { "attr1", new[] { "Alpha" } },
      { "attr2", new[] { "Blac" } }
    };
  }
}
