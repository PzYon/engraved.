import { IJournalAttributes } from "../../../../serverApi/IJournalAttributes";
import { IAttributeSearchResult } from "../../../../serverApi/IAttributeSearchResult";
import { SearchResult } from "./SearchResult";

export type AttributeSearchMatch = {
  attributeKey: string;
  valueKey: string;
  matchingTerms: string[];
};

export function doesMatch(text: string, searchTerm: string) {
  if (!searchTerm) {
    return false;
  }

  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

export function extractTerms(searchText: string) {
  return searchText.split(" ").filter((t) => !!t);
}

export function searchJournalAttributes(
  attributes: IJournalAttributes,
  searchText: string,
): IAttributeSearchResult[] {
  const searchTerms = extractTerms(searchText);

  const allMatches: AttributeSearchMatch[] = getAllBasicMatches(
    attributes,
    searchTerms,
  );

  const results = allMatches.map((m) => SearchResult.create(m, allMatches));

  return filterIncompleteAndDuplicates(results, searchTerms);
}

function getAllBasicMatches(
  attributes: IJournalAttributes,
  searchTerms: string[],
): AttributeSearchMatch[] {
  const matches: AttributeSearchMatch[] = [];

  for (const attributeKey of Object.keys(attributes)) {
    for (const valueKey of Object.keys(attributes[attributeKey].values)) {
      const match: AttributeSearchMatch = {
        attributeKey: attributeKey,
        valueKey: valueKey,
        matchingTerms: [],
      };

      for (const searchTerm of searchTerms) {
        if (doesMatch(attributes[attributeKey].values[valueKey], searchTerm)) {
          match.matchingTerms.push(searchTerm);
        }
      }

      if (match.matchingTerms.length) {
        matches.push(match);
      }
    }
  }

  return matches;
}

function filterIncompleteAndDuplicates(
  results: SearchResult[],
  searchTerms: string[],
) {
  return results.reduce(
    (
      acc: {
        hashCodes: string[];
        results: SearchResult[];
      },
      result: SearchResult,
    ) => {
      const hashCode = result.getHashCode();

      if (
        acc.hashCodes.indexOf(hashCode) === -1 &&
        result.doesContainAllTerms(...searchTerms)
      ) {
        acc.results.push(result);
        acc.hashCodes.push(hashCode);
      }

      return acc;
    },
    {
      results: [],
      hashCodes: [],
    },
  ).results;
}
