sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"ui5/echarts/app/model/ChartData"
], function (Controller, JSONModel, MessageToast, ChartData) {
	"use strict";

	// Icon → Unicode map for SAP icons used as SVG-like decorators
	var mChartMeta = [
		{ type: "line",        icon: "sap-icon://line-charts",               symbol: "╱",  color: "#5b9cf6" },
		{ type: "bar",         icon: "sap-icon://bar-chart",                 symbol: "▐",  color: "#f6be4f" },
		{ type: "pie",         icon: "sap-icon://pie-chart",                 symbol: "◕",  color: "#3dd9c6" },
		{ type: "scatter",     icon: "sap-icon://scatter-chart",             symbol: "⠿",  color: "#a78bfa" },
		{ type: "radar",       icon: "sap-icon://radar-chart",               symbol: "⬡",  color: "#34d399" },
		{ type: "heatmap",     icon: "sap-icon://heatmap-chart",             symbol: "▦",  color: "#fb923c" },
		{ type: "gauge",       icon: "sap-icon://measuring-point",           symbol: "◉",  color: "#f43f5e" },
		{ type: "candlestick", icon: "sap-icon://business-objects-experience", symbol: "⋮", color: "#e2d16b" },
		{ type: "funnel",      icon: "sap-icon://funnel-chart",              symbol: "▽",  color: "#60a5fa" },
		{ type: "tree",        icon: "sap-icon://tree",                      symbol: "⬦",  color: "#4ade80" }
	];

	return Controller.extend("ui5.echarts.app.controller.ChartList", {
		onInit: function () {
			// ChartData state is already restored by Component.js on startup
			var bUseMock = ChartData.isUsingMockData();

			var aCharts = [
				{
					name: "Line Chart",
					description: "Time series data visualization with multiple series",
					icon: "sap-icon://line-charts",
					type: "line"
				},
				{
					name: "Bar Chart",
					description: "Categorical data comparison",
					icon: "sap-icon://bar-chart",
					type: "bar"
				},
				{
					name: "Pie Chart",
					description: "Proportional data representation",
					icon: "sap-icon://pie-chart",
					type: "pie"
				},
				{
					name: "Scatter Chart",
					description: "Two-dimensional relationship visualization",
					icon: "sap-icon://scatter-chart",
					type: "scatter"
				},
				{
					name: "Radar Chart",
					description: "Multi-dimensional comparison",
					icon: "sap-icon://radar-chart",
					type: "radar"
				},
				{
					name: "Heatmap",
					description: "Time-category heat distribution",
					icon: "sap-icon://heatmap-chart",
					type: "heatmap"
				},
				{
					name: "Gauge",
					description: "Key metrics dashboard",
					icon: "sap-icon://measuring-point",
					type: "gauge"
				},
				{
					name: "Candlestick",
					description: "Price fluctuation visualization",
					icon: "sap-icon://business-objects-experience",
					type: "candlestick"
				},
				{
					name: "Funnel Chart",
					description: "Conversion process visualization",
					icon: "sap-icon://funnel-chart",
					type: "funnel"
				},
				{
					name: "Tree Chart",
					description: "Hierarchical relationship display",
					icon: "sap-icon://tree",
					type: "tree"
				}
			];

			var oModel = new JSONModel({ charts: aCharts, useMockData: bUseMock });
			this.getView().setModel(oModel);

			// Sync Toggle state whenever returning to this page
			this.getRouter().getRoute("chartList").attachPatternMatched(function () {
				this.getView().getModel().setProperty("/useMockData", ChartData.isUsingMockData());
			}, this);

			// Render custom card grid after view is displayed
			this.getView().addEventDelegate({
				onAfterRendering: this._renderCardGrid.bind(this)
			});
		},

		_renderCardGrid: function () {
			var oGridControl = this.getView().byId("obsChartGrid");
			var oGrid = oGridControl ? oGridControl.getDomRef() : null;
			if (!oGrid || oGrid.dataset.rendered) { return; }
			oGrid.dataset.rendered = "true";

			var aCharts = this.getView().getModel().getProperty("/charts");
			var that = this;

			aCharts.forEach(function (oChart, i) {
				var oMeta = mChartMeta[i] || { symbol: "◈", color: "#f6be4f" };
				var sIndex = String(i + 1).padStart(2, "0");

				var oCard = document.createElement("div");
				oCard.className = "obsChartCard";
				oCard.setAttribute("data-type", oChart.type);
				oCard.setAttribute("role", "button");
				oCard.setAttribute("tabindex", "0");
				oCard.setAttribute("aria-label", oChart.name);

				oCard.innerHTML =
					'<span class="obsCardIndex">' + sIndex + '</span>' +
					'<div class="obsCardIcon" style="border-color:' + oMeta.color + '40;background:' + oMeta.color + '15">' +
					'  <span style="font-size:18px;color:' + oMeta.color + ';line-height:1">' + oMeta.symbol + '</span>' +
					'</div>' +
					'<div class="obsCardTitle">' + oChart.name + '</div>' +
					'<div class="obsCardDesc">' + oChart.description + '</div>' +
					'<div class="obsCardArrow" style="border-color:' + oMeta.color + '30">›</div>';

				// Click handler
				oCard.addEventListener("click", function () {
					that.navigateToChart(oChart.type);
				});

				// Keyboard handler
				oCard.addEventListener("keydown", function (oEvent) {
					if (oEvent.key === "Enter" || oEvent.key === " ") {
						oEvent.preventDefault();
						that.navigateToChart(oChart.type);
					}
				});

				oGrid.appendChild(oCard);
			});
		},

		onMockDataToggle: function (oEvent) {
			var bPressed = oEvent.getSource().getPressed();
			ChartData.setUseMockData(bPressed);
			localStorage.setItem("ui5.echarts.useMockData", String(bPressed));
			this.getView().getModel().setProperty("/useMockData", bPressed);
			var sSource = bPressed ? "Mock Data (localhost:3000)" : "Northwind OData";
			MessageToast.show("Data source: " + sSource);
		},

		navigateToChart: function (sChartType) {
			this.getRouter().navTo("chartDetail", {
				chartType: sChartType
			});
		},

		onOptimizationPress: function () {
			this.getRouter().navTo("optimization", {
				scenario: "sampling"
			});
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});
});
