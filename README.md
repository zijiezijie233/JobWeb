# 陕西公考岗位库

面向陕西省公务员考试考生的岗位信息汇总平台。支持按地市、招录机关、专业、学历、政治面貌等条件组合筛选，查看岗位详情与考试时间线，并可将岗位收藏、横向对比。

## 技术栈

- Vite 6 + Vue 3 + TypeScript
- Tailwind CSS（自适应响应式 + 深色模式）
- 数据层为独立 JSON 文件，无需后端服务
- Hash 路由，构建产物可直接部署到任意静态托管

## 快速开始

```bash
npm install
npm run dev        # 本地开发 http://localhost:5173
npm run build      # 生产构建，产物在 dist/
npm run preview    # 预览构建产物 http://localhost:4173
```

## 目录结构

```
src/
├── components/          # 通用组件（头部、筛选面板、岗位卡片/表格…）
├── composables/         # 筛选状态与 URL 同步、收藏、主题
├── data/
│   ├── positions.json   # 岗位数据（唯一数据源）
│   ├── timelines.json   # 各年度考试时间线
│   ├── meta.json        # 年度、更新时间、来源、免责声明
│   └── index.ts         # 数据加载与派生选项（地市/专业/统计）
├── views/               # 5 个页面：列表 / 详情 / 时间线 / 收藏 / 关于
├── types/               # TypeScript 数据模型
└── utils/               # 日期、状态、关键词高亮等工具
scripts/xlsx2json.mjs    # 官方职位表 Excel → positions.json
```

## 页面

| 路由 | 说明 |
| --- | --- |
| `/#/` | 岗位列表：筛选、搜索、排序、卡片/表格视图、分页，条件同步到 URL |
| `/#/position/:id` | 岗位详情：报考条件、其他条件、咨询与来源、同地市岗位 |
| `/#/timeline` | 考试时间线：年度切换、节点状态（已完成/进行中/未开始）、倒计时 |
| `/#/favorites` | 收藏与对比：最多 4 个岗位横向对比条件差异 |
| `/#/about` | 数据概况、更新方式、免责声明 |

## 数据维护

### 方式一：直接编辑 JSON

编辑 `src/data/positions.json`，保存后刷新页面即可。单条岗位字段：

```jsonc
{
  "id": "sn-2027-0001",        // 内部唯一 ID，详情页链接使用
  "code": "27010001",           // 职位代码
  "org": "中共陕西省委办公厅",   // 招录机关
  "unit": "秘书处",              // 用人单位
  "name": "综合文字岗",          // 职位名称
  "category": "综合管理",        // 职位类别
  "intro": "职位简介",
  "headcount": 2,               // 招录人数
  "city": "西安",                // 地市（不带「市」字）
  "county": "省级",              // 省级 / 市级 / 区县名
  "education": "研究生（硕士）及以上",
  "degree": "硕士及以上",
  "majors": ["中国语言文学类"],  // 结构化专业标签，用于筛选
  "majorsRaw": "中国语言文学（0501）", // 专业原文，用于展示
  "political": "中共党员",       // 不限 / 中共党员
  "grassrootsYears": 2,         // 基层工作最低年限，0 = 不限
  "freshGrad": false,           // 是否仅限应届
  "gender": "不限",
  "ageLimit": "18-35周岁",
  "otherReq": "其他报考条件",
  "note": "备注",
  "phone": "029-85581001",
  "sourceUrl": "https://www.sxrsks.cn/",
  "updatedAt": "2026-11-02"
}
```

`majors` 建议使用 `src/data/index.ts` 中已出现的专业大类名称（如 `法学类`、`计算机类`），保证筛选侧边栏能命中。

### 方式二：从官方职位表导入

```bash
npm run import:excel -- "C:/path/职位表.xlsx"
# 可选参数：--sheet 职位表  --out src/data/positions.json  --year 2027  --source https://www.sxrsks.cn/
```

脚本会自动：

1. 在前 12 行内识别表头（兼容标题行、合并表头）
2. 按别名映射 20 个字段（职位代码、招录机关、专业、基层年限…）
3. 清洗专业（归并到大类标签）、基层年限、应届、性别、地市/区县
4. 覆盖写入 `positions.json` 并打印校验报告

> 导入后请检查报告中的「缺失字段」提示，必要时在 Excel 中补列或手动修正 JSON。

### 时间线

`src/data/timelines.json` 为数组，每个年度包含 `year`、`name`、`announcementUrl`、`events`。节点状态由日期实时计算，无需手工维护；官方未发布的日期可加 `"estimated": true`，页面会显示「预估」标签。

## 部署

```bash
npm run build
```

将 `dist/` 目录上传至任意静态托管（对象存储、Nginx、Vercel/Netlify 均可）。已使用 Hash 路由与相对路径（`base: './'`），无需服务端 rewrite 配置。

### GitHub Pages（已内置自动部署）

仓库已包含 `.github/workflows/deploy.yml`：推送到 `main` 分支后自动构建并发布到 Pages，无需本地构建产物（`.gitignore` 已忽略 `dist/`）。

首次使用只需三步：

1. 在 GitHub 新建仓库（Public 才能免费使用 Pages），名称自定，例如 `sn-gwy-jobs`
2. 关联并推送代码：

   ```bash
   git remote add origin https://github.com/<用户名>/<仓库名>.git
   git push -u origin main
   ```

3. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**

工作流跑完后，页面地址为 `https://<用户名>.github.io/<仓库名>/`。之后每次 `git push` 都会自动重新部署；也可以在 Actions 页面手动点击 **Run workflow**。

> 说明：公开仓库会被任何人访问，请勿提交含个人信息的职位表数据。若改用 `gh-pages` 分支手动发布，可运行 `npm run build && git subtree push --prefix dist origin gh-pages`。

## 说明

站内示例岗位与时间线仅用于演示功能，实际报考请以[陕西人事考试网](https://www.sxrsks.cn/)及陕西省公务员局正式公告为准。收藏与对比数据保存在浏览器 localStorage，不上传服务器。
