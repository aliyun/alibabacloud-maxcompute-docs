# Flink Connector 源码审查记录

本记录用于维护文档事实与后续修复，不是 Connector 的完整安全、性能或发布审查。文档分析基线为 `codex/sca-emulator-tests` 的 `cce1b4f90193179b83a854b60a22b824ae75565e`；版本号调整提交为 `d2c13a5`，仅将候选版本从 1.16.25 改为 1.20.0。

## 结论与处置

发现五项影响模式或配置契约的实现问题，均在用户文档中说明适用边界。本次没有修改这些运行逻辑；版本调整和文档初始化分别验证。LIMIT 保存后没有传递到读取会话，另作为优化限制说明。

| 优先级 | 问题                                                              | 已获得证据                                              | 文档处置                                 |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| P1     | 有界 CDC 声明 insert-only，但读取器可产生变更 RowKind             | 工厂离线探针确认 changelog；读取器代码确认 RowKind 映射 | 不提供可上线的有界 CDC SQL 配方          |
| P2     | batch 历史版本／时间没有接入快照选择                              | 静态追踪 SQL 配置到 batch session builder               | 明确只读当前快照，历史时点不可依赖       |
| P2     | SQL Source 配额／代理未传入连接对象                               | 工厂离线探针确认配置丢失；Source settings 路径追踪      | 区分 Source 与 Sink 的配额路径           |
| P2     | 持续 SQL 分支忽略 metadata／watermark 配置                        | 静态追踪 runtime provider 分支                          | 不推荐相应持续事件时间配方               |
| P2     | odps.conf 的 provider／region 仅留在 properties，专用字段未初始化 | 文件加载离线探针确认                                    | Catalog 文件示例不声称支持 provider 认证 |

## 有界 CDC 的 changelog 契约

源码定位：`src/main/java/org/apache/flink/odps/table/OdpsDynamicTableSource.java:540`、`src/main/java/org/apache/flink/odps/source/reader/ColumnarRowIterator.java:64`、`src/main/java/org/apache/flink/odps/source/reader/OdpsSourceSplitReader.java:192`。

触发条件：明确设置 Flink `BATCH`，`scan.mode=incremental`，`scan.incremental.mode=CDC`，且指定版本区间。`getChangelogMode()` 因非 streaming 返回 insert-only；实际 incremental session 的读取器根据操作列设置更新／删除 RowKind。

影响：planner 可按只追加数据规划下游，实际变化行不符合声明。尚未在云端执行 CDC 下游损坏用例，不能把风险推断写为已经出现的结果。建议按增量表达协商正确 changelog，或在不支持的 batch CDC 组合提前拒绝，并验证删除和更新后的下游值。

## batch 历史快照参数没有生效

源码定位：`OdpsDynamicTableSource.java:315` 至 `:383`、`source/enumerator/BatchOdpsSplitEnumerator.java:163` 至 `:200`。

batch 分支只在 `INCREMENTAL` 模式构造区间选项。其他模式都构建普通 batch session，未应用 `scan.snapshot-version` 或 `scan.timestamp`。枚举说明中出现的 batch 历史时点语义与此执行路径不一致。

建议：实现真实 snapshot spec 传递并测试历史与当前结果不同，或显式拒绝不支持的参数组合。当前文档只推荐 bounded 当前存量。

## Source 配额与代理参数丢失

源码定位：`table/factories/OdpsDynamicTableFactory.java:321` 至 `:335`、`sink/table/TableUtils.java:114` 至 `:128`。

显式 SQL 认证路径接受配额与代理选项，但构造 `OdpsConf` 时没有传配额和代理。Source settings 只从该连接对象取配额，因此指定 `audit-quota` 后连接对象仍为空，代理属性也不存在。

范围：Sink 的另一重载从 Flink Configuration 直接读取配额，不能把 Source 结论泛化为所有 writer 配额都失效。建议统一连接参数的传递并测试读写两条路径。

## 持续 metadata 与 watermark 未接入

源码定位：`OdpsDynamicTableSource.java:195` 至 `:207`、`:296` 至 `:314`、`:363` 至 `:403`。

metadata keys、produced data type 和 watermark 会被保存。batch 分支使用最终类型、调用 `setMetadataKeys`，并在存在 watermark 时构造 DataStream provider；持续分支直接返回 Continuous SourceProvider，未传递这些配置。

影响：持续 SQL metadata 输出结构与 planner 类型可能不一致；声明下推 watermark 后不能依赖它驱动事件时间。建议完善连续源的数据发射与类型契约，或提前拒绝该组合，并测试窗口实际触发。

## 配置文件的专用认证字段未初始化

