// Road to Purr-fection content. Everything the site shows lives in this file.
// To add a flashcard or a question, see CONTRIBUTING.md.
// Sources: the official Associate exam guide (May 2026) and the Databricks docs.

const EXAM = {
  questions: 45, minutes: 90, fee: "USD 200", validity: "2 years",
  delivery: "Online proctored or test center",
  note: "Code on the exam is shown in SQL when possible, otherwise Python."
};

const SECTIONS = [
  { id: "s1", n: 1, name: "Databricks Intelligence Platform", weight: 6, mock: 3,
    objectives: [
      "Core components: the platform architecture, Delta Lake and Unity Catalog",
      "Compute options, their limits and cost models, and which one fits each workload"
    ],
    know: [
      "The control plane (web app, job scheduler, notebook and job metadata) runs in the Databricks account. Your data stays in your own cloud object storage.",
      "Classic compute runs in your cloud account. Serverless compute runs in a compute plane that Databricks manages.",
      "Delta Lake stores data as Parquet files plus a transaction log (_delta_log). That log gives ACID transactions, time travel and audit history.",
      "Unity Catalog governs data with a three level name: catalog.schema.object.",
      "All purpose compute is for interactive work. Jobs compute is created for a run and shut down after it, at a lower rate. Serverless starts in seconds with no cluster setup.",
      "SQL warehouses run SQL and BI workloads. Serverless SQL warehouses start fastest and scale for many users.",
      "Pools keep idle instances ready so clusters start faster."
    ],
    docs: [
      ["Platform introduction", "https://docs.databricks.com/aws/en/introduction/"],
      ["Delta Lake", "https://docs.databricks.com/aws/en/delta/"],
      ["Compute", "https://docs.databricks.com/aws/en/compute/"],
      ["SQL warehouses", "https://docs.databricks.com/aws/en/compute/sql-warehouse/"]
    ] },
  { id: "s2", n: 2, name: "Data Ingestion and Loading", weight: 21, mock: 9,
    objectives: [
      "Batch, streaming and incremental loading, from local files and Lakeflow Connect standard and managed connectors",
      "COPY INTO for incremental loads from cloud object storage into Unity Catalog tables",
      "Auto Loader with schema enforcement and schema evolution, in directory listing or file notification mode",
      "Configure Lakeflow Connect for enterprise sources",
      "JDBC, ODBC or REST clients in notebooks, scheduled with Lakeflow Jobs",
      "Choose between Auto Loader, Lakeflow Connect, partner connectors and other methods",
      "Ingest semi structured and unstructured data such as nested JSON"
    ],
    know: [
      "COPY INTO is idempotent. It tracks which files it already loaded and skips them on the next run.",
      "Auto Loader is spark.readStream.format(\"cloudFiles\"). It processes new files incrementally and records progress in a checkpoint.",
      "cloudFiles.schemaLocation is where Auto Loader stores the inferred schema and its changes.",
      "For JSON and CSV, Auto Loader infers every column as a string unless you set cloudFiles.inferColumnTypes or give schema hints.",
      "Default schema evolution mode is addNewColumns: the stream stops when a new column appears, the schema is updated, and the next start includes the column.",
      "Data that does not match the schema lands in the _rescued_data column instead of being lost.",
      "Directory listing works out of the box. File notification mode uses cloud events and queues, which scales better for directories with very many files.",
      "trigger(availableNow=True) processes everything available, in as many batches as needed, then stops. Good for scheduled incremental runs.",
      "Lakeflow Connect managed connectors ingest from SaaS apps and databases (for example Salesforce, ServiceNow, SQL Server) with little or no code.",
      "JDBC reads use spark.read.format(\"jdbc\") with url and dbtable options."
    ],
    docs: [
      ["Lakeflow Connect", "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/"],
      ["Auto Loader", "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/"],
      ["Auto Loader schema inference and evolution", "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/schema"],
      ["COPY INTO", "https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into/"],
      ["Connect to data sources", "https://docs.databricks.com/aws/en/connect/"],
      ["Semi structured data", "https://docs.databricks.com/aws/en/semi-structured/"]
    ] },
  { id: "s3", n: 3, name: "Data Transformation and Modeling", weight: 22, mock: 10,
    objectives: [
      "Clean bronze data with PySpark or SQL: handle nulls, standardize types, write silver tables",
      "Combine DataFrames: inner, left, broadcast and cross joins, multiple keys, union and union all",
      "Add, drop, split and rename columns, filter rows, explode arrays",
      "Deduplicate and aggregate: count, approximate count distinct, mean, summary",
      "Basic tuning: spark.sql.shuffle.partitions, spark.default.parallelism, executor and driver memory, spark.sql.autoBroadcastJoinThreshold",
      "Gold layer objects in Unity Catalog: materialized views, views, streaming tables, tables",
      "Data quality checks and validation rules for silver and gold"
    ],
    know: [
      "Medallion: bronze keeps raw data with a schema applied, silver is cleaned and conformed, gold is aggregated for BI.",
      "In PySpark, DataFrame.union keeps duplicates, like SQL UNION ALL, and matches columns by position. unionByName matches by name. SQL UNION removes duplicates.",
      "A broadcast join sends a small table to every executor, which avoids shuffling the large table. Use F.broadcast(small_df).",
      "spark.sql.autoBroadcastJoinThreshold sets the size under which Spark broadcasts automatically (10 MB by default). Setting it to -1 turns automatic broadcast off.",
      "spark.sql.shuffle.partitions defaults to 200. Lower it for small data, raise it for large shuffles. Adaptive query execution can coalesce partitions for you.",
      "dropDuplicates([\"key\"]) keeps one row per key. distinct() drops rows that are identical in every column.",
      "approx_count_distinct is much faster than an exact distinct count on large data.",
      "explode turns each array element into its own row. split turns a string into an array.",
      "A view stores only the query. A materialized view stores precomputed results and is refreshed. A streaming table processes new rows incrementally, each one once.",
      "Pipeline expectations: EXPECT alone keeps bad rows and records metrics, ON VIOLATION DROP ROW drops them, ON VIOLATION FAIL UPDATE stops the update.",
      "count_if(col IS NULL) counts nulls in a column."
    ],
    docs: [
      ["Medallion architecture", "https://docs.databricks.com/aws/en/lakehouse/medallion.html"],
      ["PySpark on Databricks", "https://docs.databricks.com/aws/en/pyspark/"],
      ["Adaptive query execution", "https://docs.databricks.com/aws/en/optimizations/aqe"],
      ["Materialized views", "https://docs.databricks.com/aws/en/views/materialized.html"],
      ["Streaming tables", "https://docs.databricks.com/aws/en/tables/streaming"],
      ["Pipeline expectations", "https://docs.databricks.com/aws/en/dlt/expectations"]
    ] },
  { id: "s4", n: 4, name: "Working with Lakeflow Jobs", weight: 16, mock: 7,
    objectives: [
      "Control flow: retries, If/else branching and For each loops",
      "Notebook, SQL query, dashboard and pipeline tasks, and their dependencies in the task graph",
      "Schedules and trigger types: scheduled, file arrival, table update",
      "Choose time based or data driven triggers"
    ],
    know: [
      "A job is a graph of tasks. A task runs after the tasks in its Depends on list, based on its Run if condition (All succeeded is the default).",
      "If/else condition tasks branch on a value, such as a job parameter or a task value.",
      "For each tasks run a nested task once per item in a list, with optional concurrency.",
      "Retries are set per task, with a count and an interval. Use them for transient failures.",
      "Scheduled triggers use a simple interval or Quartz cron syntax with a time zone.",
      "File arrival triggers start a run when new files land in a Unity Catalog volume or external location.",
      "Table update triggers start a run when a source table is updated.",
      "Repair run reruns only the failed tasks and the tasks that depend on them.",
      "Notifications on start, success, failure or duration go to email or to destinations such as a webhook or Slack.",
      "Pick a data driven trigger when data arrives at irregular times; pick a schedule when the business needs a fixed time."
    ],
    docs: [
      ["Lakeflow Jobs", "https://docs.databricks.com/aws/en/jobs/"],
      ["Control flow", "https://docs.databricks.com/aws/en/jobs/control-flow"],
      ["Triggers", "https://docs.databricks.com/aws/en/jobs/triggers"],
      ["Monitor jobs", "https://docs.databricks.com/aws/en/jobs/monitor"]
    ] },
  { id: "s5", n: 5, name: "Implementing CI/CD", weight: 10, mock: 5,
    objectives: [
      "Git folders in the workspace: create and switch branches, commit, push, pull requests",
      "Bundle variables and target overrides for dev, test and prod",
      "Deploy bundles to package and promote jobs, pipelines and other assets",
      "Use the Databricks CLI to validate, deploy and manage bundles in CI/CD"
    ],
    know: [
      "Git folders (formerly Repos) clone a remote repo into the workspace. From the Git dialog you create branches, commit and push, pull, and merge.",
      "Pull brings remote changes into your Git folder. Push sends your commits to the remote.",
      "Declarative Automation Bundles (formerly Databricks Asset Bundles) describe resources as code in databricks.yml.",
      "targets define environments such as dev and prod. Each target can override settings such as the workspace host or a variable.",
      "Variables are declared under variables and referenced as ${var.name}.",
      "mode: development prefixes resource names with your user name and pauses schedules. mode: production is for the shared deployment.",
      "CLI flow: databricks bundle init, databricks bundle validate, databricks bundle deploy -t <target>, databricks bundle run, databricks bundle destroy."
    ],
    docs: [
      ["Git folders", "https://docs.databricks.com/aws/en/repos/"],
      ["Bundles", "https://docs.databricks.com/aws/en/dev-tools/bundles/"],
      ["Databricks CLI", "https://docs.databricks.com/aws/en/dev-tools/cli/"]
    ] },
  { id: "s6", n: 6, name: "Troubleshooting, Monitoring, and Optimization", weight: 10, mock: 4,
    objectives: [
      "Compare job durations against historical runs in the Lakeflow Jobs run history",
      "Monitor pipeline health in the Jobs UI: statuses, task graph, run times, failure rates",
      "Find skew, shuffle and disk spill in Spark UI stage metrics",
      "Liquid clustering and predictive optimization",
      "Diagnose cluster startup failures, library conflicts and out of memory errors"
    ],
    know: [
      "Skew: most tasks finish quickly but a few take much longer and read far more shuffle data. Adaptive query execution can split skewed join partitions.",
      "Spill: Spill (Memory) and Spill (Disk) in a stage mean partitions did not fit in memory. More partitions or more memory reduces it.",
      "Large shuffle read and write means data is moving between executors, usually from joins, groupBy or repartition.",
      "Liquid clustering (CLUSTER BY) replaces partitioning and ZORDER. Clustering keys can change without rewriting the table. CLUSTER BY AUTO lets Databricks pick keys.",
      "Predictive optimization runs maintenance such as OPTIMIZE, VACUUM and ANALYZE automatically on Unity Catalog managed tables.",
      "OPTIMIZE compacts small files. VACUUM removes files no longer referenced, after the retention period (7 days by default), which limits time travel.",
      "collect() on a large DataFrame pulls everything to the driver and can cause a driver out of memory error.",
      "Notebook scoped libraries (%pip install) avoid version conflicts between notebooks on the same cluster.",
      "Cluster start failures often come from cloud quota limits, unavailable instance types or failing init scripts. The event log shows the cause."
    ],
    docs: [
      ["Spark UI guide", "https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/"],
      ["Liquid clustering", "https://docs.databricks.com/aws/en/delta/clustering.html"],
      ["Predictive optimization", "https://docs.databricks.com/aws/en/optimizations/predictive-optimization.html"],
      ["Compute troubleshooting", "https://docs.databricks.com/aws/en/compute/troubleshooting/"]
    ] },
  { id: "s7", n: 7, name: "Governance and Security", weight: 15, mock: 7,
    objectives: [
      "Managed and external tables in Unity Catalog: create, modify, delete, convert",
      "GRANT, REVOKE and DENY for users, groups and service principals at the right level",
      "Column masks and row level security by group",
      "Unity Catalog ABAC policies for central row filtering and column masking"
    ],
    know: [
      "Managed table: Unity Catalog manages the data files. DROP TABLE deletes the data too (UNDROP can recover it for a limited time).",
      "External table: data lives at a LOCATION you manage. DROP TABLE removes only the metadata; the files stay.",
      "ALTER TABLE ... SET MANAGED converts an external table to a managed table.",
      "To query a table a user needs USE CATALOG on the catalog, USE SCHEMA on the schema and SELECT on the table.",
      "Privileges are inherited downward: SELECT granted on a catalog covers its schemas and tables, including ones created later.",
      "Syntax: GRANT SELECT ON TABLE main.sales.orders TO `analysts`; REVOKE SELECT ON TABLE main.sales.orders FROM `analysts`.",
      "GRANT and REVOKE are the core commands. DENY comes from legacy table access control; check the privileges docs for how Unity Catalog treats it.",
      "Row filter: a SQL function that returns a boolean, attached with ALTER TABLE t SET ROW FILTER f ON (col).",
      "Column mask: a SQL function that returns the masked value, attached with ALTER TABLE t ALTER COLUMN c SET MASK f.",
      "is_account_group_member('group') is the usual check inside filters and masks.",
      "ABAC policies apply filters and masks based on governed tags, so one rule covers every tagged column, including future tables.",
      "Run production jobs as a service principal, not as a person."
    ],
    docs: [
      ["Tables in Unity Catalog", "https://docs.databricks.com/aws/en/tables/"],
      ["Manage privileges", "https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/"],
      ["Row filters and column masks", "https://docs.databricks.com/aws/en/tables/row-and-column-filters"],
      ["ABAC policies", "https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/"]
    ] }
];

