# 隐私政策差异对比器

纯前端隐私政策版本对比与风险标注工具，用户粘贴两版文本后查看条款差异、风险标签和审阅清单，数据存 localStorage。

## 审阅报告快照（导出即归档）

- 在「审阅清单」页点击导出时，系统生成一份**不可变的 ReviewReport 快照**：当时的新旧政策版本标签、每条款的风险等级、备注（标签/内容/审阅人/状态）全部冻结保存。
- 下载的 Markdown 由该快照渲染，与归档内容同源，发出去的和归档的始终一致；之后在归档页重新下载，内容逐字不变。
- 导出后修改备注或重标风险只影响实时数据，进入**下一份**报告；历史报告在「报告归档」页只读查看，并可选两份报告逐字段对比。
- 导出时仍处于待处理（OPEN / CONFIRMED 或尚未填写备注）的条目单独列入报告「未完成区」，不计入已通过。
- 快照与审阅改动均持久化在 localStorage（键前缀 `policy-diff.`），归档层拒绝覆盖同 id 报告。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20112>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia + localStorage |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `policy-diff`
- `FRONTEND_PORT`: 前端端口，默认 `20112`


## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: policy-diff`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-policy-diff}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DiffType: constants/DiffType、types/DiffType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PrivacyRiskLevel: constants/PrivacyRiskLevel、types/PrivacyRiskLevel、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ReviewStatus: constants/ReviewStatus、types/ReviewStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用；待处理子集 PENDING_REVIEW_STATUS 同时定义在 constants/ReviewStatus 与 types/ReviewStatus，被 ReviewReportConstructor 与审阅清单页引用。
- ReviewReport（审阅报告快照）: types/ReviewReport、constructors/ReviewReportConstructor、api/ReviewReport、stores/ReviewReportStore、utils/formatters（Markdown 渲染）、utils/reportCompare（报告对比）、pages/ReportsPage、logTemplates、errorMessages(REPORT_IMMUTABLE)、mocks/seedData。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
