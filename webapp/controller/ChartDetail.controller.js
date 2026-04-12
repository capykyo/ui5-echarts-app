sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView",
	"sap/m/MessageToast",
	"ui5/echarts/app/model/ChartData"
], function (Controller, JSONModel, XMLView, MessageToast, ChartData) {
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
				description: mChartInfo.description,
				dataSource: ChartData.isUsingMockData() ? "MOCK DATA (localhost:3000)" : "NORTHWIND OData V4",
				useMockData: ChartData.isUsingMockData()
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
							oContainer.insertItem(oChartView, iPlaceholderIndex);
							oContainer.removeItem(oPlaceholder);
							oPlaceholder.destroy();
						} else {
							oContainer.addItem(oChartView);
						}
					} else {
						oContainer.addItem(oChartView);
					}
					this._oLoadedChartView = oChartView;
				}
			}.bind(this)).catch(function (oError) {
				sap.ui.require(["sap/base/Log"], function (Log) {
					Log.error("Failed to load chart view: " + sViewName, oError);
				});
				this._loadChartData(sChartType);
			}.bind(this));
		},

		onMockDataToggle: function (oEvent) {
			const bPressed = oEvent.getSource().getPressed();
			ChartData.setUseMockData(bPressed);
			localStorage.setItem("ui5.echarts.useMockData", String(bPressed));

			// Update model
			const oModel = this.getView().getModel();
			oModel.setProperty("/useMockData", bPressed);
			oModel.setProperty("/dataSource", bPressed ? "MOCK DATA (localhost:3000)" : "NORTHWIND OData V4");

			// Reload the current chart with new data source
			MessageToast.show("Data source: " + (bPressed ? "Mock Data (localhost:3000)" : "Northwind OData"));
			this._loadChart(this._sChartType);
		},

		_loadChartData: function (sChartType) {
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

			const oOption = this._getChartOption(sChartType, oData);

			if (oChart._chart) {
				oChart.setOption(oOption);
			} else {
				oChart.attachChartReady(function () {
					oChart.setOption(oOption);
				}, this);
			}
		},

		_getChartOption: function (sChartType, oData) {
			return {
				title: {
					text: this._getChartInfo(sChartType).title
				},
				series: []
			};
		},

		_getChartInfo: function (sChartType) {
			const mChartInfo = {
				line:        { title: "Line Chart",        description: "Time series data visualization with multiple series support" },
				bar:         { title: "Bar Chart",         description: "Categorical data comparison visualization" },
				pie:         { title: "Pie Chart",         description: "Proportional data representation" },
				scatter:     { title: "Scatter Chart",     description: "Two-dimensional relationship visualization" },
				radar:       { title: "Radar Chart",       description: "Multi-dimensional comparison" },
				heatmap:     { title: "Heatmap",           description: "Time-category heat distribution" },
				gauge:       { title: "Gauge",             description: "Key metrics dashboard" },
				candlestick: { title: "Candlestick Chart", description: "Price fluctuation visualization" },
				funnel:      { title: "Funnel Chart",      description: "Conversion process visualization" },
				tree:        { title: "Tree Chart",        description: "Hierarchical relationship display" }
			};
			return mChartInfo[sChartType] || { title: "Chart", description: "" };
		},

		_capitalizeFirst: function (sString) {
			return sString.charAt(0).toUpperCase() + sString.slice(1);
		},

		onNavBack: function () {
			var oHistory = sap.ui.require("sap/ui/core/routing/History");
			if (oHistory) {
				var oPreviousHash = oHistory.getInstance().getPreviousHash();
				if (oPreviousHash !== undefined) {
					window.history.go(-1);
					return;
				}
			}
			this.getRouter().navTo("chartList");
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onExit: function () {
			if (this._oLoadedChartView) {
				this._oLoadedChartView.destroy();
				this._oLoadedChartView = null;
			}
		}
	});
});
