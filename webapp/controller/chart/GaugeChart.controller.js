sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.GaugeChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("gauge").then(function (oData) {
				this._renderChart(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load gauge data", oError);
			});
		},

		_renderChart: function (oData) {
			if (!oData) {
				Log.warning("No data available for gauge chart");
				return;
			}

			let oChartOption = {
				title: {
					text: "Order Completion Rate",
					left: "center"
				},
				tooltip: {
					formatter: "{a} <br/>{b} : {c}%"
				},
				dataZoom: [],
				series: [{
					name: "Completion Rate",
					type: "gauge",
					progress: {
						show: true
					},
					detail: {
						valueAnimation: true,
						formatter: "{value}%"
					},
					data: [{
						value: oData.value,
						name: "Completion"
					}]
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
