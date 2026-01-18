# UI5 + ECharts + Horizon 主题集成开发 SOP

## 项目概述

本项目成功集成了 **OpenUI5 1.143.1**、**Apache ECharts 6.0.0** 和 **SAP Horizon 主题**，创建了一个高性能的数据可视化应用。

---

## 一、项目架构

### 1.1 技术栈

- **UI5 框架**: OpenUI5 1.143.1
- **图表库**: Apache ECharts 6.0.0
- **主题**: SAP Horizon (sap_horizon)
- **构建工具**: UI5 CLI 4.0.39
- **模块打包**: ui5-tooling-modules

### 1.2 目录结构

```
ui5-echarts-app/
├── webapp/
│   ├── controller/
│   │   └── Main.controller.js      # 主控制器
│   ├── controls/
│   │   └── EChart.js               # 自定义 ECharts 控件
│   ├── view/
│   │   └── Main.view.xml           # 主视图
│   ├── utils/
│   │   └── ThemeColors.js          # 主题颜色工具
│   ├── css/
│   │   └── style.css               # 自定义样式
│   ├── index.html                  # 入口 HTML
│   └── manifest.json               # 应用清单
├── docs/                           # 文档目录
├── package.json                    # 项目配置
└── ui5.yaml                        # UI5 工具配置
```

---

## 二、开发流程

### 2.1 初始化项目

```bash
# 1. 创建项目目录
mkdir ui5-echarts-app
cd ui5-echarts-app

# 2. 初始化 npm 项目
npm init -y

# 3. 安装 UI5 CLI
npm install --save-dev @ui5/cli

# 4. 安装 UI5 工具
npm install --save-dev ui5-tooling-modules ui5-middleware-livereload

# 5. 创建基础目录结构
mkdir -p webapp/{controller,controls,view,utils,css}
```

### 2.2 配置文件设置

#### package.json

```json
{
  "scripts": {
    "start": "ui5 serve --config=ui5.yaml --port 8080 -o index.html",
    "build": "ui5 build --config=ui5.yaml"
  },
  "dependencies": {
    "echarts": "^6.0.0"
  },
  "devDependencies": {
    "@ui5/cli": "^4.0.39",
    "ui5-tooling-modules": "^0.2.0",
    "ui5-middleware-livereload": "^0.5.0"
  }
}
```

#### ui5.yaml

```yaml
specVersion: "3.0"
metadata:
  name: ui5-echarts-app
type: application
framework:
  name: OpenUI5
  version: 1.143.1
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: sap.ui.layout
resources:
  configuration:
    paths:
      webapp: webapp
builder:
  customTasks:
    - name: ui5-tooling-modules-task
      afterTask: replaceVersion
server:
  customMiddleware:
    - name: ui5-middleware-livereload
      afterMiddleware: compression
    - name: ui5-tooling-modules-middleware
      afterMiddleware: compression
```

#### webapp/index.html

```html
<!DOCTYPE HTML>
<html>
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta charset="UTF-8">
  <title>UI5 ECharts App</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">
  <script
    id="sap-ui-bootstrap"
    src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"
    data-sap-ui-theme="sap_horizon"
    data-sap-ui-resourceroots='{"ui5.echarts.app": "./"}'
    data-sap-ui-compatVersion="edge"
    data-sap-ui-async="true"
    data-sap-ui-frameworkVersion="1.143.1">
  </script>
  <!-- ... -->
</head>
<body class="sapUiBody" id="content">
</body>
</html>
```

---

## 三、核心组件开发

### 3.1 自定义 EChart 控件

**文件**: `webapp/controls/EChart.js`

#### 关键实现点：

1. **生命周期管理**
   - `init()`: 初始化私有变量
   - `onAfterRendering()`: DOM 就绪后初始化 ECharts
   - `exit()`: 清理资源（dispose chart, unregister resize handler）

2. **ECharts 库加载**
   - 优先使用 `require` (ui5-tooling-modules)
   - 降级到 CDN 加载
   - 使用 Promise 确保异步加载完成

3. **容器高度处理**
   ```javascript
   // 强制设置容器高度（关键！）
   if (!oDomRef.style.height || oDomRef.offsetHeight === 0) {
     oDomRef.style.height = sHeight;
     oDomRef.style.width = sWidth;
     oDomRef.style.display = "block";
     oDomRef.style.minHeight = sHeight;
   }
   ```

4. **响应式处理**
   - 使用 `sap.ui.core.ResizeHandler` 监听容器大小变化
   - 调用 `chart.resize()` 更新图表尺寸

