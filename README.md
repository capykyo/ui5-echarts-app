# UI5 ECharts Application

一个基于 OpenUI5 和 Apache ECharts 的高性能数据可视化应用，遵循 SAPUI5 vizFrame 组件的最佳实践，支持处理大规模数据集。

## 📋 项目简介

本项目将 **OpenUI5 1.143.1** 与 **Apache ECharts 6.0.0** 深度集成，提供了一个功能完整、性能优化的数据可视化解决方案。项目采用 SAPUI5 vizFrame 组件的最佳实践，特别针对大规模数据集的渲染和交互进行了优化。

## ✨ 主要特性

### 📊 丰富的图表类型
- **折线图** (Line Chart) - 支持时间序列数据可视化
- **柱状图** (Bar Chart) - 支持横向和纵向展示
- **饼图** (Pie Chart) - 支持环形图和玫瑰图
- **散点图** (Scatter Chart) - 支持多维数据展示
- **雷达图** (Radar Chart) - 支持多维度对比
- **树图** (Tree Chart) - 支持层级数据可视化
- **漏斗图** (Funnel Chart) - 支持流程数据展示
- **仪表盘** (Gauge Chart) - 支持指标监控
- **热力图** (Heatmap Chart) - 支持密度数据可视化
- **K线图** (Candlestick Chart) - 支持金融数据展示

### 🚀 性能优化
- **大数据集处理** - 支持 10,000+ 数据点的流畅渲染
- **数据采样** - 自动应用 LTTB (Largest-Triangle-Three-Buckets) 采样算法
- **渐进式渲染** - 支持大数据集的渐进式加载
- **虚拟渲染** - 仅渲染可见区域的数据点
- **内存管理** - 完善的资源清理机制，防止内存泄漏

### 🎨 UI5 深度集成
- **自定义控件** - 完全符合 SAPUI5 规范的 EChart 控件
- **属性绑定** - 支持双向数据绑定
- **事件系统** - 完整的 UI5 事件机制
- **响应式设计** - 自动适配不同屏幕尺寸
- **主题支持** - 支持 SAPUI5 主题系统

### 📡 数据源支持
- **OData 服务** - 支持 OData V4 协议
- **Mock 数据** - 内置 Mock 数据生成器
- **JSON 数据** - 支持静态 JSON 数据
- **实时数据** - 支持动态数据更新

## 🛠️ 技术栈

- **前端框架**: OpenUI5 1.143.1
- **图表库**: Apache ECharts 6.0.0
- **构建工具**: UI5 CLI 4.0.39
- **模块打包**: ui5-tooling-modules
- **开发服务器**: UI5 Server with LiveReload
- **代码规范**: ESLint

### 核心依赖

```json
{
  "dependencies": {
    "echarts": "^6.0.0"
  },
  "devDependencies": {
    "@ui5/cli": "^4.0.39",
    "ui5-middleware-livereload": "^3.2.1",
    "ui5-tooling-modules": "^3.34.2"
  }
}
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ui5-echarts-app
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm start
   ```

   应用将在 `http://localhost:8080` 启动

4. **构建生产版本**
   ```bash
   npm run build
   ```

   构建产物将输出到 `dist/` 目录

### 使用 Mock 数据

项目提供了 Mock 数据生成器，方便本地开发和测试：

```bash
npm run mock-data
```

这将启动一个 JSON Server，提供 Mock API 服务。

## 📁 项目结构

```
ui5-echarts-app/
├── webapp/                          # 应用主目录
│   ├── Component.js                 # UI5 组件入口
│   ├── manifest.json                # 应用清单文件
│   ├── index.html                   # 应用入口页面
│   ├── controller/                  # 控制器目录
│   │   ├── Main.controller.js       # 主控制器
│   │   ├── ChartList.controller.js  # 图表列表控制器
│   │   ├── ChartDetail.controller.js # 图表详情控制器
│   │   └── chart/                   # 各类型图表控制器
│   │       ├── LineChart.controller.js
│   │       ├── BarChart.controller.js
│   │       └── ...
│   ├── view/                        # 视图目录
│   │   ├── Main.view.xml            # 主视图
│   │   ├── ChartList.view.xml       # 图表列表视图
│   │   └── chart/                   # 各类型图表视图
│   ├── controls/                    # 自定义控件
│   │   └── EChart.js                # ECharts 封装控件
│   ├── model/                       # 数据模型
│   │   ├── ChartData.js             # 图表数据模型
│   │   └── models.js                # 模型集合
│   ├── utils/                       # 工具类
│   │   ├── DataGenerator.js         # 数据生成器
│   │   ├── OptimizationStrategies.js # 优化策略
│   │   ├── PerformanceMonitor.js    # 性能监控
│   │   └── ThemeColors.js           # 主题颜色
│   └── css/                         # 样式文件
│       └── style.css
├── docs/                            # 文档目录
│   ├── QUICK_START_MOCK.md          # Mock 数据快速开始
│   ├── DEVELOPMENT_SOP.md           # 开发标准流程
│   ├── NORTHWIND_SETUP.md           # Northwind 服务配置
│   ├── ODATA_MOCK_SERVICES.md       # OData Mock 服务
│   ├── TROUBLESHOOTING.md           # 故障排除
│   └── VIOLATION_WARNINGS.md        # 违规警告说明
├── scripts/                         # 脚本目录
│   └── generate-mock-data.js        # Mock 数据生成脚本
├── ui5.yaml                         # UI5 工具配置
├── package.json                     # 项目配置
└── README.md                        # 项目说明文档
```

