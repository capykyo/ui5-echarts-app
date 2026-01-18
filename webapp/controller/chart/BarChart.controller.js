sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.BarChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("bar").then(function (oData) {
				this._renderChart(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load bar chart data", oError);
			});
		},

		_renderChart: function (aProducts) {
			if (!aProducts || aProducts.length === 0) {
				Log.warning("No data available for bar chart");
				return;
			}

			// Transform data for bar chart
			const aData = aProducts.map(function (oProduct) {
				return {
					name: oProduct.ProductName || "Unknown",
					value: parseFloat(oProduct.UnitPrice) || 0
				};
			}).sort(function (a, b) {
				return b.value - a.value;
			});

			// Prepare chart option
			let oChartOption = {
				title: {
					text: "Top Products by Unit Price",
					left: "center"
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "shadow"
					},
					formatter: function (params) {
						if (!params || !Array.isArray(params) || params.length === 0) {
							return "";
						}
						const oParam = params[0];
						return oParam.name + "<br/>" + oParam.seriesName + ": $" + oParam.value.toFixed(2);
					}
				},
				grid: {
					left: "3%",
					right: "4%",
					bottom: "3%",
					containLabel: true
				},
				xAxis: {
					type: "category",
					data: aData.map(function (o) {
						return o.name;
					}),
					axisLabel: {
						rotate: 45,
						interval: 0
					}
				},
				yAxis: {
					type: "value",
					name: "Unit Price ($)",
					axisLabel: {
						formatter: "${value}"
					}
				},
				series: [{
					name: "Unit Price",
					type: "bar",
					data: aData.map(function (o) {
						return o.value;
					}),
					label: {
						show: true,
						position: "top",
						formatter: "${c}"
					}
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