const CARDS = [
  ["s1","Control plane","The part of Databricks that runs in the Databricks account: web app, job scheduler, notebook and job metadata."],
  ["s1","Where does the data live?","In your own cloud object storage, not in the control plane."],
  ["s1","Delta Lake","Open table format: Parquet data files plus a transaction log that gives ACID transactions, time travel and history."],
  ["s1","Unity Catalog name","Three levels: catalog.schema.object, for example main.sales.orders."],
  ["s1","All purpose vs jobs compute","All purpose is for interactive work and stays up. Jobs compute is created for a run and terminates after, at a lower rate."],
  ["s1","Serverless SQL warehouse","SQL compute that starts in seconds and scales for many concurrent BI users with no cluster setup."],
  ["s1","Pool","A set of idle, ready instances that cuts cluster start time."],
  ["s2","COPY INTO","SQL command that loads new files from cloud storage into a table and skips files it already loaded."],
  ["s2","Auto Loader","Incremental file ingestion with spark.readStream.format(\"cloudFiles\"), tracked by a checkpoint."],
  ["s2","cloudFiles.schemaLocation","Where Auto Loader keeps the inferred schema and its history."],
  ["s2","Why are my JSON columns all strings?","Auto Loader infers JSON and CSV columns as strings by default. Set cloudFiles.inferColumnTypes or use schema hints."],
  ["s2","addNewColumns","Default schema evolution mode. The stream stops on a new column, updates the schema, and picks it up on restart."],
  ["s2","_rescued_data","Column that keeps values that did not match the schema, so nothing is silently lost."],
  ["s2","Directory listing vs file notification","Listing scans the folder. File notification uses cloud events and queues and scales to very large directories."],
  ["s2","trigger(availableNow=True)","Process all available data in as many batches as needed, then stop."],
  ["s2","Lakeflow Connect managed connector","Managed ingestion from SaaS apps and databases such as Salesforce or SQL Server, with little code."],
  ["s2","JDBC read","spark.read.format(\"jdbc\").option(\"url\", ...).option(\"dbtable\", ...).load()"],
  ["s3","Bronze, silver, gold","Raw with a schema, then cleaned and conformed, then aggregated for BI."],
  ["s3","DataFrame.union","Keeps duplicates like UNION ALL and matches columns by position."],
  ["s3","unionByName","Combines DataFrames by column name instead of position."],
  ["s3","Broadcast join","Send a small table to every executor so the big table is not shuffled. F.broadcast(df)."],
  ["s3","spark.sql.autoBroadcastJoinThreshold","Size limit for automatic broadcast joins, 10 MB by default. -1 disables it."],
  ["s3","spark.sql.shuffle.partitions","Number of partitions after a shuffle, 200 by default."],
  ["s3","dropDuplicates vs distinct","dropDuplicates([\"key\"]) keeps one row per key. distinct() compares every column."],
  ["s3","approx_count_distinct","Fast approximate count of unique values for large data."],
  ["s3","explode","Turns each element of an array column into its own row."],
  ["s3","View vs materialized view","A view runs its query every time. A materialized view stores the results and is refreshed."],
  ["s3","Streaming table","Table that processes new rows incrementally, each row once. Good for append only sources."],
  ["s3","EXPECT ... ON VIOLATION DROP ROW","Drops rows that fail the rule and records the count in pipeline metrics."],
  ["s3","EXPECT ... ON VIOLATION FAIL UPDATE","Stops the pipeline update when any row fails the rule."],
  ["s4","Depends on","The tasks that must finish before this task runs. Run if decides which outcomes count."],
  ["s4","If/else condition task","Branches the job on a value such as a parameter or a task value."],
  ["s4","For each task","Runs a nested task once for every item in a list."],
  ["s4","File arrival trigger","Starts a run when new files land in a volume or external location."],
  ["s4","Table update trigger","Starts a run when a source table is updated."],
  ["s4","Quartz cron","Syntax for complex schedules, used by Lakeflow Jobs scheduled triggers."],
  ["s4","Repair run","Reruns only the failed tasks and the tasks downstream of them."],
  ["s4","Task retries","Per task setting for how many times and how often to retry a failed task."],
  ["s5","Git folder","A Git repo cloned into the workspace (formerly Repos). Branch, commit, push, pull and merge from the UI."],
  ["s5","databricks.yml","The root configuration file of a bundle."],
  ["s5","Bundle target","An environment such as dev or prod, with its own overrides."],
  ["s5","${var.catalog}","How a bundle references a variable declared under variables."],
  ["s5","mode: development","Prefixes deployed resource names with your user name and pauses schedules."],
  ["s5","databricks bundle validate","Checks the bundle configuration before you deploy."],
  ["s5","databricks bundle deploy -t prod","Deploys the bundle to the prod target."],
  ["s6","Data skew in the Spark UI","A few tasks run far longer and read far more shuffle data than the rest."],
  ["s6","Spill","Data written out because a partition did not fit in memory. Seen as Spill (Memory) and Spill (Disk)."],
  ["s6","Liquid clustering","CLUSTER BY keys that replace partitioning and ZORDER and can change without a rewrite."],
  ["s6","Predictive optimization","Runs OPTIMIZE, VACUUM and ANALYZE automatically on Unity Catalog managed tables."],
  ["s6","OPTIMIZE vs VACUUM","OPTIMIZE compacts small files. VACUUM deletes unreferenced files after the retention period."],
  ["s6","Driver out of memory","Often caused by collect() on a large DataFrame. Write results to a table instead."],
  ["s6","%pip install","Notebook scoped library install that avoids conflicts with other notebooks on the cluster."],
  ["s7","Managed table DROP","Removes metadata and data. UNDROP can recover it for a limited time."],
  ["s7","External table DROP","Removes only the metadata. Files at the LOCATION stay."],
  ["s7","Minimum privileges to read a table","USE CATALOG, USE SCHEMA and SELECT."],
  ["s7","Privilege inheritance","A grant on a catalog or schema applies to everything inside, including objects created later."],
  ["s7","Row filter","Boolean SQL function attached with ALTER TABLE ... SET ROW FILTER."],
  ["s7","Column mask","SQL function attached with ALTER TABLE ... ALTER COLUMN ... SET MASK."],
  ["s7","ABAC policy","A central rule that filters or masks data based on governed tags."],
  ["s7","Service principal","A non human identity used to run production jobs and automation."]
];

