sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.TreeChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("tree").then(function (oData) {
				this._renderChart(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load tree data", oError);
			});
		},

		_renderChart: function (aData) {
			if (!aData || aData.length === 0) {
				Log.warning("No data available for tree chart");
				return;
			}

			let oChartOption = {
				title: {
					text: "Categories and Products Hierarchy",
					left: "center"
				},
				tooltip: {
					trigger: "item",
					triggerOn: "mousemove"
				},
				xAxis: {
					show: false
				},
				yAxis: {
					show: false
				},
				dataZoom: [],
				series: [{
					type: "tree",
					data: aData,
					top: "5%",
					left: "7%",
					bottom: "5%",
					right: "20%",
					symbolSize: 7,
					label: {
						position: "left",
						verticalAlign: "middle",
						align: "right"
					},
					leaves: {
						label: {
							position: "right",
							verticalAlign: "middle",
							align: "left"
						}
					},
					emphasis: {
						focus: "descendant"
					},
					expandAndCollapse: true,
					animationDuration: 550,
					animationDurationUpdate: 750
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
