sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.CandlestickChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("candlestick").then(function (oData) {
				this._renderChart(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load candlestick data", oError);
			});
		},

		_renderChart: function (aData) {
			if (!aData || aData.length === 0) {
				Log.warning("No data available for candlestick chart");
				return;
			}

			let oChartOption = {
				title: {
					text: "Price Fluctuation (Candlestick)",
					left: "center"
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "cross"
					}
				},
				grid: {
					left: "10%",
					right: "10%",
					bottom: "15%"
				},
				xAxis: {
					type: "category",
					data: aData.map(function (d) {
						return new Date(d[0]).toLocaleDateString();
					}),
					boundaryGap: false,
					axisLine: {
						onZero: false
					},
					splitLine: {
						show: false
					},
					min: "dataMin",
					max: "dataMax"
				},
				yAxis: {
					scale: true,
					splitArea: {
						show: true
					}
				},
				dataZoom: [
					{
						type: "inside",
						xAxisIndex: [0, 1],
						start: 0,
						end: 100
					},
					{
						show: true,
						xAxisIndex: [0, 1],
						type: "slider",
						top: "90%",
						start: 0,
						end: 100
					}
				],
				series: [{
					name: "Price",
					type: "candlestick",
					data: aData,
					itemStyle: {
						color: "#26a69a",
						color0: "#ef5350",
						borderColor: "#26a69a",
						borderColor0: "#ef5350"
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