// [section, question, [options], correctIndex, explanation]
const QUESTIONS = [
  ["s1","In the classic Databricks architecture, where is a customer's table data stored?",
    ["In the control plane, next to the web application","In the customer's own cloud object storage","Inside the notebook metadata","On the driver node's local disk"],1,
    "The control plane holds the web app and metadata. Table data stays in the customer's cloud storage account."],
  ["s1","A team needs quick rollbacks, an audit trail of changes and consistent governed access to the same tables. Which combination fits?",
    ["CSV files in DBFS with manual copies","Delta Lake ACID transactions and time travel, governed by Unity Catalog","Cloud storage only, queried ad hoc","Temporary views cached in memory"],1,
    "Delta Lake gives ACID writes, history and time travel. Unity Catalog adds consistent access control and audit. This mirrors an official sample question."],
  ["s1","A nightly production notebook should run on isolated compute at the lowest cost and shut down afterwards. Which compute fits best?",
    ["An all purpose cluster left running","Jobs compute (or serverless jobs compute)","A SQL warehouse","A single node all purpose cluster shared with analysts"],1,
    "Jobs compute is created for the run and terminated after it, at a lower rate than all purpose compute."],
  ["s1","Analysts run many small SQL dashboard queries during the day and want fast startup with no cluster management. What should they use?",
    ["A serverless SQL warehouse","A jobs cluster","An all purpose cluster with fixed workers","A single node cluster"],0,
    "Serverless SQL warehouses start in seconds and scale for concurrent BI users."],
  ["s1","Which name correctly references a table in Unity Catalog?",
    ["sales.orders","main.sales.orders","hive.main.sales.orders","dbfs:/sales/orders"],1,
    "Unity Catalog uses a three level namespace: catalog.schema.table."],

  ["s2","A daily COPY INTO job ran, but the table row count did not change. What is the most likely reason?",
    ["COPY INTO needs the FILES keyword every time","The new day's file had already been loaded, so COPY INTO skipped it","Parquet is not supported by COPY INTO","The table must be refreshed before new rows appear"],1,
    "COPY INTO is idempotent. It records which files it loaded and skips them on later runs."],
  ["s2","Which code starts an Auto Loader stream?",
    ["spark.read.format(\"autoloader\")","spark.readStream.format(\"cloudFiles\")","spark.readStream.format(\"delta\")","spark.read.format(\"stream\")"],1,
    "Auto Loader is the cloudFiles source on readStream."],
  ["s2","Auto Loader ingests JSON with no schema hints. Every column arrives as a string. Why?",
    ["Auto Loader only supports strings","Auto Loader infers JSON and CSV columns as strings by default","The files were corrupted","A schema mismatch forced string types"],1,
    "By default Auto Loader types JSON and CSV columns as strings. Set cloudFiles.inferColumnTypes to true or add schema hints."],
  ["s2","An Auto Loader stream using the default schema evolution mode sees a new column in the source files. What happens?",
    ["The column is silently dropped","The stream stops, the schema is updated, and the column is included after restart","All rows go to a quarantine table","The stream keeps running and ignores the column forever"],1,
    "addNewColumns is the default. The stream fails on the new column, updates the stored schema, and picks it up when restarted."],
  ["s2","Which Auto Loader option sets where the inferred schema is stored?",
    ["cloudFiles.format","cloudFiles.schemaLocation","checkpointLocation only","mergeSchema"],1,
    "cloudFiles.schemaLocation stores the inferred schema and its evolution over time."],
  ["s2","Values that do not match the Auto Loader schema should be kept for later review. Where do they go?",
    ["The _rescued_data column","A separate error table created automatically","They are dropped","The checkpoint folder"],0,
    "The rescued data column captures values that did not fit the schema."],
  ["s2","A landing folder receives millions of files and directory listing is getting slow. Which Auto Loader setting helps?",
    ["Switch to file notification mode","Switch to COPY INTO","Reduce the number of workers","Use trigger(once=True)"],0,
    "File notification mode uses cloud events and queues instead of listing the directory."],
  ["s2","A scheduled streaming job should process all data available now, in as many batches as needed, then stop. Which trigger?",
    ["trigger(processingTime=\"1 minute\")","trigger(availableNow=True)","trigger(continuous=\"1 second\")","No trigger"],1,
    "availableNow processes everything available in multiple batches and then stops."],
  ["s2","The team must ingest Salesforce objects into Unity Catalog tables with as little custom code as possible. What fits best?",
    ["A Python REST client in a notebook","A Lakeflow Connect managed connector for Salesforce","COPY INTO from exported CSV files","A JDBC read scheduled hourly"],1,
    "Lakeflow Connect managed connectors handle SaaS sources such as Salesforce with minimal code."],
  ["s2","Fill the blank to read a table from a relational database in a notebook: spark.read.format(\"____\").option(\"url\", url).option(\"dbtable\", \"customers\").load()",
    ["delta","jdbc","cloudFiles","odbc_table"],1,
    "JDBC sources use format(\"jdbc\") with url and dbtable options."],
  ["s2","A pipeline consumes Databricks audit logs delivered to S3. What should the engineer expect about format, latency and overwrites?",
    ["JSON files, delivered within about 15 minutes, and files can be overwritten","CSV files, delivered in under a minute, never overwritten","Parquet files, delivered after 24 hours, overwrites disabled","JSON files, delivered weekly as a full replacement"],0,
    "This is one of the official sample questions. Audit log delivery is JSON, typically within 15 minutes, and files may be overwritten."],
  ["s2","Which statement about COPY INTO and Auto Loader is correct?",
    ["Only Auto Loader can load files incrementally","Both load files incrementally; Auto Loader scales better for very large or continuously arriving file sets","COPY INTO supports streaming triggers","Auto Loader cannot write to Unity Catalog tables"],1,
    "COPY INTO suits simpler batch loads. Auto Loader is built for large volumes and continuous arrival."],

  ["s3","In PySpark, df1.union(df2) is used on two DataFrames with the same columns. What happens to duplicate rows?",
    ["They are removed, like SQL UNION","They are kept, like SQL UNION ALL","The call fails","Only the first DataFrame's duplicates are removed"],1,
    "DataFrame.union keeps duplicates and matches by position. Add distinct() to remove them."],
  ["s3","Two DataFrames have the same columns in a different order. Which method combines them correctly?",
    ["union","unionByName","crossJoin","join on all columns"],1,
    "unionByName matches columns by name instead of position."],
  ["s3","A large fact table is joined to a 5 MB lookup table and the join shuffles a lot of data. What is the best fix?",
    ["Use a cross join","Broadcast the lookup table","Increase spark.sql.shuffle.partitions to 5000","Collect the fact table to the driver"],1,
    "Broadcasting the small table avoids shuffling the large one."],
  ["s3","What does setting spark.sql.autoBroadcastJoinThreshold to -1 do?",
    ["Broadcasts every table","Disables automatic broadcast joins","Sets the threshold to 1 MB","Forces sort merge joins to fail"],1,
    "The threshold controls automatic broadcasting. -1 turns it off."],
  ["s3","A small job runs 200 tiny tasks after every shuffle. Which setting is most directly responsible?",
    ["spark.executor.memory","spark.sql.shuffle.partitions","spark.driver.memory","spark.sql.autoBroadcastJoinThreshold"],1,
    "spark.sql.shuffle.partitions defaults to 200. Lower it for small data, or let adaptive query execution coalesce partitions."],
  ["s3","Keep one row per order_id from a DataFrame that has repeated orders. Which call?",
    ["df.distinct()","df.dropDuplicates([\"order_id\"])","df.groupBy(\"order_id\")","df.dropna()"],1,
    "dropDuplicates with a subset keeps one row per key. distinct compares every column."],
  ["s3","You need a fast, approximate number of unique users across billions of rows. Which function?",
    ["count(DISTINCT user_id)","approx_count_distinct(user_id)","sum(user_id)","collect_set(user_id)"],1,
    "approx_count_distinct trades a small error for much better speed."],
  ["s3","A column items holds an array of products. You need one row per product. Which function?",
    ["split","explode","flatten","pivot"],1,
    "explode creates one row per array element."],
  ["s3","A BI dashboard reads the same expensive aggregation many times a day. The result can be a few minutes old. Which gold object fits?",
    ["A view","A materialized view","A temporary view","A streaming table with no aggregation"],1,
    "A materialized view stores precomputed results and is refreshed, so reads are fast."],
  ["s3","Which object is best for incrementally ingesting an append only stream so that each row is processed once?",
    ["A streaming table","A view","A materialized view","A temporary view"],0,
    "Streaming tables process new rows incrementally, each one once."],
  ["s3","A pipeline has CONSTRAINT valid_ts EXPECT (ts > '2020-01-01') ON VIOLATION DROP ROW. What happens to a row that fails?",
    ["The update fails","The row is dropped and counted in the pipeline's data quality metrics","The row is kept and flagged","The row is moved to a quarantine table automatically"],1,
    "DROP ROW removes failing rows and records them in metrics. FAIL UPDATE would stop the update."],
  ["s3","Which query returns the number of null values in member_id?",
    ["SELECT count(member_id) FROM t","SELECT count_if(member_id IS NULL) FROM t","SELECT count_null(member_id) FROM t","SELECT null(member_id) FROM t"],1,
    "count_if counts rows where the condition is true."],
  ["s3","Which layer should hold cleaned data with standardized types and removed duplicates?",
    ["Bronze","Silver","Gold","Raw files"],1,
    "Silver is the cleaned, conformed layer. Gold holds aggregates for BI."],

  ["s4","Task B must run only after task A finishes successfully. How is this configured in Lakeflow Jobs?",
    ["Put task B before task A in the list","Add task A to task B's Depends on, with Run if set to All succeeded","Create a second job for task B","Set task B to retry until A finishes"],1,
    "Dependencies plus the Run if condition control task order. All succeeded is the default."],
  ["s4","The last step of a daily job should run only on Sundays. What is the cleanest approach?",
    ["Create a separate job that runs only on Sundays","Add an If/else condition task that checks the day and gates the final task","Delete the final task on other days","Use Python try/except in every notebook"],1,
    "If/else condition tasks branch the job on a value such as the run date."],
  ["s4","The same notebook must run once for each of 30 store IDs. Which task type fits?",
    ["For each task","If/else condition task","Pipeline task","Dashboard task"],0,
    "For each runs a nested task once per item, with optional concurrency."],
  ["s4","Files arrive in a volume at unpredictable times. The job should start as soon as new files land. Which trigger?",
    ["Scheduled trigger every hour","File arrival trigger","Continuous trigger on a SQL warehouse","Manual run"],1,
    "File arrival triggers are data driven and start the job when new files appear."],
  ["s4","A reporting job should run whenever its source table changes. Which trigger?",
    ["Table update trigger","File arrival trigger","Cron schedule every minute","Pipeline task"],0,
    "Table update triggers start a run when the monitored table is updated."],
  ["s4","A complex schedule must be copied to many jobs programmatically. How is it expressed?",
    ["Python datetime objects","Quartz cron syntax","TimestampType","It cannot be expressed as code"],1,
    "Lakeflow Jobs schedules use Quartz cron expressions with a time zone."],
  ["s4","A task calls an API that fails briefly now and then. What should be configured?",
    ["Task retries with a retry interval","A second job","Continuous mode","A bigger cluster"],0,
    "Retries handle transient failures without manual reruns."],
  ["s4","One task in a five task job failed and was fixed. How do you rerun without repeating the tasks that already succeeded?",
    ["Run the whole job again","Use Repair run","Clone the job","Delete the failed run"],1,
    "Repair run reruns the failed tasks and anything downstream of them."],
  ["s4","The team wants a message in their chat channel when a job fails. What should they set up?",
    ["A job failure notification sent to a webhook or Slack destination","An alert inside each notebook cell","A dashboard refresh","A cluster init script"],0,
    "Job notifications can go to email or to destinations such as webhooks and Slack."],
  ["s4","A new cleanup notebook must run before an existing task in the same job. What should the engineer do?",
    ["Create the new task and add it to the original task's Depends on","Create the new task and make it depend on the original task","Create a new job that runs at the same time","Clone the original task into a new job"],0,
    "The original task should depend on the new task so the new one runs first."],

  ["s5","A colleague pushed changes to the remote repo. You want them in your Git folder. Which operation?",
    ["Push","Pull","Commit","Clone"],1,
    "Pull brings remote changes into your Git folder."],
  ["s5","What is the root configuration file of a bundle?",
    ["bundle.json","databricks.yml","job.yml","pipeline.conf"],1,
    "A bundle is defined by databricks.yml at its root."],
  ["s5","Which command deploys a bundle to the prod target?",
    ["databricks bundle deploy -t prod","databricks jobs create --prod","databricks bundle run prod","databricks workspace import prod"],0,
    "bundle deploy with -t selects the target."],
  ["s5","You want to catch configuration errors before deploying a bundle. Which command?",
    ["databricks bundle validate","databricks bundle destroy","databricks bundle run","databricks fs ls"],0,
    "validate checks the configuration without deploying."],
  ["s5","Dev and prod must write to different catalogs from the same code. What is the recommended approach?",
    ["Keep two copies of every notebook","Declare a catalog variable and override it per target, referenced as ${var.catalog}","Edit the notebook before each deploy","Use one catalog for both"],1,
    "Variables with target overrides promote the same code across environments."],
  ["s5","What does mode: development do for a bundle target?",
    ["Deletes resources after each run","Prefixes resource names with the user and pauses schedules","Runs everything as a service principal","Disables Git integration"],1,
    "Development mode keeps each developer's copy separate and stops schedules from firing."],
  ["s5","A team wants modular, versioned ETL that can be promoted through environments with CI/CD. What fits best?",
    ["Store code in Unity Catalog models","Define the resources in a bundle, version it in Git and deploy it per target","Copy notebooks between workspaces by hand","Package everything in one notebook in a volume"],1,
    "This mirrors an official sample question. Bundles in Git give repeatable, promotable deployments."],

  ["s6","A job doubled in duration. In the Spark UI most tasks take under 30 seconds but one takes over 10 minutes and reads 5 GB of shuffle data. What is the problem and a fix?",
    ["Too few executors; add nodes","Data skew; make sure adaptive query execution skew join handling is on","Too many shuffle partitions; reduce them","Slow storage; change file format"],1,
    "One long task with much larger shuffle reads is skew. This mirrors an official sample question."],
  ["s6","A stage shows large Spill (Disk) values. What does that indicate?",
    ["Partitions did not fit in memory and were written to disk","The job wrote output files","Broadcast joins were used","The cluster autoscaled"],0,
    "Spill means memory was not enough for the partitions. More partitions or more memory helps."],
  ["s6","Where do you compare today's job duration with previous runs?",
    ["The Lakeflow Jobs run history for the job","The cluster driver logs","Catalog Explorer","The notebook revision history"],0,
    "The job's runs view shows durations and statuses over time."],
  ["s6","Which statement about liquid clustering is true?",
    ["It requires partitioning to be set first","Its clustering keys can change without rewriting the whole table","It only works on external tables","It replaces VACUUM"],1,
    "Liquid clustering replaces partitioning and ZORDER, and keys can be changed later."],
  ["s6","What does predictive optimization do?",
    ["Predicts query results","Runs maintenance such as OPTIMIZE, VACUUM and ANALYZE automatically on Unity Catalog managed tables","Auto scales SQL warehouses","Rewrites SQL queries"],1,
    "Predictive optimization handles table maintenance for managed tables."],
  ["s6","A notebook fails with a driver out of memory error right after df.collect() on a large DataFrame. What should change?",
    ["Add more worker nodes","Avoid collect(); write the result to a table or use limit()","Increase shuffle partitions","Turn off Photon"],1,
    "collect() brings all data to the driver. Keep large results distributed."],
  ["s6","Two notebooks on the same cluster need different versions of a library. What avoids the conflict?",
    ["Install both on the cluster","Use notebook scoped libraries with %pip install","Restart the cluster between runs","Use a SQL warehouse"],1,
    "Notebook scoped libraries isolate dependencies per notebook."],
  ["s6","A table's time travel to an older version fails because the data files are gone. Which command most likely removed them?",
    ["OPTIMIZE","VACUUM","DESCRIBE HISTORY","RESTORE"],1,
    "VACUUM deletes files that are no longer referenced after the retention period."],

  ["s7","DROP TABLE is run on an external table. What happens?",
    ["Metadata and data files are deleted","The metadata is removed but the data files remain at the location","Nothing happens","Only the data files are deleted"],1,
    "For external tables Unity Catalog does not manage the files, so they stay."],
  ["s7","DROP TABLE is run on a Unity Catalog managed table. What happens?",
    ["Only metadata is removed","Metadata and data are removed; UNDROP can recover it for a limited time","The table is converted to external","The drop is blocked"],1,
    "Managed tables have their data managed by Unity Catalog, so it is removed with the table."],
  ["s7","An analyst has SELECT on main.sales.orders but gets a permission error. What is most likely missing?",
    ["MODIFY on the table","USE CATALOG on main and USE SCHEMA on sales","CREATE TABLE on the schema","Ownership of the table"],1,
    "Reading a table also needs USE CATALOG and USE SCHEMA on its parents."],
  ["s7","SELECT is granted on a catalog to the analysts group. New tables are created in it later. What access do analysts have to the new tables?",
    ["None until granted again","SELECT, because privileges are inherited by objects inside the catalog","Ownership","Only tables that existed at grant time"],1,
    "Unity Catalog privileges are inherited downward, including future objects."],
  ["s7","Which statement removes the analysts group's read access to a table?",
    ["DELETE SELECT ON TABLE t FROM analysts","REVOKE SELECT ON TABLE t FROM `analysts`","GRANT NONE ON TABLE t TO analysts","DROP GRANT SELECT ON t"],1,
    "REVOKE privilege ON object FROM principal."],
  ["s7","Rows should be visible only to the region's own group. What should be used?",
    ["A column mask","A row filter function attached with ALTER TABLE ... SET ROW FILTER","A separate table per region","VACUUM"],1,
    "Row filters return a boolean per row, often using is_account_group_member."],
  ["s7","Show the full SSN only to the hr group and a masked value to everyone else. What should be used?",
    ["A column mask on the ssn column","A row filter","A temporary view","An external table"],0,
    "Column masks return the real or masked value based on who is querying."],
  ["s7","Hundreds of tables have columns tagged pii. One central rule should mask all of them, including future tables. What should be implemented?",
    ["ALTER COLUMN SET MASK on every table","An ABAC policy that masks columns with the governed pii tag","A dynamic view for each table","A row filter on each schema"],1,
    "ABAC policies apply masks and filters based on governed tags, centrally and at scale."],
  ["s7","A production job should not run under a person's account. What identity should it use?",
    ["A shared personal login","A service principal","The workspace admin's account","An anonymous user"],1,
    "Service principals are non human identities for automation."],
  ["s7","Which command converts an external table to a Unity Catalog managed table?",
    ["ALTER TABLE t SET MANAGED","CONVERT TO DELTA t","CREATE TABLE t CLONE","ALTER TABLE t SET LOCATION"],0,
    "ALTER TABLE ... SET MANAGED moves an external table under Unity Catalog management."]
];