## 💻 开发指南

### 使用 EChart 控件

在 XML 视图中使用自定义 EChart 控件：

```xml
<controls:EChart
    id="myChart"
    width="100%"
    height="400px"
    option="{/chartOption}"
    chartReady="onChartReady" />
```

在控制器中设置图表配置：

```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    
    return Controller.extend("ui5.echarts.app.controller.MyController", {
        onInit: function () {
            const oChartOption = {
                title: {
                    text: "示例图表"
                },
                xAxis: {
                    type: "category",
                    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                },
                yAxis: {
                    type: "value"
                },
                series: [{
                    data: [120, 200, 150, 80, 70, 110, 130],
                    type: "bar"
                }]
            };
            
            this.getView().getModel().setProperty("/chartOption", oChartOption);
        },
        
        onChartReady: function () {
            console.log("Chart is ready");
        }
    });
});
```

### 性能优化配置

对于大数据集（> 2000 点），控件会自动应用性能优化：

```javascript
const oOption = {
    // 大数据集模式
    large: true,
    largeThreshold: 2000,
    
    // 渐进式渲染
    progressive: 1000,
    progressiveThreshold: 3000,
    
    // 禁用动画（大数据集）
    animation: false,
    
    // 数据采样
    sampling: "lttb"
};
```

### 数据绑定

支持 UI5 数据绑定：

```xml
<controls:EChart
    option="{/chartOption}"
    width="{/chartWidth}"
    height="{/chartHeight}" />
```

## 📚 文档

项目提供了详细的文档，位于 `docs/` 目录：

- **[快速开始 - Mock 数据](./docs/QUICK_START_MOCK.md)** - 使用 Mock 数据进行快速开发
- **[开发标准流程](./docs/DEVELOPMENT_SOP.md)** - 开发规范和最佳实践
- **[Northwind 服务配置](./docs/NORTHWIND_SETUP.md)** - 配置 SAP Northwind OData 服务
- **[OData Mock 服务](./docs/ODATA_MOCK_SERVICES.md)** - 设置本地 OData Mock 服务
- **[故障排除](./docs/TROUBLESHOOTING.md)** - 常见问题和解决方案
- **[违规警告说明](./docs/VIOLATION_WARNINGS.md)** - UI5 规范违规说明

## 🏗️ 构建和部署

### 开发构建

```bash
npm start
```

启动开发服务器，支持热重载。

### 生产构建

```bash
npm run build
```

生成优化的生产版本，包括：
- 代码压缩和混淆
- 资源优化
- Component-preload.js 生成

### 代码检查

```bash
npm run lint
```

使用 ESLint 检查代码规范。

## 🧪 测试

项目支持多种测试场景：

- **单元测试** - 测试控件和工具类
- **性能测试** - 测试大数据集渲染性能
- **集成测试** - 测试完整的数据流

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循 SAPUI5 JavaScript 编码规范
- 使用 ESLint 进行代码检查
- 所有注释和文档使用英文
- 提交信息使用中文简体

## 📝 许可证

ISC License

## 🔗 相关链接

- [OpenUI5 文档](https://sapui5.hana.ondemand.com/)
- [Apache ECharts 文档](https://echarts.apache.org/)
- [UI5 Tooling 文档](https://sap.github.io/ui5-tooling/)
- [SAPUI5 最佳实践](https://sapui5.hana.ondemand.com/#/topic/91f3463f6d4f1014b6dd926db0e91070)

## 📧 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送 Pull Request

---

**注意**: 本项目遵循 SAPUI5 vizFrame 组件的最佳实践，特别针对大规模数据集的性能优化进行了深入实现。在使用过程中，请参考项目文档以获取最佳实践和性能优化建议。
