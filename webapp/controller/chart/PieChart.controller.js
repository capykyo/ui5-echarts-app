sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.PieChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("pie").then(function (oData) {
				this._renderChart(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load pie chart data", oError);
			});
		},

		_renderChart: function (aData) {
			if (!aData || aData.length === 0) {
				Log.warning("No data available for pie chart");
				return;
			}

			// Prepare chart option
			let oChartOption = {
				title: {
					text: "Products Distribution by Category",
					left: "center"
				},
				tooltip: {
					trigger: "item",
					formatter: "{a} <br/>{b}: {c} ({d}%)"
				},
				legend: {
					orient: "vertical",
					right: "5%",
					top: "center",
					data: aData.map(function (o) {
						return o.name;
					})
				},
				dataZoom: [],
				series: [{
					name: "Products",
					type: "pie",
					radius: ["40%", "70%"],
					avoidLabelOverlap: false,
					itemStyle: {
						borderRadius: 10,
						borderColor: "#fff",
						borderWidth: 2
					},
					label: {
						show: true,
						formatter: "{b}: {c}"
					},
					emphasis: {
						label: {
							show: true,
							fontSize: "16",
							fontWeight: "bold"
						}
					},
					labelLine: {
						show: true
					},
					data: aData
				}]
			};

			// Apply theme colors
			oChartOption = ThemeColors.applyThemeColors(oChartOption);

			// Update chart
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