const RENAMES = [
  ["Delta Live Tables (DLT)","Lakeflow Spark Declarative Pipelines","Also seen as Lakeflow Declarative Pipelines"],
  ["CREATE LIVE TABLE","CREATE MATERIALIZED VIEW","Batch style pipeline dataset"],
  ["CREATE STREAMING LIVE TABLE","CREATE STREAMING TABLE","Incremental pipeline dataset"],
  ["APPLY CHANGES INTO","AUTO CDC","Change data capture in pipelines"],
  ["Databricks Workflows, Jobs","Lakeflow Jobs",""],
  ["Databricks Repos","Databricks Git folders",""],
  ["Databricks Asset Bundles (DABs)","Declarative Automation Bundles","Same databricks.yml and bundle CLI commands"],
  ["SQL endpoint","SQL warehouse",""],
  ["Data Explorer","Catalog Explorer","Where you browse tables, owners and permissions"],
  ["Lakehouse Platform","Data Intelligence Platform","The exam's name for the platform"],
  ["Hive metastore, DBFS paths","Unity Catalog tables and volumes","Older questions use dbfs:/user/hive/warehouse"]
];

const HANDSON = [
  "Create a catalog, schema and managed table in Unity Catalog, then query it with a three level name",
  "Upload files to a volume and load them with COPY INTO, then run it again and confirm nothing is duplicated",
  "Build an Auto Loader stream with a schema location, add a file with a new column, and watch schema evolution",
  "Clean a bronze table into silver: cast types, handle nulls, dropDuplicates, and write the result",
  "Join a fact table to a small lookup with a broadcast join and compare the plan in the Spark UI",
  "Create a view, a materialized view and a streaming table and note how each refreshes",
  "Add expectations to a pipeline with DROP ROW and FAIL UPDATE and read the data quality metrics",
  "Build a Lakeflow Job with three dependent tasks, a retry, an If/else task and a file arrival trigger",
  "Clone a repo into a Git folder, create a branch, commit and push, then open a pull request",
  "Create a small bundle with dev and prod targets and a catalog variable, then run validate and deploy",
  "GRANT and REVOKE access for a group, then add a row filter and a column mask"
];