5. **Renderer 实现**
   ```javascript
   renderer: function (oRM, oControl) {
     oRM.openStart("div", oControl);
     oRM.style("width", oControl.getWidth());
     oRM.style("height", oControl.getHeight());
     oRM.style("display", "block");
     oRM.style("min-height", oControl.getHeight());
     oRM.openEnd();
     oRM.close("div");
   }
   ```

### 3.2 主题颜色工具

**文件**: `webapp/utils/ThemeColors.js`

#### 功能：

1. **自动检测主题**
   ```javascript
   const sTheme = sap.ui.getCore().getConfiguration().getTheme();
   const bIsDark = sTheme.indexOf("dark") !== -1 || sTheme.indexOf("evening") !== -1;
   ```

2. **颜色调色板**
   - Primary: `#0070F2`
   - Accent Colors: 橙色、红色、粉色、紫色等
   - 根据主题自动调整文本和背景色

3. **应用主题**
   ```javascript
   oChartOption = ThemeColors.applyThemeColors(oChartOption);
   ```

### 3.3 控制器实现

**文件**: `webapp/controller/Main.controller.js`

#### 关键点：

1. **数据加载**
   - 使用 `fetch API` 避免 CORS 问题
   - 在 `onAfterRendering` 中加载数据（确保视图已渲染）

2. **数据转换**
   - OData 格式转换为 ECharts 时间序列格式
   - 按国家分组创建多系列图表

3. **图表配置**
   - 使用 `let` 而非 `const`（需要重新赋值应用主题）
   - 性能优化：大数据集禁用动画、启用渐进渲染

---

## 四、关键注意事项

### 4.1 UI5 资源加载

⚠️ **问题**: 使用相对路径 `/resources/...` 会导致 404 错误

✅ **解决**: 使用 CDN 或配置本地资源服务

```html
<!-- 推荐：使用 CDN -->
<script src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"></script>
```

### 4.2 模块导入路径

⚠️ **问题**: `sap/ui/base/Log` 路径错误

✅ **解决**: 使用正确的路径 `sap/base/Log`

```javascript
sap.ui.define([
  "sap/base/Log"  // ✅ 正确
  // "sap/ui/base/Log"  // ❌ 错误
], function (Log) {
  // ...
});
```

### 4.3 容器高度问题

⚠️ **问题**: Page content section 高度为 0，图表不显示

✅ **解决**: 
1. 在 CSS 中设置最小高度
2. 在 renderer 中强制设置高度
3. 在 `_initChart` 中检查并修复高度

```css
/* webapp/css/style.css */
.sapMPageContent {
  min-height: 500px;
  height: auto !important;
}

section[id*="page0-cont"] {
  min-height: 500px !important;
  height: auto !important;
}
```

### 4.4 OData 模型初始化

⚠️ **问题**: OData V4 模型没有 `read()` 方法

✅ **解决**: 
- 方案1: 使用 OData V2 模型（有 `read()` 方法）
- 方案2: 使用 `fetch API` 直接获取数据（推荐，避免 CORS）

```javascript
// 推荐：使用 fetch API
fetch("https://services.odata.org/V4/Northwind/Northwind.svc/Orders?...")
  .then(response => response.json())
  .then(data => {
    // 处理数据
  });
```

### 4.5 CORS 问题

⚠️ **问题**: 跨域请求被阻止

✅ **解决**: 
- 使用支持 CORS 的服务（如 Northwind V4）
- 或使用代理服务器
- 或使用本地 mock 数据

### 4.6 图表初始化时机

⚠️ **问题**: 图表在数据加载前初始化，导致无数据显示

✅ **解决**: 
- 在 `onAfterRendering` 中初始化
- 使用 `chartReady` 事件确保图表就绪后再设置数据
- 保存 option，在图表初始化后自动应用

```javascript
// 保存 option，图表初始化后自动应用
setOption: function (oOption) {
  this.setProperty("option", oOption, true);
  if (this._chart) {
    this._chart.setOption(oOption);
  }
}
```

### 4.7 常量重新赋值

⚠️ **问题**: `Assignment to constant variable` 错误

✅ **解决**: 使用 `let` 而非 `const`

```javascript
let oChartOption = { /* ... */ };  // ✅ 正确
// const oChartOption = { /* ... */ };  // ❌ 错误（无法重新赋值）
oChartOption = ThemeColors.applyThemeColors(oChartOption);
```

### 4.8 dataZoom 滑块位置

⚠️ **问题**: dataZoom slider 与图表内容重合

✅ **解决**: 增加 grid bottom 间距，设置 slider 位置

```javascript
grid: {
  bottom: "15%",  // 为 slider 留出空间
  top: "15%"      // 为标题和图例留出空间
},
dataZoom: [{
  type: "slider",
  bottom: "5%",   // slider 位置
  height: 30
}]
```

---

## 五、遇到的问题及解决方案

