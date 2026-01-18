sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.FunnelChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("funnel").then(function (oData) {
				this._renderChart(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load funnel data", oError);
			});
		},

		_renderChart: function (aData) {
			if (!aData || aData.length === 0) {
				Log.warning("No data available for funnel chart");
				return;
			}

			// Sort by value descending
			aData.sort(function (a, b) {
				return b.value - a.value;
			});

			let oChartOption = {
				title: {
					text: "Orders Distribution by Shipper",
					left: "center"
				},
				tooltip: {
					trigger: "item",
					formatter: "{a} <br/>{b} : {c} ({d}%)"
				},
				legend: {
					bottom: 0,
					data: aData.map(function (d) {
						return d.name;
					})
				},
				dataZoom: [],
				series: [{
					name: "Orders",
					type: "funnel",
					left: "10%",
					top: 60,
					bottom: 60,
					width: "80%",
					min: 0,
					max: Math.max.apply(null, aData.map(function (d) {
						return d.value;
					})),
					minSize: "0%",
					maxSize: "100%",
					sort: "descending",
					gap: 0,
					funnelAlign: "center",
					label: {
						show: true,
						position: "inside",
						formatter: "{b}: {c}"
					},
					labelLine: {
						show: false
					},
					itemStyle: {
						borderColor: "#fff",
						borderWidth: 0
					},
					emphasis: {
						label: {
							fontSize: 16,
							fontWeight: "bold"
						},
						itemStyle: {
							borderColor: "#fff",
							borderWidth: 2
						}
					},
					data: aData
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
