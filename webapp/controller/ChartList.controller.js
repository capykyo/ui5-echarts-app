sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.ChartList", {
		onInit: function () {
			// Define chart types
			const aCharts = [
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

			// Set model
			const oModel = new JSONModel({
				charts: aCharts
			});
			this.getView().setModel(oModel);
		},

		onChartPress: function (oEvent) {
			const oItem = oEvent.getSource();
			const oContext = oItem.getBindingContext();
			const oChart = oContext.getObject();
			this.navigateToChart(oChart.type);
		},

		onChartSelect: function (oEvent) {
			const oItem = oEvent.getParameter("listItem");
			const oContext = oItem.getBindingContext();
			const oChart = oContext.getObject();
			this.navigateToChart(oChart.type);
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
