sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"sap/m/MessageToast",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, MessageToast, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.ScatterChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("scatter").then(function (oData) {
				this._renderChart(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load scatter chart data", oError);
				MessageToast.show(oError.message || "Failed to load data");
			});
		},

		_renderChart: function (aData) {
			if (!aData || aData.length === 0) {
				Log.warning("No data available for scatter chart");
				return;
			}

			// Compute Y-axis range for normalised symbolSize (cap at 30px)
			const aYValues = aData.map(function (d) { return d[1]; });
			const fYMax = Math.max.apply(null, aYValues) || 1;

			// Detect axis labels from data source
			const bMock = aData[0] && aData[0][0] > 3; // Northwind ShipVia is 1-3; mock Quantity > 3
			const sXName = bMock ? "Quantity" : "Ship Via";
			const sYName = bMock ? "Amount" : "Freight ($)";
			const sTitle = bMock ? "Quantity vs Amount by Order" : "Freight vs Ship Via Relationship";

			let oChartOption = {
				title: {
					text: sTitle,
					left: "center"
				},
				tooltip: {
					trigger: "item",
					formatter: function (params) {
						return sXName + ": " + params.value[0] +
							"<br/>" + sYName + ": " + params.value[1].toLocaleString();
					}
				},
				xAxis: {
					type: "value",
					name: sXName,
					scale: true
				},
				yAxis: {
					type: "value",
					name: sYName,
					scale: true
				},
				series: [{
					name: "Orders",
					type: "scatter",
					data: aData,
					symbolSize: function (data) {
						// Normalise to 4–20px based on Y value relative to max
						return 4 + (data[1] / fYMax) * 16;
					}
				}]
			};

			oChartOption = ThemeColors.applyThemeColors(oChartOption);

			const oChart = this.byId("chartControl");
			if (oChart) {
				if (oChart._chart) {
					oChart.setOption(oChartOption);
				} else {
					oChart.attachChartReady(function () {
						oChart.setOption(oChartOption);
					}, this);
				}
			}
		}
	});
});