const RESOURCES = [
  { group: "Official exam pages", items: [
    ["Data Engineer Associate certification page", "https://www.databricks.com/learn/certification/data-engineer-associate", "Exam facts, section weights, registration steps"],
    ["Associate exam guide (PDF)", "https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf", "The full outline and sample questions. Check it again two weeks before your exam."],
    ["AI Prep Guide (PDF)", "https://www.databricks.com/sites/default/files/2026-06/ai-prep-guide-any-databricks-certification.pdf", "Databricks' own prompts for studying with an AI chatbot"],
    ["Register on Webassessor", "http://webassessor.com/databricks", "Use the same email as your Databricks Academy account if you have a festival voucher"],
    ["Certification FAQ", "https://www.databricks.com/learn/certification/faq", ""]
  ]},
  { group: "Training", items: [
    ["Databricks Academy", "https://www.databricks.com/learn/training/home", "Self paced courses"],
    ["Advanced Learning Festival, Sep 16 to Oct 14, 2026", "https://community.databricks.com/t5/learning-events/databricks-advanced-learning-festival-september-16-october-14/ec-p/166157", "Finish the Associate Data Engineering pathway in the window for 50% off a certification. Vouchers are emailed on Oct 19."],
    ["Databricks Free Edition", "https://www.databricks.com/learn/free-edition", "Free workspace for the hands-on list"]
  ]},
  { group: "Community study guides", items: [
    ["Alex Cole's resource guide for the Associate exam", "https://www.alexcole.net/databricks-data-engineer-associate-2026-resource-guide/", "Docs, demos and courses mapped to each objective"]
  ]}
];

