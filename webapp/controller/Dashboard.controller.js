sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	var COLORS = ["#5b9cf6", "#f6be4f", "#3dd9c6", "#a78bfa", "#34d399", "#fb923c", "#f43f5e", "#e2d16b", "#60a5fa", "#4ade80"];

	return Controller.extend("ui5.echarts.app.controller.Dashboard", {

		onInit: function () {
			this.getRouter().getRoute("dashboard").attachPatternMatched(this._onMatched, this);
			// Wire all nav via event delegation on the view root after first render
			this.getView().addEventDelegate({ onAfterRendering: this._setupNav.bind(this) });
		},

		_onMatched: function () {
			this._updateMockToggle();
			// Ensure view DOM is ready before showing loading overlays
			var oView = this.getView();
			if (oView.getDomRef()) {
				this._loadAll();
			} else {
				oView.addEventDelegate({ onAfterRendering: this._loadAll.bind(this) }, this);
			}
		},

		// ── Navigation wiring (event delegation — fires once after first render) ──
		_setupNav: function () {
			if (this._navReady) { return; }
			var oRoot = this.getView().getDomRef();
			if (!oRoot) { return; }
			this._navReady = true;
			var that = this;

			oRoot.addEventListener("click", function (oEvent) {
				var oTarget = oEvent.target.closest("[id]");
				if (!oTarget) { return; }
				var sId = oTarget.id.replace(/^.*--/, ""); // strip view prefix

				// Chart nav
				var mChart = {
					"dbNav-line": "line", "dbNav-bar": "bar", "dbNav-pie": "pie",
					"dbNav-scatter": "scatter", "dbNav-radar": "radar", "dbNav-heatmap": "heatmap",
					"dbNav-gauge": "gauge", "dbNav-candlestick": "candlestick",
					"dbNav-funnel": "funnel", "dbNav-tree": "tree"
				};
				if (mChart[sId]) {
					that.getRouter().navTo("chartDetail", { chartType: mChart[sId] });
					return;
				}
				if (sId === "dbNav-optimization") {
					that.getRouter().navTo("optimization", { scenario: "sampling" });
					return;
				}
				if (sId === "dbNavBack") {
					that.getRouter().navTo("chartList");
					return;
				}
				if (sId === "dbMockToggle") {
					var bNow = !ChartData.isUsingMockData();
					ChartData.setUseMockData(bNow);
					localStorage.setItem("ui5.echarts.useMockData", String(bNow));
					that._updateMockToggle();
					that._loadAll();
				}
			});
		},

		_updateMockToggle: function () {
			var bMock = ChartData.isUsingMockData();
			// Update sidebar label
			var oLabelEl = this._domById("dbDataSourceLabel");
			if (oLabelEl) { oLabelEl.textContent = bMock ? "Mock Data (localhost:3000)" : "Northwind OData V4"; }
			// Update toggle button style
			var oToggleEl = this._domById("dbMockToggle");
			if (oToggleEl) {
				oToggleEl.classList.toggle("dbToggleBtnActive", bMock);
				oToggleEl.textContent = bMock ? "Live Data" : "Mock Data";
			}
		},

		// ── Load all charts in parallel ──────────────────────────────────
		_loadAll: function () {
			var that = this;
			var aTypes = ["line","bar","pie","scatter","funnel","tree","candlestick","gauge"];

			// Show loading on all chart cards immediately
			aTypes.forEach(function (sType) {
				that._showChartLoading("dbChart" + sType.charAt(0).toUpperCase() + sType.slice(1));
			});

			aTypes.forEach(function (sType) {
				ChartData.loadDataForChart(sType).then(function (oData) {
					that["_render_" + sType](oData.data);
				}).catch(function (oErr) {
					Log.error("Dashboard: failed to load " + sType, oErr);
					that._hideChartLoading("dbChart" + sType.charAt(0).toUpperCase() + sType.slice(1));
				});
			});
		},

		// ── Chart renderers ──────────────────────────────────────────────

		// Apply only color + text to non-cartesian charts (avoids grid/axis contamination)
		_applyBaseTheme: function (oOption) {
			oOption.color = COLORS;
			oOption.textStyle = { color: "#e8ecf4", fontFamily: "DM Sans, Arial, sans-serif", fontSize: 10 };
			if (oOption.tooltip) {
				oOption.tooltip.backgroundColor = "#111520";
				oOption.tooltip.borderColor = "rgba(255,255,255,0.07)";
				oOption.tooltip.textStyle = { color: "#e8ecf4", fontSize: 11 };
			}
			return oOption;
		},

		_render_line: function (aOrders) {
			if (!aOrders || !aOrders.length) { return; }

			var mCountry = {};
			aOrders.forEach(function (o) {
				var s = o.ShipCountry || "Unknown";
				if (!mCountry[s]) { mCountry[s] = []; }
				if (o.OrderDate) {
					mCountry[s].push([new Date(o.OrderDate).getTime(), parseFloat(o.Freight) || 0]);
				}
			});

			// KPIs
			var iTotalOrders = aOrders.length;
			var fAvgFreight = aOrders.reduce(function (a, o) { return a + (parseFloat(o.Freight) || 0); }, 0) / (iTotalOrders || 1);
			var iCountries = Object.keys(mCountry).length;
			this._setText("dbKpiOrders", iTotalOrders.toLocaleString());
			this._setText("dbKpiFreight", "$" + fAvgFreight.toFixed(2));
			this._setText("dbKpiCountries", iCountries);

			var aSeries = Object.keys(mCountry).slice(0, 8).map(function (s) {
				return {
					name: s, type: "line",
					data: mCountry[s].sort(function (a, b) { return a[0] - b[0]; }),
					smooth: true, symbol: "none",
					lineStyle: { width: 2 },
					areaStyle: { opacity: 0.12 }
				};
			});

			this._setChart("dbChartLine", ThemeColors.applyThemeColors({
				color: COLORS,
				tooltip: { trigger: "axis" },
				legend: { data: aSeries.map(function (s) { return s.name; }), orient: "vertical", right: 4, top: "center", type: "scroll", itemWidth: 10, textStyle: { fontSize: 10 } },
				grid: { left: 8, right: 100, bottom: 56, top: 10, containLabel: true },
				xAxis: { type: "time", boundaryGap: false },
				yAxis: { type: "value", scale: true, axisLabel: { fontSize: 10 } },
				dataZoom: [
					{ type: "inside", xAxisIndex: 0 },
					{ type: "slider", height: 20, bottom: 10, left: 8, right: 104, borderColor: "transparent", backgroundColor: "rgba(255,255,255,0.04)", fillerColor: "rgba(91,156,246,0.2)", handleStyle: { color: "#5b9cf6" }, moveHandleSize: 0, showDetail: false }
				],
				series: aSeries
			}));
		},

		_render_bar: function (aProducts) {
			if (!aProducts || !aProducts.length) { return; }
			// 8 items fits well in 220px height
			var aSlice = aProducts.slice(0, 8);
			this._setChart("dbChartBar", ThemeColors.applyThemeColors({
				color: COLORS,
				tooltip: { trigger: "axis" },
				grid: { left: 4, right: 52, bottom: 4, top: 4, containLabel: true },
				xAxis: { type: "value", axisLabel: { fontSize: 9 }, splitLine: { lineStyle: { type: "dashed" } } },
				yAxis: { type: "category", data: aSlice.map(function (p) { return (p.ProductName || "").slice(0, 16); }), axisLabel: { fontSize: 9 } },
				dataZoom: [],
				series: [{
					type: "bar",
					data: aSlice.map(function (p) { return parseFloat(p.UnitPrice) || 0; }),
					barMaxWidth: 18,
					itemStyle: { borderRadius: [0, 3, 3, 0], color: COLORS[0] },
					label: { show: true, position: "right", formatter: "{value}", fontSize: 9, color: "#8993a8" }
				}]
			}));
		},

		_render_pie: function (aData) {
			if (!aData || !aData.length) { return; }
			// For narrow card: legend on bottom, donut centered
			this._setChart("dbChartPie", this._applyBaseTheme({
				tooltip: { trigger: "item", formatter: "{b}: {d}%" },
				legend: { orient: "horizontal", bottom: 4, left: "center", type: "scroll", itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 9 } },
				series: [{
					type: "pie", radius: ["38%", "65%"], center: ["50%", "44%"],
					data: aData,
					label: { show: false },
					emphasis: { label: { show: true, fontSize: 10, fontWeight: "bold" } }
				}]
			}));
		},

		_render_gauge: function (oData) {
			var fVal = oData && oData.value != null ? oData.value : 75;
			this._setChart("dbChartGauge", this._applyBaseTheme({
				tooltip: { trigger: "item" },
				series: [{
					type: "gauge",
					radius: "80%",
					center: ["50%", "54%"],
					startAngle: 200, endAngle: -20,
					min: 0, max: 100,
					pointer: { length: "52%", width: 4 },
					progress: { show: true, width: 7 },
					axisLine: { lineStyle: { width: 7 } },
					axisTick: { show: false },
					splitLine: { length: 6, lineStyle: { width: 1, color: "#4a5168" } },
					axisLabel: { distance: 10, fontSize: 8, color: "#8993a8" },
					detail: {
						valueAnimation: true, fontSize: 20, fontWeight: "bold",
						color: COLORS[2], formatter: "{value}%",
						offsetCenter: [0, "30%"]
					},
					data: [{ value: fVal, name: "Score" }],
					title: { fontSize: 10, color: "#8993a8", offsetCenter: [0, "60%"] }
				}]
			}));
		},

		_render_scatter: function (aData) {
			if (!aData || !aData.length) { return; }
			var fYMax = Math.max.apply(null, aData.map(function (d) { return d[1] || 0; })) || 1;
			this._setChart("dbChartScatter", ThemeColors.applyThemeColors({
				color: COLORS,
				tooltip: { trigger: "item", formatter: function (p) { return p.value[0] + " / " + p.value[1]; } },
				grid: { left: 4, right: 4, bottom: 4, top: 4, containLabel: true },
				xAxis: { type: "value", scale: true, axisLabel: { fontSize: 8 }, splitLine: { lineStyle: { type: "dashed" } } },
				yAxis: { type: "value", scale: true, axisLabel: { fontSize: 8 } },
				dataZoom: [],
				series: [{
					type: "scatter",
					data: aData.slice(0, 200),
					symbolSize: function (d) { return 3 + (d[1] / fYMax) * 10; },
					itemStyle: { opacity: 0.7, color: COLORS[3] }
				}]
			}));
		},

		_render_funnel: function (aData) {
			if (!aData || !aData.length) { return; }
			var aSlice = aData.slice(0, 5).sort(function (a, b) { return b.value - a.value; });
			this._setChart("dbChartFunnel", this._applyBaseTheme({
				tooltip: { trigger: "item", formatter: "{b}: {c}" },
				series: [{
					type: "funnel",
					width: "65%", left: "17%",
					top: 8, bottom: 8,
					gap: 2,
					data: aSlice,
					label: { position: "inside", fontSize: 9, color: "#fff" },
					itemStyle: { borderWidth: 0 }
				}]
			}));
		},

		_render_tree: function (aData) {
			if (!aData || !aData.length) { return; }
			this._setChart("dbChartTree", this._applyBaseTheme({
				tooltip: { trigger: "item" },
				series: [{
					type: "tree",
					data: [{ name: "Products", children: aData.slice(0, 5) }],
					top: "4%", bottom: "4%", left: "14%", right: "22%",
					symbol: "emptyCircle", symbolSize: 5,
					orient: "LR",
					lineStyle: { width: 1, color: "#2C3D4F" },
					label: { position: "left", fontSize: 8, color: "#8993a8" },
					leaves: { label: { position: "right", fontSize: 8, color: "#e8ecf4" } },
					initialTreeDepth: 1,
					expandAndCollapse: true,
					animationDuration: 400
				}]
			}));
		},

		_render_candlestick: function (aData) {
			if (!aData || !aData.length) { return; }
			// Show last 20 candles to avoid crowding in small card
			var aSlice = aData.slice(-20);
			var aDates = aSlice.map(function (d) { return new Date(d[0]).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }); });
			var aOHLC  = aSlice.map(function (d) { return [d[1], d[2], d[3], d[4]]; });
			this._setChart("dbChartCandlestick", ThemeColors.applyThemeColors({
				tooltip: { trigger: "axis" },
				grid: { left: 4, right: 4, bottom: 4, top: 4, containLabel: true },
				xAxis: { type: "category", data: aDates, axisLabel: { fontSize: 8, interval: 4 }, boundaryGap: true },
				yAxis: { type: "value", scale: true, axisLabel: { fontSize: 8 } },
				dataZoom: [],
				series: [{
					type: "candlestick", data: aOHLC,
					itemStyle: { color: COLORS[2], color0: COLORS[6], borderColor: COLORS[2], borderColor0: COLORS[6] }
				}]
			}));
		},

		// ── Helpers ──────────────────────────────────────────────────────
		_domById: function (sViewId) {
			var oViewDom = this.getView().getDomRef();
			if (!oViewDom) { return null; }
			return oViewDom.querySelector("[id$='--" + sViewId + "']") ||
				oViewDom.querySelector("[id$='" + sViewId + "']");
		},

		_setText: function (sViewId, sText) {
			var oDom = this._domById(sViewId);
			if (oDom) { oDom.textContent = sText; }
		},

		_setChart: function (sChartId, oOption) {
			var oChart = this.byId(sChartId);
			if (!oChart) { return; }
			var that = this;
			var fnSet = function () {
				oChart.setOption(oOption, { notMerge: true });
				that._hideChartLoading(sChartId);
			};
			if (oChart._chart) {
				fnSet();
			} else {
				oChart.attachChartReady(fnSet, this);
			}
		},

		_showChartLoading: function (sChartId) {
			// Show loading overlay on the card DOM — independent of ECharts init state
			var oChart = this.byId(sChartId);
			if (!oChart) { return; }
			var oDom = oChart.getDomRef();
			if (!oDom) { return; }
			// Remove any existing overlay
			var oExisting = oDom.querySelector('.dbLoadingOverlay');
			if (oExisting) { oExisting.remove(); }
			var oOverlay = document.createElement('div');
			oOverlay.className = 'dbLoadingOverlay';
			oOverlay.innerHTML =
				'<div class="dbLoadingSpinner"></div>';
			oDom.style.position = 'relative';
			oDom.appendChild(oOverlay);
		},

		_hideChartLoading: function (sChartId) {
			var oChart = this.byId(sChartId);
			if (!oChart) { return; }
			var oDom = oChart.getDomRef();
			if (!oDom) { return; }
			var oOverlay = oDom.querySelector('.dbLoadingOverlay');
			if (oOverlay) { oOverlay.remove(); }
		},

		onNavBack: function () {
			this.getRouter().navTo("chartList");
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});
});
