/**
 * Chart Data Model
 * Provides unified data loading and transformation for different chart types
 */
sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var ChartDataClass = BaseObject.extend("ui5.echarts.app.model.ChartData", {
		/**
		 * Load data for specific chart type
		 * @param {string} sChartType - Chart type (line, bar, pie, etc.)
		 * @returns {Promise} Promise that resolves with chart data
		 */
		loadDataForChart: function (sChartType) {
			switch (sChartType) {
				case "line":
					return this._loadLineChartData();
				case "bar":
					return this._loadBarChartData();
				case "pie":
					return this._loadPieChartData();
				case "scatter":
					return this._loadScatterChartData();
				case "radar":
					return this._loadRadarChartData();
				case "heatmap":
					return this._loadHeatmapData();
				case "gauge":
					return this._loadGaugeData();
				case "candlestick":
					return this._loadCandlestickData();
				case "funnel":
					return this._loadFunnelData();
				case "tree":
					return this._loadTreeData();
				default:
					return Promise.reject(new Error("Unknown chart type: " + sChartType));
			}
		},

		/**
		 * Load Orders data for line chart
		 */
		_loadLineChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders" +
				"?$top=1000" +
				"&$orderby=OrderDate desc" +
				"&$select=OrderID,OrderDate,Freight,ShipCity,ShipCountry";

			return fetch(sUrl)
				.then(response => response.json())
				.then(oData => {
					return {
						type: "line",
						data: oData.value || []
					};
				});
		},

		/**
		 * Load Products data for bar chart
		 */
		_loadBarChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Products" +
				"?$top=20" +
				"&$orderby=UnitPrice desc" +
				"&$select=ProductID,ProductName,UnitPrice,UnitsInStock";

			return fetch(sUrl)
				.then(response => response.json())
				.then(oData => {
					return {
						type: "bar",
						data: oData.value || []
					};
				});
		},

		/**
		 * Load Categories data for pie chart
		 */
		_loadPieChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Categories" +
				"?$select=CategoryID,CategoryName" +
				"&$expand=Products($select=ProductID)";

			return fetch(sUrl)
				.then(response => response.json())
				.then(oData => {
					return {
						type: "pie",
						data: (oData.value || []).map(function (oCategory) {
							return {
								name: oCategory.CategoryName,
								value: (oCategory.Products || []).length
							};
						})
					};
				});
		},

		/**
		 * Load Orders data for scatter chart
		 */
		_loadScatterChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders" +
				"?$top=500" +
				"&$select=OrderID,Freight,ShipVia";

			return fetch(sUrl)
				.then(response => response.json())
				.then(oData => {
					return {
						type: "scatter",
						data: (oData.value || []).map(function (oOrder) {
							return [oOrder.ShipVia || 0, parseFloat(oOrder.Freight) || 0];
						})
					};
				});
		},

		/**
		 * Load Suppliers data for radar chart
		 */
		_loadRadarChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Suppliers" +
				"?$top=5" +
				"&$select=SupplierID,CompanyName";

			return fetch(sUrl)
				.then(response => response.json())
				.then(oData => {
					return {
						type: "radar",
						data: oData.value || []
					};
				});
		},

		/**
		 * Load Orders data for heatmap
		 */
		_loadHeatmapData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders" +
				"?$top=1000" +
				"&$select=OrderID,OrderDate,ShipCountry";

			return fetch(sUrl)
				.then(response => response.json())
				.then(oData => {
					return {
						type: "heatmap",
						data: oData.value || []
					};
				});
		},

		/**
		 * Generate gauge data
		 */
		_loadGaugeData: function () {
			// For gauge, we'll use aggregated data
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders" +
				"?$top=1" +
				"&$select=OrderID";

			return fetch(sUrl)
				.then(response => response.json())
				.then(function () {
					// Return mock gauge value (in real scenario, calculate from data)
					return {
						type: "gauge",
						data: {
							value: 75,
							max: 100
						}
					};
				});
		},

		/**
		 * Generate candlestick data (mock data as Northwind doesn't have stock data)
		 */
		_loadCandlestickData: function () {
			// Generate mock candlestick data
			const aData = [];
			const dStartDate = new Date(2020, 0, 1);
			for (let i = 0; i < 30; i++) {
				const dDate = new Date(dStartDate);
				dDate.setDate(dDate.getDate() + i);
				const fOpen = 100 + Math.random() * 20;
				const fClose = fOpen + (Math.random() - 0.5) * 10;
				const fHigh = Math.max(fOpen, fClose) + Math.random() * 5;
				const fLow = Math.min(fOpen, fClose) - Math.random() * 5;
				aData.push([
					dDate.getTime(),
					parseFloat(fOpen.toFixed(2)),
					parseFloat(fClose.toFixed(2)),
					parseFloat(fLow.toFixed(2)),
					parseFloat(fHigh.toFixed(2))
				]);
			}
			return Promise.resolve({
				type: "candlestick",
				data: aData
			});
		},

		/**
		 * Load Orders data for funnel chart
		 */
		_loadFunnelData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders" +
				"?$select=OrderID,ShipVia";

			return fetch(sUrl)
				.then(response => response.json())
				.then(oData => {
					// Group by ShipVia
					const mGroups = {};
					(oData.value || []).forEach(function (oOrder) {
						const sKey = "Shipper " + (oOrder.ShipVia || "Unknown");
						mGroups[sKey] = (mGroups[sKey] || 0) + 1;
					});
					return {
						type: "funnel",
						data: Object.keys(mGroups).map(function (sKey) {
							return {
								name: sKey,
								value: mGroups[sKey]
							};
						})
					};
				});
		},

		/**
		 * Load Categories hierarchy for tree chart
		 */
		_loadTreeData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Categories" +
				"?$select=CategoryID,CategoryName" +
				"&$expand=Products($select=ProductID,ProductName;$top=5)";

			return fetch(sUrl)
				.then(response => response.json())
				.then(oData => {
					return {
						type: "tree",
						data: (oData.value || []).map(function (oCategory) {
							return {
								name: oCategory.CategoryName,
								children: (oCategory.Products || []).map(function (oProduct) {
									return {
										name: oProduct.ProductName,
										value: 1
									};
								})
							};
						})
					};
				});
		}
	});

	// Return singleton instance
	return new ChartDataClass();
});