const ACADEMY = [
  "Data Ingestion with Lakeflow Connect",
  "Deploy Workloads with Lakeflow Jobs",
  "Build Data Pipelines with Lakeflow Spark Declarative Pipelines",
  "DevOps Essentials for Data Engineering"
];

// ---------- site settings ----------
const SITE = {
  repo: "czekinah/databricks-de-associate-reviewer",
  notesIssue: 1,
  examDay: "2026-10-17",
  examDayLabel: "Saturday, October 17, 2026"
};

// ---------- exam tips ----------
const TIPS = [
  { title: "Before you book", items: [
    "Book on Webassessor with the same email as your Databricks Academy account. Festival vouchers only work for that email.",
    "Run the Kryterion system check on the computer you will use: kryterion.com/systemcheck. Do it again the day before.",
    "Online proctored exams can be rescheduled up to 24 hours before your slot. Test centers need 72 hours.",
    "Reread the exam guide two weeks before your date, around October 3 for an October 17 exam. Databricks updates it when the exam changes."
  ]},
  { title: "How to study", items: [
    "Study by weight. Ingestion and Transformation are 43% of the exam, so they get the most hours.",
    "Do every hands-on task once in Databricks Free Edition. Scenario questions are easier when you have clicked through the real screens.",
    "Learn the current names. Older practice sets still say DLT, Repos and SQL endpoint; the exam uses Lakeflow and Git folders.",
    "Take a timed mock exam, then spend more time reviewing the ones you missed than you spent taking it.",
    "Book the exam only after you score 80% or higher on two mock runs in a row."
  ]},
  { title: "During the exam", items: [
    "You get 90 minutes for 45 scored questions, about 2 minutes each. There may be a few unscored questions too, with extra time already added.",
    "Read the last sentence of the question first so you know what it is asking, then read the scenario.",
    "Watch the qualifiers: least operational overhead, minimal code, most cost effective. They usually point to a managed or serverless option.",
    "Cross out the two options that are clearly wrong, then compare the last two against the exact requirement.",
    "Answer every question. Mark the unsure ones for review and come back if time allows.",
    "Code is shown in SQL when possible, otherwise Python."
  ]},
  { title: "Exam day checklist", items: [
    "Valid government ID ready.",
    "A quiet, private room and a clear desk. Check the Kryterion rules for what the camera needs to see.",
    "Laptop charged and plugged in, other apps closed, notifications off.",
    "Log in 15 minutes early.",
    "No notes or aids are allowed, including a second screen."
  ]},
  { title: "When it feels like too much", items: [
    "Pick the smallest next step: one flashcard deck or one section quiz. Starting is the hard part.",
    "Compare yourself with where you were last week, not with your classmates.",
    "A good night of sleep before the exam does more than one more late night of review.",
    "Ask the batch. Someone else is stuck on the same topic, and explaining it helps both of you."
  ]},
  { title: "After the exam", items: [
    "You see an unofficial result right away. For a pass, Databricks reviews the proctor recording before the badge is issued.",
    "The badge arrives by email from Accredible and shows up at credentials.databricks.com.",
    "If it does not go your way, you can retake after 14 days. The section breakdown shows you exactly what to study, and you will already know the format.",
    "The certification is valid for 2 years."
  ]}
];

