# Flink 文档配图生成记录

使用内置 ImageGen 工具生成，未使用 CLI fallback。生成后逐项检查中文文字、Source／Sink 方向、时间区间与功能边界。图中信息同时由可搜索的正文、模式表格与替代文本表达。

## 读写架构

文件：`static/img/flink-connector/read-write.png`。

```text
Use case: infographic-diagram. Asset type: final technical documentation illustration for MaxCompute Flink Connector, horizontal 16:9, very legible Chinese labels, polished restrained editorial technical infographic, white background, blue Source and green Sink accents, dark navy typography, subtle isometric database cylinders and tasteful flowing data blocks. Title exact: "Flink 与 MaxCompute 的读写路径". TWO SEPARATE large rows. TOP row direction strictly LEFT TO RIGHT: database labeled "MaxCompute" -> arrow labeled "Source · 读取" -> engine labeled "Flink SQL". Under Source label write "存量快照 / 有界增量 / 持续增量". BOTTOM row LEFT TO RIGHT: engine labeled "Flink SQL" -> arrow labeled "Sink · 写入" -> database labeled "MaxCompute". Under Sink label write "追加 INSERT / 主键 UPSERT 与 DELETE". A small central neutral strip says "Catalog · 表与分区元数据". Do not draw bidirectional arrows between engines/databases; separate reading and writing directions clearly. Avoid logos or invented promises, avoid performance or exactly-once claims, no extra text, no code. Large fonts, uncluttered, render all labels verbatim.
```

## Source 时间线

文件：`static/img/flink-connector/source-timeline.png`。

```text
Use case: infographic-diagram. Asset type: Chinese technical documentation explanatory timeline, horizontal 16:9, white background, navy text, blue and green clean geometric data blocks, restrained editorial infographic, large exact typography. Title: "Source：存量与增量如何选择". Four separate parallel horizontal rows, time grows LEFT TO RIGHT. Each row has left title and timeline; NOW vertical dotted marker shared near center. Row 1 title "存量读取" subtitle "bounded" shows one blue snapshot block at NOW then end stop icon, exact end label "读完结束". Row 2 title "有界增量" subtitle "incremental" shows bracket between "起点" and "终点" BEFORE NOW, changes blocks only inside bracket, exact label "(start, end]". Row 3 title "持续增量" subtitle "latest" shows NOW then green change blocks and a right pointing arrow continuing into future, exact label "跳过初始存量". Row 4 title "存量 + 增量" subtitle "latest-full" shows blue snapshot at NOW followed by green change blocks into future, exact label "先读快照，再追踪变更". Footer exact: "持续增量要求主键事务表与服务端增量能力". Do not show historical batch snapshots, do not promise exactly-once or ordinary table CDC, no extra modes or text, no logos. Keep chronology correct and all labels legible.
```
