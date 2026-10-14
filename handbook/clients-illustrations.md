# Clients 配图来源

本次配图使用内置 imagegen，于 2026-10-13 生成。它们是概念示意图，产品行为以正文与链接的公开事实来源为准。配图使用简短英文标签，正文提供中文说明和 alt 文本。

## 最终资产

| 图片                                              | 用途                              |
| ------------------------------------------------- | --------------------------------- |
| `docs/getting-started/assets/client-paths.png`    | 工具选择概览                      |
| `docs/products/jdbc/assets/lifecycle.png`         | 连接、提交、取结果和资源关闭      |
| `docs/products/odbc/assets/connection-layers.png` | 应用、Driver Manager、驱动、服务  |
| `docs/products/spark/assets/external-compute.png` | 外部 Spark 计算与 MaxCompute 存储 |
| `docs/products/dbt/assets/model-workflow.png`     | 模型、编译、远端构建、数据测试    |

## 生成提示词

### client-paths

```text
Use case: infographic-diagram. Asset type: educational documentation illustration. Create a wide 1536x1024 clean editorial technical infographic on an ivory background with dark navy typography and teal/orange accents, generous whitespace, crisp flat vector-like shapes. Title exactly 'MaxCompute client paths'. Four horizontal rows, each left-to-right: 'Java app' -> 'JDBC' -> 'MaxCompute'; 'BI / Python' -> 'ODBC' -> 'MaxCompute'; 'Spark job' -> 'Connector' -> 'MaxCompute'; 'dbt models' -> 'Adapter' -> 'MaxCompute'. Show a small laptop/program icon at left, a plug/bridge at middle, and a cloud warehouse at right. Arrows indicate a connection only, not shared execution semantics. Include no other text, no credentials, no fake UI, no logos, no watermark. All labels must be rendered precisely and legibly. This is a conceptual connection map, not a screenshot.
```

### jdbc

```text
Use case: infographic-diagram. Create an elegant wide educational diagram for a developer guide on ivory background, navy text, teal and orange arrows. Title 'JDBC query lifecycle'. Four numbered cards left to right with labels exactly '1 Connect', '2 Execute SQL', '3 Read rows', '4 Close resources'. Below the second card a cloud labelled 'MaxCompute job'; below the third a table icon labelled 'ResultSet'. Flow connects app connection, SQL submission, row iteration, resource cleanup. No suggestion of transactions or immediate query completion. Flat vector-like visual, generous white space, precisely legible English, no logos, no credentials, no fake screenshots, no watermark.
```

### odbc

```text
Use case: infographic-diagram. Create an elegant wide educational architecture diagram on ivory background with navy text, teal/orange details. Title exactly 'ODBC connection layers'. Four cards left to right: 'Application' (Python and BI icon), 'Driver Manager' (switch icon), 'MaxCompute Driver' (plug icon), 'MaxCompute' (cloud warehouse). Connection arrows between cards. Small bottom captions under first three respectively 'pyodbc / BI', 'unixODBC / Windows', 'Native library'. This diagram must clearly include the manager as separate from the driver. Crisp flat vector-like graphics, generous whitespace, no logos, no secrets, no fake UI, no watermark.
```

### spark

```text
Use case: infographic-diagram. Create a clean wide educational diagram on ivory background with navy typography and teal/orange highlights. Title 'Spark Connector: external compute'. Large dashed rounded enclosure labelled 'Spark cluster' holding 'Driver' above two 'Executor' nodes. Driver connects to a small 'Catalog' card; two Executors connect through a 'Storage API' bridge to a separate 'MaxCompute tables' cloud on right. Small caption 'Compute in Spark, data in MaxCompute'. Depict connection not execution of Spark inside MaxCompute. Precise legible English only, flat vector-like style, no credentials, no logos, no watermark.
```

### dbt

```text
Use case: infographic-diagram. Create a clean wide beginner educational diagram on ivory background with dark navy text and teal/orange arrows. Title 'dbt: SQL models to trusted tables'. Four cards left to right exactly 'SQL + ref()', 'Compile', 'Build in MaxCompute', 'Test + docs'. Below cards show a tiny dependency graph with three nodes 'staging', 'core', 'marts' left to right. A subtle laptop icon beneath Compile and a cloud warehouse beneath Build in MaxCompute show compilation local and SQL execution remote. No suggestion data processed locally. Precisely legible English, editorial flat vector-like graphics, no logos, no credentials, no fake UI, no watermark.
```

## 检查

逐张检查英文标签、流程含义、布局与可读性；无凭据、客户数据或仿真控制台截图。ODBC 包含独立 Driver Manager，Spark 图明确外部计算，dbt 图说明 SQL 在云端执行。最终 PNG 入库，页面通过相对路径引用，可随站点 baseUrl 构建。