// ---------- study calendar to exam day ----------
// type: study | check | mock | rest | exam | deadline
const PLAN = [
  ["2026-09-25","study","Start: read Section 3 notes (Transformation, 22%) and do its flashcards"],
  ["2026-09-26","study","Section 3 quiz and the bronze to silver hands-on task"],
  ["2026-09-27","study","Section 2 notes (Ingestion, 21%): COPY INTO, Auto Loader, Lakeflow Connect"],
  ["2026-09-28","study","Section 2 flashcards and quiz, Auto Loader hands-on task"],
  ["2026-09-29","study","Academy course: Data Ingestion with Lakeflow Connect"],
  ["2026-09-30","study","Academy course: Build Data Pipelines with Lakeflow Spark Declarative Pipelines"],
  ["2026-10-01","check","Quick 10 on Sections 2 and 3. Redo anything under 80%"],
  ["2026-10-02","study","Section 4 notes (Lakeflow Jobs, 16%) and the jobs hands-on task"],
  ["2026-10-03","check","Reread the official exam guide for changes (two weeks out)"],
  ["2026-10-04","study","Academy course: Deploy Workloads with Lakeflow Jobs"],
  ["2026-10-05","study","Section 7 notes (Governance, 15%): grants, row filters, column masks"],
  ["2026-10-06","study","Section 7 quiz and the GRANT and REVOKE hands-on task"],
  ["2026-10-07","study","Section 5 notes (CI/CD, 10%) and Academy course: DevOps Essentials"],
  ["2026-10-08","study","Section 6 notes (Troubleshooting, 10%) and Section 1 (Platform, 6%)"],
  ["2026-10-09","check","Section quizzes for 1, 5 and 6"],
  ["2026-10-10","mock","Mock exam 1, timed. Review every miss"],
  ["2026-10-11","study","Repair day: reread notes for your two weakest sections"],
  ["2026-10-12","study","Renamed terms review and all flashcards not yet known"],
  ["2026-10-13","mock","Mock exam 2, timed"],
  ["2026-10-14","deadline","Festival ends. Last day to finish the four Associate courses for the voucher"],
  ["2026-10-15","check","Quick 10 twice, then light review only"],
  ["2026-10-16","rest","Run the Kryterion system check, prepare your ID and room, sleep early"],
  ["2026-10-17","exam","Exam day. Log in 15 minutes early"],
  ["2026-10-19","deadline","Festival vouchers are emailed to Academy accounts"]
];
