# Contributing

Thanks for helping the batch. Everything the site shows is in `content.js`, so most fixes are a one line change there.

## Quickest way

Open an [issue](https://github.com/czekinah/databricks-de-associate-reviewer/issues/new) with the question or the fix, and I'll add it.

## Add a practice question

Add a line to `QUESTIONS` in `content.js`:

```js
["s2", "Your question?",
  ["Option A", "Option B", "Option C", "Option D"], 1,
  "Why the right answer is right, in one or two sentences."],
```

- The first value is the section: `s1` Platform, `s2` Ingestion, `s3` Transformation, `s4` Lakeflow Jobs, `s5` CI/CD, `s6` Troubleshooting, `s7` Governance.
- The number after the options is the index of the correct one, starting at 0. The site shuffles the options, so the position doesn't matter.
- Always give four options.

## Add a flashcard

Add a line to `CARDS`:

```js
["s3", "Front of the card", "Back of the card."],
```

## Rules for content

- Use the current product names: Lakeflow Jobs, Lakeflow Spark Declarative Pipelines, Git folders, Declarative Automation Bundles, SQL warehouses, Catalog Explorer.
- Stick to the Associate exam guide. Professional exam topics belong in a different reviewer.
- Every answer should be checkable in the Databricks docs. A docs link in your pull request helps a lot.
- Don't paste questions from real exams or paid dumps.

## Test locally

Open `index.html` in a browser. No build step.
