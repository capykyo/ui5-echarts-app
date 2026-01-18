sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
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
			});
		},

		_renderChart: function (aData) {
			if (!aData || aData.length === 0) {
				Log.warning("No data available for scatter chart");
				return;
			}

			let oChartOption = {
				title: {
					text: "Freight vs Ship Via Relationship",
					left: "center"
				},
				tooltip: {
					trigger: "item",
					formatter: function (params) {
						return "Ship Via: " + params.value[0] + "<br/>Freight: $" + params.value[1].toFixed(2);
					}
				},
				xAxis: {
					type: "value",
					name: "Ship Via",
					scale: true
				},
				yAxis: {
					type: "value",
					name: "Freight ($)",
					scale: true
				},
				series: [{
					name: "Orders",
					type: "scatter",
					data: aData,
					symbolSize: function (data) {
						return Math.sqrt(data[1]) * 2;
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
