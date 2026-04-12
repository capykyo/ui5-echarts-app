# UI5 ECharts Application

A high-performance data visualization application built on **OpenUI5 1.143.1** and **Apache ECharts 6.0.0**, featuring a dark Observatory design system, 10 interactive chart types, a multi-chart dashboard, and a performance optimization lab.

![Dashboard Preview](https://raw.githubusercontent.com/capykyo/images/master/obsidian/UI5EChartsApplication.png)

## Features

### 10 Chart Types
| Chart | Description |
|-------|-------------|
| Line Chart | Time-series with multi-series, area fill, data zoom |
| Bar Chart | Horizontal/vertical categorical comparison |
| Pie Chart | Donut chart with interactive legend |
| Scatter Chart | 2D distribution with variable bubble size |
| Radar Chart | Multi-dimensional comparison |
| Heatmap | Time × category density grid |
| Gauge | KPI metric dashboard |
| Candlestick | Financial OHLC chart |
| Funnel Chart | Conversion funnel analysis |
| Tree Chart | Expandable hierarchy visualization |

### Dashboard
A single-page overview (`#/dashboard`) showing all 8 key charts simultaneously:
- Sidebar navigation to each chart detail page
- Top bar with live KPI chips (Total Orders, Avg Freight, Countries)
- Mock / Live data toggle reloads all charts instantly
- Per-chart loading spinner while data fetches

### Dual Data Sources
Switch between data sources at any time using the toggle button in the header or dashboard:

| Source | Description |
|--------|-------------|
| **Northwind OData V4** | Live public SAP OData service |
| **Mock Data** | Local `json-server` at `localhost:3000` |

Selection is persisted in `localStorage` and restored on page reload.

### Performance Optimization Lab (`#/optimization/sampling`)
Side-by-side comparison of rendering strategies with real metrics:
- **Data Sampling (LTTB)** — Largest-Triangle-Three-Buckets algorithm, 10K → 1K points
- **Performance Metrics** — Standard vs optimized rendering comparison
- **Data Volume Comparison** — 1K vs 10K points over same time range
- **Progressive Rendering** — Standard vs progressive rendering

Measures render time (ms) and memory usage (MB) for each scenario.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | OpenUI5 1.143.1 |
| Chart Library | Apache ECharts 6.0.0 (via CDN) |
| Build Tool | UI5 CLI 4.0.39 |
| Module Bundling | ui5-tooling-modules 3.34.2 |
| Dev Server | UI5 Server + LiveReload |
| Mock Server | json-server 1.0.0-beta |

## Quick Start

### Prerequisites
- Node.js >= 20.x
- npm >= 9.x

### Install & Run

```bash
# Clone the repository
git clone <repository-url>
cd ui5-echarts-app

# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm start
```

### Run with Mock Data

In a separate terminal, start the local mock server:

```bash
npm run mock-data
```

This generates `mock-data/mock-data.json` and starts `json-server` on port 3000, providing:
- `GET http://localhost:3000/Sales`
- `GET http://localhost:3000/Products`
- `GET http://localhost:3000/TimeSeries`

Then toggle **Mock Data** on in the app header.

### Production Build

```bash
npm run build
# Output: dist/
```

## Project Structure

```
ui5-echarts-app/
├── webapp/
│   ├── Component.js                    # App entry, restores localStorage state
│   ├── manifest.json                   # Routing: chartList / chartDetail / optimization / dashboard
│   ├── index.html                      # Bootstrap (sap_horizon_dark theme)
│   ├── controller/
│   │   ├── ChartList.controller.js     # Gallery page, chart card grid
│   │   ├── ChartDetail.controller.js   # Dynamic sub-view loader, back = history
│   │   ├── Optimization.controller.js  # Performance lab, 4 scenarios
│   │   ├── Dashboard.controller.js     # Multi-chart dashboard
│   │   └── chart/                      # One controller per chart type
│   │       ├── LineChart.controller.js
│   │       ├── BarChart.controller.js
│   │       ├── PieChart.controller.js
│   │       ├── ScatterChart.controller.js
│   │       ├── RadarChart.controller.js
│   │       ├── HeatmapChart.controller.js
│   │       ├── GaugeChart.controller.js
│   │       ├── CandlestickChart.controller.js
│   │       ├── FunnelChart.controller.js
│   │       └── TreeChart.controller.js
│   ├── view/
│   │   ├── ChartList.view.xml
│   │   ├── ChartDetail.view.xml
│   │   ├── Optimization.view.xml
│   │   ├── Dashboard.view.xml
│   │   └── chart/                      # One XML view per chart type
│   ├── controls/
│   │   └── EChart.js                   # Custom UI5 control wrapping ECharts instance
│   ├── model/
│   │   └── ChartData.js                # Unified data loader (Northwind + Mock)
│   ├── utils/
│   │   ├── ThemeColors.js              # SAP Horizon Dark color palette for ECharts
│   │   ├── DataGenerator.js            # Synthetic time-series data generator
│   │   ├── OptimizationStrategies.js   # LTTB sampling, large-dataset optimizations
│   │   └── PerformanceMonitor.js       # Render time + memory snapshot tracking
│   └── css/
│       └── style.css                   # Observatory design system (dark theme)
├── scripts/
│   └── generate-mock-data.js           # Generates mock-data/mock-data.json
├── docs/                               # Additional documentation
├── ui5.yaml                            # UI5 tooling config
└── package.json
```

## Pages & Routes

| URL | Page |
|-----|------|
| `#/` | Chart Gallery |
| `#/chart/{type}` | Chart Detail (line / bar / pie / scatter / radar / heatmap / gauge / candlestick / funnel / tree) |
| `#/dashboard` | Multi-chart Dashboard |
| `#/optimization/{scenario}` | Performance Optimization Lab |

## Custom EChart Control

The `EChart` control (`webapp/controls/EChart.js`) wraps an ECharts instance as a proper SAPUI5 control:

```xml
<app:EChart
    id="myChart"
    width="100%"
    height="400px"
    chartReady="onChartReady" />
```

```javascript
// In controller
var oChart = this.byId("myChart");
if (oChart._chart) {
    oChart.setOption(oChartOption);
} else {
    oChart.attachChartReady(function () {
        oChart.setOption(oChartOption);
    }, this);
}
```

Features:
- Auto-resizes with `sap/ui/core/ResizeHandler`
- Fires `chartReady` event after ECharts instance is initialized
- `setOption(option, { notMerge: true })` for clean re-renders
- Auto-disposes on `exit()`

## Data Model

`ChartData.js` is a singleton that abstracts both data sources:

```javascript
// Switch source at runtime
ChartData.setUseMockData(true);   // localhost:3000
ChartData.setUseMockData(false);  // Northwind OData V4

// Load data for any chart type
ChartData.loadDataForChart("line").then(function (oData) {
    // oData.type, oData.data
});
```

Supported types: `line`, `bar`, `pie`, `scatter`, `radar`, `heatmap`, `gauge`, `candlestick`, `funnel`, `tree`.

## Design System

The app uses a custom dark design system ("Observatory") defined in `style.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--obs-bg` | `#0b0d12` | Page background |
| `--obs-surface` | `#111520` | Card / panel background |
| `--obs-amber` | `#f6be4f` | Primary accent, active states |
| `--obs-teal` | `#3dd9c6` | Secondary accent |
| `--obs-blue` | `#5b9cf6` | Interactive / loading |
| `--obs-text-pri` | `#e8ecf4` | Primary text |
| `--obs-text-sec` | `#8993a8` | Secondary text |

Fonts: `Syne` (display), `DM Sans` (body), `Space Mono` (monospace/data).

## Scripts

```bash
npm start          # Dev server on :8080 with live reload
npm run build      # Production build → dist/
npm run lint       # ESLint check
npm run mock-data  # Generate mock data + start json-server on :3000
```

## Related Links

- [OpenUI5 Documentation](https://openui5.org/)
- [Apache ECharts Documentation](https://echarts.apache.org/en/index.html)
- [UI5 Tooling](https://sap.github.io/ui5-tooling/)
- [Northwind OData V4 Service](https://services.odata.org/V4/Northwind/Northwind.svc/)
