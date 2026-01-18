sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.LineChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("line").then(function (oData) {
				this._renderChart(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load line chart data", oError);
			});
		},

		_renderChart: function (aOrders) {
			if (!aOrders || aOrders.length === 0) {
				Log.warning("No data available for line chart");
				return;
			}

			// Transform data for line chart
			const mCountryData = {};
			aOrders.forEach(function (oOrder) {
				const sCountry = oOrder.ShipCountry || "Unknown";
				if (!mCountryData[sCountry]) {
					mCountryData[sCountry] = [];
				}
				if (oOrder.OrderDate) {
					const oDate = new Date(oOrder.OrderDate);
					mCountryData[sCountry].push([
						oDate.getTime(),
						parseFloat(oOrder.Freight) || 0
					]);
				}
			});

			// Create series for top countries
			const aSeries = Object.keys(mCountryData)
				.map(function (sCountry) {
					return {
						name: sCountry,
						type: "line",
						data: mCountryData[sCountry].sort(function (a, b) {
							return a[0] - b[0];
						}),
						smooth: true,
						symbol: "none",
						large: true,
						largeThreshold: 2000
					};
				})
				.filter(function (oSeries) {
					return oSeries.data.length > 0;
				})
				.slice(0, 10);

			// Prepare chart option
			let oChartOption = {
				title: {
					text: "Orders Freight Over Time by Country",
					left: "center"
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "cross"
					},
					formatter: function (params) {
						if (!params || !Array.isArray(params) || params.length === 0) {
							return "";
						}
						const sAxisValue = params[0].axisValueLabel || params[0].axisValue || "";
						let sResult = sAxisValue + "<br/>";
						params.forEach(function (param) {
							if (param && param.seriesName && param.value && Array.isArray(param.value) && param.value.length >= 2) {
								sResult += param.seriesName + ": $" + param.value[1].toFixed(2) + "<br/>";
							}
						});
						return sResult;
					}
				},
				legend: {
					data: aSeries.map(function (s) {
						return s.name;
					}),
					orient: "vertical",
					right: "5%",
					top: "center",
					type: "scroll"
				},
				grid: {
					left: "3%",
					right: "20%",
					bottom: "15%",
					top: "10%",
					containLabel: true
				},
				xAxis: {
					type: "time",
					boundaryGap: false
				},
				yAxis: {
					type: "value",
					name: "Freight ($)",
					axisLabel: {
						formatter: "${value}"
					}
				},
				dataZoom: [
					{
						type: "inside",
						start: 0,
						end: 100,
						xAxisIndex: 0
					},
					{
						type: "slider",
						start: 0,
						end: 100,
						height: 30,
						bottom: "5%"
					}
				],
				series: aSeries.length > 0 ? aSeries : []
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