### 问题 1: UI5 资源 404 错误

**错误信息**:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Refused to apply style from '.../library.css' because its MIME type ('text/html') is not a supported stylesheet MIME type
```

**原因**: 使用相对路径但 UI5 CLI 未配置本地资源服务

**解决方案**: 使用 OpenUI5 CDN

```html
<script src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"></script>
```

---

### 问题 2: 模块加载错误

**错误信息**:
```
ModuleError: Failed to resolve dependencies of 'ui5/echarts/app/controller/Main.controller.js' 
-> 'sap/ui/base/Log.js': failed to load
```

**原因**: 错误的模块路径

**解决方案**: 使用正确的路径 `sap/base/Log`

---

### 问题 3: OData 模型未初始化

**错误信息**:
```
OData model not available
_waitForModelAndLoadData called, model: undefined
```

**原因**: 
- OData V4 模型初始化是异步的
- manifest.json 中的模型配置可能未生效

**解决方案**: 
- 使用 `fetch API` 直接获取数据（推荐）
- 或手动创建模型并等待 metadata 加载

---

### 问题 4: 图表容器高度为 0

**错误信息**: 图表不显示，检查 DOM 发现容器高度为 0

**原因**: 
- Page content section 没有明确的高度
- EChart 控件的 renderer 未正确设置高度

**解决方案**:
1. 在 CSS 中设置最小高度
2. 在 renderer 中强制设置高度和 display
3. 在 `_initChart` 中检查并修复高度

---

### 问题 5: CORS 错误

**错误信息**:
```
Access to XMLHttpRequest at 'https://services.odata.org/...' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

**原因**: 浏览器的同源策略限制

**解决方案**: 
- 使用支持 CORS 的服务（Northwind V4）
- 使用 `fetch API`（某些情况下 CORS 处理更好）

---

### 问题 6: 图表不显示数据

**错误信息**: 图表初始化成功，但无数据显示

**原因**: 
- 数据加载时机问题
- option 设置时机问题

**解决方案**:
- 在 `onAfterRendering` 中加载数据
- 使用 `chartReady` 事件确保图表就绪
- 保存 option，在图表初始化后自动应用

---

### 问题 7: 常量重新赋值错误

**错误信息**:
```
TypeError: Assignment to constant variable.
at c._updateChartWithOrders (Main.controller.js:233:17)
```

**原因**: 使用 `const` 声明变量后尝试重新赋值

**解决方案**: 使用 `let` 声明变量

```javascript
let oChartOption = { /* ... */ };
oChartOption = ThemeColors.applyThemeColors(oChartOption);  // ✅ 可以重新赋值
```

---

## 六、性能优化

### 6.1 大数据集处理

```javascript
// 启用性能优化选项
if (aData.length > 2000) {
  oChartOption.animation = false;
  oChartOption.progressive = 1000;
  oChartOption.progressiveThreshold = 3000;
  oChartOption.series.forEach(s => {
    s.large = true;
    s.largeThreshold = 2000;
  });
}
```

### 6.2 内存管理

```javascript
exit: function () {
  // 取消注册 resize handler
  if (this._sResizeHandlerId) {
    ResizeHandler.deregister(this._sResizeHandlerId);
    this._sResizeHandlerId = null;
  }
  
  // 销毁图表实例
  if (this._chart) {
    this._chart.dispose();
    this._chart = null;
  }
}
```

### 6.3 数据采样

对于超大数据集（>10,000 点），考虑使用数据采样算法（如 LTTB）。

---

## 七、开发检查清单

### 7.1 初始化检查

- [ ] UI5 框架正确加载（CDN 或本地）
- [ ] 主题配置正确（`data-sap-ui-theme="sap_horizon"`）
- [ ] 资源路径配置正确（`data-sap-ui-resourceroots`）
- [ ] ECharts 库正确加载（CDN 或 require）

### 7.2 控件开发检查

- [ ] 实现了完整的生命周期方法（init, onAfterRendering, exit）
- [ ] Renderer 正确设置容器尺寸和样式
- [ ] 容器高度问题已解决
- [ ] Resize handler 正确注册和注销
- [ ] 图表实例正确 dispose

### 7.3 数据加载检查

- [ ] 数据加载时机正确（onAfterRendering）
- [ ] 错误处理完善
- [ ] 数据格式转换正确
- [ ] 支持大数据集

### 7.4 主题集成检查

- [ ] 主题颜色工具正确实现
- [ ] 颜色自动适配主题（浅色/深色）
- [ ] 所有图表元素应用主题颜色
- [ ] 文本、边框、背景色正确

### 7.5 性能检查

- [ ] 大数据集性能优化启用
- [ ] 内存泄漏检查（Chrome DevTools）
- [ ] 图表 resize 性能良好
- [ ] 动画在适当时机禁用

