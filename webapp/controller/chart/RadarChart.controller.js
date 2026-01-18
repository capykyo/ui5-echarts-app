sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/model/ChartData",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ChartData, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.chart.RadarChart", {
		onInit: function () {
			this._loadData();
		},

		_loadData: function () {
			ChartData.loadDataForChart("radar").then(function (oData) {
				// For radar chart, we need to load additional data
				this._loadRadarData(oData.data);
			}.bind(this)).catch(function (oError) {
				Log.error("Failed to load radar chart data", oError);
			});
		},

		_loadRadarData: function (aSuppliers) {
			// Load products for each supplier to create radar data
			const aPromises = aSuppliers.slice(0, 3).map(function (oSupplier) {
				const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Products" +
					"?$filter=SupplierID eq " + oSupplier.SupplierID +
					"&$select=ProductID,UnitPrice,UnitsInStock,UnitsOnOrder";
				return fetch(sUrl).then(function (response) {
					return response.json();
				}).then(function (oData) {
					const aProducts = oData.value || [];
					return {
						name: oSupplier.CompanyName,
						products: aProducts.length,
						avgPrice: aProducts.length > 0 ? aProducts.reduce(function (sum, p) {
							return sum + (parseFloat(p.UnitPrice) || 0);
						}, 0) / aProducts.length : 0,
						totalStock: aProducts.reduce(function (sum, p) {
							return sum + (parseInt(p.UnitsInStock) || 0);
						}, 0),
						totalOnOrder: aProducts.reduce(function (sum, p) {
							return sum + (parseInt(p.UnitsOnOrder) || 0);
						}, 0)
					};
				});
			});

			Promise.all(aPromises).then(function (aSupplierData) {
				this._renderChart(aSupplierData);
			}.bind(this));
		},

		_renderChart: function (aSupplierData) {
			if (!aSupplierData || aSupplierData.length === 0) {
				Log.warning("No data available for radar chart");
				return;
			}

			// Normalize data for radar chart
			const aMaxValues = {
				products: Math.max.apply(null, aSupplierData.map(function (d) {
					return d.products;
				})),
				avgPrice: Math.max.apply(null, aSupplierData.map(function (d) {
					return d.avgPrice;
				})),
				totalStock: Math.max.apply(null, aSupplierData.map(function (d) {
					return d.totalStock;
				})),
				totalOnOrder: Math.max.apply(null, aSupplierData.map(function (d) {
					return d.totalOnOrder;
				}))
			};

			const aIndicators = [
				{ name: "Products", max: aMaxValues.products },
				{ name: "Avg Price", max: aMaxValues.avgPrice },
				{ name: "Total Stock", max: aMaxValues.totalStock },
				{ name: "On Order", max: aMaxValues.totalOnOrder }
			];

			const aSeries = aSupplierData.map(function (oSupplier) {
				return {
					value: [
						oSupplier.products,
						oSupplier.avgPrice,
						oSupplier.totalStock,
						oSupplier.totalOnOrder
					],
					name: oSupplier.name
				};
			});

			let oChartOption = {
				title: {
					text: "Supplier Comparison",
					left: "center"
				},
				legend: {
					data: aSupplierData.map(function (d) {
						return d.name;
					}),
					bottom: 0
				},
				dataZoom: [],
				radar: {
					indicator: aIndicators
				},
				series: [{
					name: "Suppliers",
					type: "radar",
					data: aSeries
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
