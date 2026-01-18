sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView"
], function (Controller, JSONModel, XMLView) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.ChartDetail", {
		onInit: function () {
			// Get router and attach route matched event
			this.getRouter().getRoute("chartDetail").attachPatternMatched(this._onChartMatched, this);
			// Store reference to currently loaded chart view
			this._oLoadedChartView = null;
		},

		_onChartMatched: function (oEvent) {
			const sChartType = oEvent.getParameter("arguments").chartType;
			this._sChartType = sChartType;
			this._loadChart(sChartType);
		},

		_loadChart: function (sChartType) {
			// Set page title and description
			const mChartInfo = this._getChartInfo(sChartType);
			const oModel = new JSONModel({
				title: mChartInfo.title,
				description: mChartInfo.description
			});
			this.getView().setModel(oModel);

			// Get the container VBox
			const oContainer = this.byId("chartContainer");
			if (!oContainer) {
				return;
			}

			// Remove previously loaded chart view if exists
			if (this._oLoadedChartView) {
				const iIndex = oContainer.indexOfItem(this._oLoadedChartView);
				if (iIndex >= 0) {
					oContainer.removeItem(this._oLoadedChartView);
				}
				this._oLoadedChartView.destroy();
				this._oLoadedChartView = null;
			}

			// Load chart-specific view dynamically
			const sViewName = "ui5.echarts.app.view.chart." + this._capitalizeFirst(sChartType) + "Chart";
			const sControllerName = "ui5.echarts.app.controller.chart." + this._capitalizeFirst(sChartType);
			
			XMLView.create({
				viewName: sViewName,
				controllerName: sControllerName
			}).then(function (oChartView) {
				if (oContainer && oChartView) {
					// Remove placeholder chart if it still exists
					const oPlaceholder = this.byId("chart");
					if (oPlaceholder) {
						const iPlaceholderIndex = oContainer.indexOfItem(oPlaceholder);
						if (iPlaceholderIndex >= 0) {
							// Insert new chart view at placeholder position
							oContainer.insertItem(oChartView, iPlaceholderIndex);
							oContainer.removeItem(oPlaceholder);
							oPlaceholder.destroy();
						} else {
							// Placeholder already removed, just add the new view
							oContainer.addItem(oChartView);
						}
					} else {
						// No placeholder, just add the new view
						oContainer.addItem(oChartView);
					}
					// Store reference to loaded chart view
					this._oLoadedChartView = oChartView;
				}
			}.bind(this)).catch(function (oError) {
				sap.ui.require(["sap/base/Log"], function (Log) {
					Log.error("Failed to load chart view: " + sViewName, oError);
				});
				// Fallback: load data directly in this controller
				this._loadChartData(sChartType);
			}.bind(this));
		},

		_loadChartData: function (sChartType) {
			// This will be called if dynamic view loading fails
			// Load data based on chart type
			sap.ui.require([
				"ui5/echarts/app/model/ChartData"
			], function (ChartData) {
				ChartData.loadDataForChart(sChartType).then(function (oData) {
					this._renderChart(sChartType, oData);
				}.bind(this));
			}.bind(this));
		},

		_renderChart: function (sChartType, oData) {
			const oChart = this.byId("chart");
			if (!oChart) {
				return;
			}

			// Get chart option based on type
			const oOption = this._getChartOption(sChartType, oData);
			
			// Wait for chart to be ready
			if (oChart._chart) {
				oChart.setOption(oOption);
			} else {
				oChart.attachChartReady(function () {
					oChart.setOption(oOption);
				}, this);
			}
		},

		_getChartOption: function (sChartType, oData) {
			// This will be implemented in chart-specific controllers
			// For now, return basic structure
			return {
				title: {
					text: this._getChartInfo(sChartType).title
				},
				series: []
			};
		},

		_getChartInfo: function (sChartType) {
			const mChartInfo = {
				line: {
					title: "Line Chart",
					description: "Time series data visualization with multiple series support"
				},
				bar: {
					title: "Bar Chart",
					description: "Categorical data comparison visualization"
				},
				pie: {
					title: "Pie Chart",
					description: "Proportional data representation"
				},
				scatter: {
					title: "Scatter Chart",
					description: "Two-dimensional relationship visualization"
				},
				radar: {
					title: "Radar Chart",
					description: "Multi-dimensional comparison"
				},
				heatmap: {
					title: "Heatmap",
					description: "Time-category heat distribution"
				},
				gauge: {
					title: "Gauge",
					description: "Key metrics dashboard"
				},
				candlestick: {
					title: "Candlestick Chart",
					description: "Price fluctuation visualization"
				},
				funnel: {
					title: "Funnel Chart",
					description: "Conversion process visualization"
				},
				tree: {
					title: "Tree Chart",
					description: "Hierarchical relationship display"
				}
			};
			return mChartInfo[sChartType] || { title: "Chart", description: "" };
		},

		_capitalizeFirst: function (sString) {
			return sString.charAt(0).toUpperCase() + sString.slice(1);
		},

		onNavBack: function () {
			this.getRouter().navTo("chartList");
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onExit: function () {
			// Clean up loaded chart view
			if (this._oLoadedChartView) {
				this._oLoadedChartView.destroy();
				this._oLoadedChartView = null;
			}
		}
	});
});
