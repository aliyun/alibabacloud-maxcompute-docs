# Flink 增量文档覆盖对照

对照范围为用户粘贴的《Flink 增量读取 MaxCompute Delta Table》说明。该说明只用于提取功能与教学环节清单，不作为当前参数和行为的权威来源。现有实现依据 `codex/sca-emulator-tests` 已提交代码；服务端配置核对当前官方资料。

## 原有内容与本次补齐

| 原说明覆盖的任务                     | 此前状态           | 当前入口与处理                                            |
| ------------------------------------ | ------------------ | --------------------------------------------------------- |
| Streaming Query                      | 已有模式与参数     | 操作向导的“持续读取变更”                                  |
| latest                               | 已有说明           | 选择启动位置；强调跳过初始存量和首次枚举时机              |
| latest-full                          | 已有说明           | 增加独立初始存量 SQL，再观察后续变化                      |
| from-snapshot                        | 已有参数           | 获取真实版本、填写起点，保留 long 精度                    |
| from-timestamp                       | 已有参数           | 校验有效日期及毫秒格式；提醒时区一致                      |
| from-snapshot-full                   | 已注明未实现       | 界面可选并解释限制，不生成运行配方                        |
| APPEND／CDC                          | 已有参数           | 界面选择；区分表数据增量与变化行                          |
| continuousDiscoveryInterval          | 已有默认与限制     | 表单校验至少 30 秒；与服务端构建周期区分                  |
| Batch Incremental Query              | 已有版本示例       | 操作向导的“回放一段增量”                                  |
| 版本区间                             | 已有 5,10 说明     | 捕获真实 start／end，校验顺序与 long 范围                 |
| 时间区间                             | 只有配置片段       | 完整 SQL 生成，检查有效日期和区间顺序                     |
| 有界 CDC                             | 只提示契约限制     | 展示受限原因；不生成可执行配方，提供替代方向              |
| Storage API 依赖                     | 缺独立准备环节     | 增量环境准备及向导的前置检查                              |
| 安装 Standalone 与启动集群           | 安装页没有启动命令 | 新增 Standalone 的 start-cluster 与 sql-client 路径       |
| 创建主键 CDC 表                      | 缺完整教学 DDL     | 同步／异步 CDC 建表模板与当前官方说明                     |
| CDC 建表中的 INSERT passthrough 属性 | 未写入             | 不当作前提；按当前官方说明使用 MERGE 新增                 |
| 创建 Flink 临时映射                  | 主要是普通表映射   | 向导生成 CREATE TEMPORARY TABLE 和一致字段                |
| SQL Client changelog 显示            | 缺显式设置         | 持续配方加入 result-mode=changelog                        |
| 新增两行并观察                       | 只有存量快速开始   | 两条 MERGE，对照 +I 变化                                  |
| UPDATE／DELETE 并观察                | 缺完整两端闭环     | MaxCompute SQL 操作；说明 +U／-D 与可能的 -U              |
| 最终源表结果                         | 缺独立核对         | 独立空表练习的最终值、删除主键与作业结束状态              |
| 单次运行顺序与两端职责               | 分散在多个页面     | MaxCompute SQL／Flink SQL Client 分段、按任务调整执行顺序 |

在此基础上增加最新分区场景及显式就绪声明、Schema 名称选择、认证模板、输入校验和故障排查。当前未支持的代码契约没有通过文档包装为已支持功能。

## 当前事实依据

- 启动与区间校验：`OdpsDynamicTableSource`、`OdpsOptions`、`ContinuousOdpsEnumerator`。
- 变化类型：`ArrowUtils.toFlinkRowKind` 映射 INSERT、UPDATE_BEFORE、UPDATE_AFTER、DELETE；页面只将变化示意作为预期，不把它标为本次服务运行截图。
- [Delta Table CDC](https://help.aliyun.com/zh/maxcompute/user-guide/change-data-capture)：同步／异步属性与 MERGE 建议。
- [MERGE INTO](https://help.aliyun.com/en/maxcompute/merge-into-2)：新增与更新语法。
- [Storage API](https://help.aliyun.com/zh/maxcompute/open-storage-overview-1)：服务能力前提。
- [Delta Table 查询](https://help.aliyun.com/zh/maxcompute/timetravel-query-and-incremental-query)：获取版本、历史与范围。
- [Flink 1.20 SQL Client](https://nightlies.apache.org/flink/flink-docs-release-1.20/zh/docs/dev/table/sqlclient/)：SQL Client 与 changelog 展示。

## 验证范围

配方生成契约验证所有启动模式、版本／时间区间、独立初始存量、Schema、认证、CDC 构建方式、最新分区协议及错误输入。完整 `npm run ci` 包含这些检查和生产构建。

浏览器验证默认持续 CDC、latest-full、指定版本、版本与时间回放、不支持的有界 CDC、非法输入和移动布局。未提交任何实际服务作业，也未修改 Connector 运行代码；云端权限、CDC 就绪、恢复与端到端结果仍按目标服务单独验收。

## 界面预览

- [桌面向导](assets/flink-connector/incremental-guide-desktop.jpg)
- [移动向导](assets/flink-connector/incremental-guide-mobile.jpg)

桌面与 390 px 移动视口均无页面横向溢出。浏览器实际切换后核对了 latest-full 的存量 SQL、超出 JavaScript 安全整数范围的版本号、版本与时间回放、非法区间时隐藏 SQL、受限 CDC 不生成运行步骤、分区声明确认及仅含场景的分享链接；无浏览器错误。

## 博客入口与导航

操作向导位于“Source · 读取”下，排在环境准备之后；产品首页和相关模式页保留入口。博客《用 Flink SQL 读取 MaxCompute 增量》复用同一组件，内嵌模式使用 h2／h3／h4，页面只有一个 h1。桌面与 390 px 移动视口检查无横向溢出，实际验证 latest-full 的初始存量 SQL 和受限模式隐藏 SQL；浏览器无错误。

- [博客内嵌向导桌面预览](assets/flink-connector/incremental-blog-desktop.jpg)
- [博客内嵌向导移动预览](assets/flink-connector/incremental-blog-mobile.jpg)