---

## 八、最佳实践

### 8.1 代码组织

- 使用命名空间：`ui5.echarts.app.*`
- 遵循 UI5 命名约定
- 模块化设计（工具类、控件分离）

### 8.2 错误处理

```javascript
try {
  // 图表操作
} catch (oError) {
  Log.error("Error message", oError);
  // 用户友好的错误提示
  this._showError("操作失败，请重试");
}
```

### 8.3 日志记录

```javascript
// 开发阶段使用 console.log
console.log("Debug info:", oData);

// 生产环境使用 Log
Log.info("Operation completed");
Log.error("Error occurred", oError);
```

### 8.4 文档注释

```javascript
/**
 * Update EChart with orders data
 * @param {Array} aOrders - Array of order objects
 */
_updateChartWithOrders: function (aOrders) {
  // ...
}
```

---

## 九、调试技巧

### 9.1 Chrome DevTools

- **Network 标签**: 检查资源加载
- **Console 标签**: 查看日志和错误
- **Elements 标签**: 检查 DOM 结构和样式
- **Performance 标签**: 分析性能问题
- **Memory 标签**: 检查内存泄漏

### 9.2 常用调试命令

```javascript
// 检查图表实例
document.querySelector('#__xmlview0--echart')._chart

// 检查图表配置
document.querySelector('#__xmlview0--echart')._chart.getOption()

// 手动触发 resize
document.querySelector('#__xmlview0--echart')._chart.resize()

// 检查容器尺寸
document.querySelector('#__xmlview0--echart').offsetWidth
document.querySelector('#__xmlview0--echart').offsetHeight
```

---

## 十、部署注意事项

### 10.1 构建配置

```bash
npm run build
```

构建输出：
- `dist/` 目录包含优化后的文件
- 资源已压缩和合并
- 生成 Component-preload.js

### 10.2 生产环境配置

- 移除调试日志
- 使用压缩后的资源
- 配置正确的资源路径
- 检查 CORS 配置（如需要）

---

## 十一、参考资料

### 官方文档

- [SAPUI5 文档](https://sapui5.hana.ondemand.com/)
- [OpenUI5 文档](https://openui5.org/)
- [ECharts 官方文档](https://echarts.apache.org/)
- [ECharts 配置项手册](https://echarts.apache.org/zh/option.html)
- [ECharts API 文档](https://echarts.apache.org/zh/api.html)
- [UI5 Tooling 文档](https://sap.github.io/ui5-tooling/)
- [SAP Fiori Design Guidelines](https://experience.sap.com/fiori-design-web/)
- [SAP Horizon 主题文档](https://experience.sap.com/fiori-design-web/horizon/)

### 开发工具

- [UI5 CLI](https://github.com/SAP/ui5-cli)
- [UI5 Tooling Modules](https://github.com/ui5-community/ui5-tooling-modules)
- [UI5 Middleware LiveReload](https://github.com/SAP/ui5-middleware-livereload)
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### 主题和样式

- [SAP Horizon 颜色系统](https://experience.sap.com/fiori-design-web/horizon/)
- [SAP Fiori 设计系统](https://experience.sap.com/fiori-design-web/)
- [CSS 变量和主题定制](https://sapui5.hana.ondemand.com/#/topic/497c27a3d0c94c0b8c5b4273a035b6f4)

### 最佳实践

- [SAPUI5 最佳实践](https://sapui5.hana.ondemand.com/#/topic/91f3463f6d4f1014b6dd926db0e91070)
- [ECharts 性能优化](https://echarts.apache.org/handbook/en/best-practice/performance/)
- [大数据可视化优化](https://echarts.apache.org/handbook/en/concepts/style/#large-dataset)

### 社区资源

- [SAP Community](https://community.sap.com/)
- [Stack Overflow - SAPUI5](https://stackoverflow.com/questions/tagged/sapui5)
- [Stack Overflow - ECharts](https://stackoverflow.com/questions/tagged/echarts)
- [GitHub - OpenUI5](https://github.com/SAP/openui5)
- [GitHub - ECharts](https://github.com/apache/echarts)

### 示例和教程

- [SAPUI5 示例](https://sapui5.hana.ondemand.com/#/controls)
- [ECharts 示例库](https://echarts.apache.org/examples/zh/index.html)
- [UI5 Tooling 示例项目](https://github.com/SAP-samples/ui5-tooling-samples)

### 相关技术

- [OData 规范](https://www.odata.org/)
- [SAP Northwind OData 服务](https://services.odata.org/)
- [AMD 模块规范](https://github.com/amdjs/amdjs-api/blob/master/AMD.md)
- [JavaScript 严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)