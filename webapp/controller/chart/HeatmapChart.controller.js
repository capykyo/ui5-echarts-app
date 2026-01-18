sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.HeatmapChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("heatmap").then(function (oData) {
				this._renderChart(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load heatmap data", oError);
			});
		},

		_renderChart: function (aOrders) {
			if (!aOrders || aOrders.length === 0) {
				Log.warning("No data available for heatmap");
				return;
			}

			// Group by country and month
			const mHeatmapData = {};
			const aCountries = [];
			const aMonths = [];

			aOrders.forEach(function (oOrder) {
				if (oOrder.OrderDate && oOrder.ShipCountry) {
					const oDate = new Date(oOrder.OrderDate);
					const sMonth = oDate.getFullYear() + "-" + (oDate.getMonth() + 1);
					const sCountry = oOrder.ShipCountry;

					if (aCountries.indexOf(sCountry) === -1) {
						aCountries.push(sCountry);
					}
					if (aMonths.indexOf(sMonth) === -1) {
						aMonths.push(sMonth);
					}

					const sKey = sCountry + "_" + sMonth;
					mHeatmapData[sKey] = (mHeatmapData[sKey] || 0) + 1;
				}
			});

			// Convert to heatmap format
			const aData = [];
			aCountries.forEach(function (sCountry, iCountry) {
				aMonths.forEach(function (sMonth, iMonth) {
					const sKey = sCountry + "_" + sMonth;
					aData.push([iMonth, iCountry, mHeatmapData[sKey] || 0]);
				});
			});

			let oChartOption = {
				title: {
					text: "Orders Heatmap by Country and Month",
					left: "center"
				},
				tooltip: {
					position: "top",
					formatter: function (params) {
						return aCountries[params.value[1]] + "<br/>" +
							aMonths[params.value[0]] + "<br/>" +
							"Orders: " + params.value[2];
					}
				},
				grid: {
					height: "50%",
					top: "10%"
				},
				xAxis: {
					type: "category",
					data: aMonths,
					splitArea: {
						show: true
					}
				},
				yAxis: {
					type: "category",
					data: aCountries,
					splitArea: {
						show: true
					}
				},
				visualMap: {
					min: 0,
					max: Math.max.apply(null, aData.map(function (d) {
						return d[2];
					})),
					calculable: true,
					orient: "horizontal",
					left: "center",
					bottom: "15%"
				},
				series: [{
					name: "Orders",
					type: "heatmap",
					data: aData,
					label: {
						show: true
					},
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowColor: "rgba(0, 0, 0, 0.5)"
						}
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
