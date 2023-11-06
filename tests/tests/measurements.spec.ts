import { test } from "@playwright/test";
import { addNewJournal } from "../src/utils/addNewJournal";
import { constants } from "../src/constants";

test.beforeEach(async ({ page }) => {
  await page.goto(constants.baseUrl);
});

const value1 = "23";
const value2 = "19.5";

test("adds new value journal, adds entries", async ({ page }) => {
  const journalPage = await addNewJournal(page, "Value", "Journal with values");

  await journalPage.addValue(value1);
  await journalPage.addValue(value2);

  await journalPage.validateNumberOfTableRows(2);

  await journalPage.expectTableCellToHaveValue(value1);
  await journalPage.expectTableCellToHaveValue(value2);
});