源码定位：`util/OdpsUtils.java:110` 至 `:153`、`:215` 至 `:252`，`util/OdpsConf.java` 的认证字段访问方法。

文件加载只用基础字段构造 `OdpsConf`，其余配置进入 properties。后续认证逻辑从 `getCredentialsProviderClass()` 和 `getRegionId()` 读取专用字段，导致只配置 provider 的文件认证无法按意图初始化；签名地域配置也没有进入该字段。

离线文件探针证实 provider 属性存在，但专用 provider／region getter 为空。建议文件加载时设置相应专用字段，并验证 provider-only、带参数 provider、region 和失败构造的完整路径。

## 验证记录

- 新建离线审查探针，仅在独立源码导出目录运行，不接触服务和业务数据。三个新增用例确认 SQL 配额／代理、有界 CDC 声明与文件认证字段，连同复用的工厂契约共 9 个用例通过。
- 首轮探针误用默认 Configuration 的 streaming 值，并假定空配额是 null，导致两个断言失败。修正探针为显式 BATCH 和比较实际指定配额后通过；未修改产品代码来迎合断言。
- 1.20.0 候选以 JDK 17 执行 `-Ppublic,release-artifacts clean verify`：166 个离线检查和 4 个隔离分发 JAR 消费者检查通过。没有运行 Emulator／云端增量矩阵，也不以本次 JaCoCo 输出作为覆盖率门槛；隔离消费者导致一项类执行数据匹配警告。
- `tools/check-public.py` candidate 检查通过，95 个捆绑组件；JavaCsv 2.0 再分发审查仍未关闭。未上传 1.20.0 到 OSS 或 Central。
- 下载页只保留三个 latest 系列入口，均通过未签名 HEAD 验证，并以 ETag 与内容长度核对其当前版本。

## 文档质量审查

按安全、用户视角、内容准确、信息完整、主题结构、语言、标点、视觉、可译性与 SEO 十个维度检查。无真实密钥、内部 endpoint 或业务数据；所有能力回溯实现，模拟器与云端验证分开描述。操作页面含输入、步骤、预期结果和失败处理，所有 SQL 占位符标明需要替换。

反模式扫描未保留营销承诺、无来源性能数据或多方案无选型；图片的 Source／Sink 方向、时间线和中文文字已人工检查，并配替代文本与正文表格。格式、Markdown、拼写、front matter、产品登记、搜索索引、TypeScript 和生产站构建由 `npm run ci` 验证。提示框使用 `:::warning[标题]`／`:::caution[标题]`，并检查构建 HTML 中实际生成的提示框，避免构建成功但语法仍作为普通文本显示。

审查方法参见 [文档测试 Checklist](https://icms.alibaba-inc.com/portal/spec/gcs/t2356239.html) 和 [绘图规范](https://icms.alibaba-inc.com/portal/spec/gcs/t18937.html)。用户文档不依赖这些内部规范链接。文档保持 draft，真实产品发布责任组与云端能力验收仍需维护者确认。

## 页面预览

桌面与移动端检查覆盖产品首页、模式总览、生成图片、下载入口和导航。新增产品入口在小屏幕触发了原有桌面菜单拥挤，现将桌面菜单在移动断点隐藏，保留汉堡菜单中的产品入口。

- [桌面首页](assets/flink-connector/desktop-home.jpg)
- [移动首页](assets/flink-connector/mobile-home.jpg)
- [模式与时间线](assets/flink-connector/desktop-modes.jpg)
- [JAR 下载页](assets/flink-connector/latest-downloads.jpg)

- [提示框渲染验证](assets/flink-connector/warning-rendered.jpg)

## 参数完整性核对

总览和配置参考页共用参数数据与可搜索表格。逐项对照 SQL 工厂 required／optional 集合，共 88 个选项，无遗漏、无重复；另列 connector 标识、3 个 Catalog 配置及 3 个未注册定义，共 95 项。未注册的 upsert.writer.thread-num、upsert.writer.connection.limit、sink.idle-partition.timeout 不作为可运行 SQL 参数。partition 和 splitrowoffsetgranularity 虽注册，但当前 Source 无读取调用；已在表中标明。

对照本次分析快照的文件摘要：

| 文件                                           | SHA-256                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `table/OdpsOptions.java`                       | `eabab3038b1ffac874aa0bb37ee39b89e4892d27fdf237bb18bc96a61accfa3e` |
| `table/factories/OdpsDynamicTableFactory.java` | `5f4a4c93d318293b7d8cc9bf18b49a2ce890cd43b5e6d895945646ae5e98748d` |
| `catalog/factories/OdpsCatalogFactory.java`    | `839ce8e6617641b53af2235a5a970a66565f222f134c3def21a19009af01334c` |
