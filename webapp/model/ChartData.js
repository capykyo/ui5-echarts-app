/**
 * Chart Data Model
 * Provides unified data loading and transformation for different chart types.
 * Supports two data sources:
 *   - Northwind OData V4 (remote, default)
 *   - Local json-server mock at http://localhost:3000 (Sales / Products / TimeSeries)
 */
sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var MOCK_BASE = "http://localhost:3000";

	var ChartDataClass = BaseObject.extend("ui5.echarts.app.model.ChartData", {

		// ─── Data source flag ────────────────────────────────────────────────────
		_useMockData: false,

		setUseMockData: function (bUseMock) {
			this._useMockData = !!bUseMock;
		},

		isUsingMockData: function () {
			return this._useMockData;
		},

		// ─── Public entry point ──────────────────────────────────────────────────
		loadDataForChart: function (sChartType) {
			if (this._useMockData) {
				return this._loadMockDataForChart(sChartType);
			}
			return this._loadRemoteDataForChart(sChartType);
		},

		// ─── Remote (Northwind) ──────────────────────────────────────────────────
		_loadRemoteDataForChart: function (sChartType) {
			switch (sChartType) {
				case "line":      return this._loadLineChartData();
				case "bar":       return this._loadBarChartData();
				case "pie":       return this._loadPieChartData();
				case "scatter":   return this._loadScatterChartData();
				case "radar":     return this._loadRadarChartData();
				case "heatmap":   return this._loadHeatmapData();
				case "gauge":     return this._loadGaugeData();
				case "candlestick": return this._loadCandlestickData();
				case "funnel":    return this._loadFunnelData();
				case "tree":      return this._loadTreeData();
				default:
					return Promise.reject(new Error("Unknown chart type: " + sChartType));
			}
		},

		_loadLineChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders" +
				"?$top=1000&$orderby=OrderDate desc&$select=OrderID,OrderDate,Freight,ShipCity,ShipCountry";
			return fetch(sUrl)
				.then(function (r) { return r.json(); })
				.then(function (o) { return { type: "line", data: o.value || [] }; });
		},

		_loadBarChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Products" +
				"?$top=20&$orderby=UnitPrice desc&$select=ProductID,ProductName,UnitPrice,UnitsInStock";
			return fetch(sUrl)
				.then(function (r) { return r.json(); })
				.then(function (o) { return { type: "bar", data: o.value || [] }; });
		},

		_loadPieChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Categories" +
				"?$select=CategoryID,CategoryName&$expand=Products($select=ProductID)";
			return fetch(sUrl)
				.then(function (r) { return r.json(); })
				.then(function (o) {
					return {
						type: "pie",
						data: (o.value || []).map(function (c) {
							return { name: c.CategoryName, value: (c.Products || []).length };
						})
					};
				});
		},

		_loadScatterChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders" +
				"?$top=500&$select=OrderID,Freight,ShipVia";
			return fetch(sUrl)
				.then(function (r) { return r.json(); })
				.then(function (o) {
					return {
						type: "scatter",
						data: (o.value || []).map(function (order) {
							return [order.ShipVia || 0, parseFloat(order.Freight) || 0];
						})
					};
				});
		},

		_loadRadarChartData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Suppliers" +
				"?$top=5&$select=SupplierID,CompanyName";
			return fetch(sUrl)
				.then(function (r) { return r.json(); })
				.then(function (o) { return { type: "radar", data: o.value || [] }; });
		},

		_loadHeatmapData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders" +
				"?$top=1000&$select=OrderID,OrderDate,ShipCountry";
			return fetch(sUrl)
				.then(function (r) { return r.json(); })
				.then(function (o) { return { type: "heatmap", data: o.value || [] }; });
		},

		_loadGaugeData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders?$top=1&$select=OrderID";
			return fetch(sUrl)
				.then(function (r) { return r.json(); })
				.then(function () { return { type: "gauge", data: { value: 75, max: 100 } }; });
		},

		_loadCandlestickData: function () {
			return Promise.resolve({ type: "candlestick", data: this._generateCandlestickData() });
		},

		_loadFunnelData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders?$select=OrderID,ShipVia";
			return fetch(sUrl)
				.then(function (r) { return r.json(); })
				.then(function (o) {
					const mGroups = {};
					(o.value || []).forEach(function (order) {
						const sKey = "Shipper " + (order.ShipVia || "Unknown");
						mGroups[sKey] = (mGroups[sKey] || 0) + 1;
					});
					return {
						type: "funnel",
						data: Object.keys(mGroups).map(function (k) { return { name: k, value: mGroups[k] }; })
					};
				});
		},

		_loadTreeData: function () {
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Categories" +
				"?$select=CategoryID,CategoryName&$expand=Products($select=ProductID,ProductName;$top=5)";
			return fetch(sUrl)
				.then(function (r) { return r.json(); })
				.then(function (o) {
					return {
						type: "tree",
						data: (o.value || []).map(function (cat) {
							return {
								name: cat.CategoryName,
								children: (cat.Products || []).map(function (p) {
									return { name: p.ProductName, value: 1 };
								})
							};
						})
					};
				});
		},

		// ─── Mock (localhost:3000) ───────────────────────────────────────────────
		_loadMockDataForChart: function (sChartType) {
			var oPromise;
			switch (sChartType) {
				case "line":        oPromise = this._mockLineChart(); break;
				case "bar":         oPromise = this._mockBarChart(); break;
				case "pie":         oPromise = this._mockPieChart(); break;
				case "scatter":     oPromise = this._mockScatterChart(); break;
				case "radar":       oPromise = this._mockRadarChart(); break;
				case "heatmap":     oPromise = this._mockHeatmapChart(); break;
				case "gauge":       oPromise = this._mockGaugeChart(); break;
				case "candlestick": oPromise = this._mockCandlestickChart(); break;
				case "funnel":      oPromise = this._mockFunnelChart(); break;
				case "tree":        oPromise = this._mockTreeChart(); break;
				default:
					return Promise.reject(new Error("Unknown chart type: " + sChartType));
			}
			return oPromise.catch(function (oErr) {
				throw new Error(
					"Mock server not reachable at " + MOCK_BASE +
					". Run: npm run mock-data\n(" + (oErr.message || oErr) + ")"
				);
			});
		},

		// Line: TimeSeries Date+Value+Category → same shape as Northwind Orders
		// Use only the first 2 years of data per category to keep variation visible
		_mockLineChart: function () {
			return fetch(MOCK_BASE + "/TimeSeries")
				.then(function (r) { return r.json(); })
				.then(function (aRows) {
					// Find the earliest date and keep only rows within 2 years of it
					var aTs = aRows.map(function (row) { return new Date(row.DateTime || row.Date).getTime(); });
					var iMin = Math.min.apply(null, aTs);
					var iMax = iMin + 2 * 365 * 24 * 60 * 60 * 1000; // 2 years window

					var aFiltered = aRows.filter(function (row) {
						var t = new Date(row.DateTime || row.Date).getTime();
						return t >= iMin && t <= iMax;
					});

					var aOrders = aFiltered.map(function (row) {
						return {
							OrderDate:   row.DateTime || row.Date,
							Freight:     row.Value,
							ShipCountry: row.Category
						};
					});
					return { type: "line", data: aOrders };
				});
		},

		// Bar: Products Name+Price → same shape as Northwind Products
		_mockBarChart: function () {
			return fetch(MOCK_BASE + "/Products")
				.then(function (r) { return r.json(); })
				.then(function (aRows) {
					var aProducts = aRows
						.sort(function (a, b) { return b.Price - a.Price; })
						.slice(0, 20)
						.map(function (row) {
							return { ProductName: row.Name, UnitPrice: row.Price };
						});
					return { type: "bar", data: aProducts };
				});
		},

		// Pie: Products grouped by Category
		_mockPieChart: function () {
			return fetch(MOCK_BASE + "/Products")
				.then(function (r) { return r.json(); })
				.then(function (aRows) {
					var mCats = {};
					aRows.forEach(function (row) {
						mCats[row.Category] = (mCats[row.Category] || 0) + 1;
					});
					var aData = Object.keys(mCats).map(function (k) {
						return { name: k, value: mCats[k] };
					});
					return { type: "pie", data: aData };
				});
		},

		// Scatter: Sales Quantity vs Amount
		_mockScatterChart: function () {
			return fetch(MOCK_BASE + "/Sales")
				.then(function (r) { return r.json(); })
				.then(function (aRows) {
					var aData = aRows.slice(0, 500).map(function (row) {
						return [row.Quantity || 0, row.Amount || 0];
					});
					return { type: "scatter", data: aData };
				});
		},

		// Radar: Sales grouped by Region → products/avgAmount/totalQty/orderCount
		_mockRadarChart: function () {
			return fetch(MOCK_BASE + "/Sales")
				.then(function (r) { return r.json(); })
				.then(function (aRows) {
					var mRegions = {};
					aRows.forEach(function (row) {
						var r = row.Region || "Unknown";
						if (!mRegions[r]) { mRegions[r] = { orders: 0, totalAmount: 0, totalQty: 0, products: {} }; }
						mRegions[r].orders++;
						mRegions[r].totalAmount += row.Amount || 0;
						mRegions[r].totalQty   += row.Quantity || 0;
						mRegions[r].products[row.ProductID] = true;
					});
					// Return supplier-like objects that RadarChart.controller can consume
					var aSupplierData = Object.keys(mRegions).slice(0, 4).map(function (k) {
						var d = mRegions[k];
						return {
							name:         k,
							products:     Object.keys(d.products).length,
							avgPrice:     d.orders > 0 ? d.totalAmount / d.orders : 0,
							totalStock:   d.totalQty,
							totalOnOrder: d.orders
						};
					});
					// radar controller calls _loadRadarData which does extra fetches;
					// return pre-shaped data via type="radar_ready" and handle in _loadRadarData guard
					return { type: "radar", data: aSupplierData, _mockReady: true };
				});
		},

		// Heatmap: Sales OrderDate+Region → same shape as Northwind Orders
		_mockHeatmapChart: function () {
			return fetch(MOCK_BASE + "/Sales")
				.then(function (r) { return r.json(); })
				.then(function (aRows) {
					var aOrders = aRows.map(function (row) {
						return { OrderDate: row.OrderDate, ShipCountry: row.Region };
					});
					return { type: "heatmap", data: aOrders };
				});
		},

		// Gauge: avg fulfillment rate from Sales (Quantity / Amount ratio normalised)
		_mockGaugeChart: function () {
			return fetch(MOCK_BASE + "/Sales")
				.then(function (r) { return r.json(); })
				.then(function (aRows) {
					var aSample = aRows.slice(0, 200);
					var fTotal = 0;
					aSample.forEach(function (row) { fTotal += row.Amount || 0; });
					var fAvg = aSample.length > 0 ? fTotal / aSample.length : 0;
					var fValue = Math.min(100, Math.round(fAvg / 1000));
					return { type: "gauge", data: { value: fValue, max: 100 } };
				});
		},

		// Candlestick: local generation (no stock data in mock either)
		_mockCandlestickChart: function () {
			return Promise.resolve({ type: "candlestick", data: this._generateCandlestickData() });
		},

		// Funnel: Sales grouped by Region (order count per region)
		_mockFunnelChart: function () {
			return fetch(MOCK_BASE + "/Sales")
				.then(function (r) { return r.json(); })
				.then(function (aRows) {
					var mGroups = {};
					aRows.forEach(function (row) {
						var k = row.Region || "Unknown";
						mGroups[k] = (mGroups[k] || 0) + 1;
					});
					var aData = Object.keys(mGroups).map(function (k) {
						return { name: k, value: mGroups[k] };
					}).sort(function (a, b) { return b.value - a.value; });
					return { type: "funnel", data: aData };
				});
		},

		// Tree: Products grouped by Category → Supplier as leaf
		_mockTreeChart: function () {
			return fetch(MOCK_BASE + "/Products")
				.then(function (r) { return r.json(); })
				.then(function (aRows) {
					var mCats = {};
					aRows.forEach(function (row) {
						if (!mCats[row.Category]) { mCats[row.Category] = []; }
						if (mCats[row.Category].length < 5) {
							mCats[row.Category].push({ name: row.Name, value: 1 });
						}
					});
					var aData = Object.keys(mCats).map(function (k) {
						return { name: k, children: mCats[k] };
					});
					return { type: "tree", data: aData };
				});
		},

		// ─── Shared helpers ──────────────────────────────────────────────────────
		_generateCandlestickData: function () {
			var aData = [];
			var dStart = new Date(2020, 0, 1);
			for (var i = 0; i < 30; i++) {
				var d = new Date(dStart);
				d.setDate(d.getDate() + i);
				var fOpen  = 100 + Math.random() * 20;
				var fClose = fOpen + (Math.random() - 0.5) * 10;
				var fHigh  = Math.max(fOpen, fClose) + Math.random() * 5;
				var fLow   = Math.min(fOpen, fClose) - Math.random() * 5;
				aData.push([
					d.getTime(),
					parseFloat(fOpen.toFixed(2)),
					parseFloat(fClose.toFixed(2)),
					parseFloat(fLow.toFixed(2)),
					parseFloat(fHigh.toFixed(2))
				]);
			}
			return aData;
		}
	});

	return new ChartDataClass();
});
