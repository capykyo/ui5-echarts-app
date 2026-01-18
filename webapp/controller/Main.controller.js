sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, Log, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.Main", {
		onInit: function () {
			this._bDataLoaded = false; // Flag to prevent multiple data loads
			console.log("Main controller onInit called"); // Debug log
		},

		onAfterRendering: function () {
			console.log("Main controller onAfterRendering called"); // Debug log
			
			// Ensure Page content has proper height
			const oPage = this.byId("page") || this.getView().byId("__page0");
			if (oPage) {
				const oContent = oPage.getDomRef("cont");
				if (oContent) {
					oContent.style.minHeight = "500px";
					oContent.style.height = "auto";
					console.log("Fixed Page content height"); // Debug log
				}
			}
			
			// Load data directly using fetch API to avoid CORS issues
			this._loadNorthwindData();
		},

		/**
		 * Load data from SAP Northwind OData service using fetch API
		 */
		_loadNorthwindData: function () {
			if (this._bDataLoaded) {
				console.log("Data already loaded, skipping..."); // Debug log
				return;
			}

			// Set flag immediately before starting fetch to prevent concurrent requests
			this._bDataLoaded = true;

			Log.info("Starting to load Northwind data...");
			console.log("Loading Orders from Northwind using fetch..."); // Debug log

			// Use fetch API to avoid CORS issues
			// Northwind V4 service supports CORS
			const sUrl = "https://services.odata.org/V4/Northwind/Northwind.svc/Orders" +
				"?$top=10000" +
				"&$orderby=OrderDate desc" +
				"&$select=OrderID,OrderDate,Freight,ShipCity,ShipCountry";

			fetch(sUrl)
				.then(response => {
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					return response.json();
				})
				.then(oData => {
					console.log("OData response:", oData); // Debug log
					const aOrders = oData.value || [];
					Log.info(`Loaded ${aOrders.length} orders from Northwind`);
					console.log("Orders array:", aOrders); // Debug log
					if (aOrders.length > 0) {
						console.log("First order sample:", aOrders[0]); // Debug log
					}
					this._updateChartWithOrders(aOrders);
				})
				.catch(oError => {
					// Reset flag on error to allow retry
					this._bDataLoaded = false;
					console.error("Fetch error:", oError); // Debug log
					Log.error("Error loading Northwind data:", oError);
					this._showError("Failed to load data from Northwind service. Please check your internet connection.");
				});
		},

		/**
		 * Update EChart with orders data
		 * @param {Array} aOrders - Array of order objects
		 */
		_updateChartWithOrders: function (aOrders) {
			console.log("_updateChartWithOrders called with:", aOrders); // Debug log
			
			if (!aOrders || aOrders.length === 0) {
				Log.warning("No orders data available");
				console.warn("No orders data available");
				return;
			}

			Log.info(`Processing ${aOrders.length} orders for chart`);

			// Transform OData to ECharts time series format
			const aTimeSeriesData = aOrders
				.filter(oOrder => oOrder.OrderDate)
				.map(oOrder => {
					const oDate = new Date(oOrder.OrderDate);
					return [
						oDate.getTime(),
						parseFloat(oOrder.Freight) || 0
					];
				})
				.sort((a, b) => a[0] - b[0]); // Sort by date

			console.log("Time series data sample:", aTimeSeriesData.slice(0, 5)); // Debug log
			console.log("Time series data length:", aTimeSeriesData.length); // Debug log

			// Group by country for multi-series chart
			const mCountryData = {};
			aOrders.forEach(oOrder => {
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

			console.log("Countries found:", Object.keys(mCountryData)); // Debug log

			// Create series for top countries
			const aSeries = Object.keys(mCountryData)
				.map(sCountry => ({
					name: sCountry,
					type: "line",
					data: mCountryData[sCountry].sort((a, b) => a[0] - b[0]),
					smooth: true,
					symbol: "none",
					large: true,
					largeThreshold: 2000
				}))
				.filter(oSeries => oSeries.data.length > 0)
				.slice(0, 10); // Limit to top 10 countries

			console.log("Series created:", aSeries.length, "series"); // Debug log
			if (aSeries.length > 0) {
				console.log("First series sample:", aSeries[0]); // Debug log
			}

			// Prepare ECharts option
			let oChartOption = {
				title: {
					text: "Northwind Orders - Freight Over Time",
					left: "center"
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "cross"
					},
					formatter: function (params) {
						// Validate params array
						if (!params || !Array.isArray(params) || params.length === 0) {
							return "";
						}

						// Safely access axisValueLabel
						const sAxisValue = params[0].axisValueLabel || params[0].axisValue || "";
						let sResult = sAxisValue + "<br/>";

						// Safely iterate through params
						params.forEach(param => {
							if (param && param.seriesName && param.value && Array.isArray(param.value) && param.value.length >= 2) {
								sResult += param.seriesName + ": $" + param.value[1].toFixed(2) + "<br/>";
							}
						});

						return sResult;
					}
				},
				legend: {
					data: aSeries.map(s => s.name),
					top: "10%",
					type: "scroll"
				},
				grid: {
					left: "3%",
					right: "4%",
					bottom: "15%", // Increased bottom space for dataZoom slider
					top: "15%", // Space for title and legend
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
						bottom: "5%", // Position slider at bottom with margin
						handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,11.9v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4c0-5-3.9-9.1-8.8-9.4V2.2h-1.3v1.3C8.1,3.8,4.2,7.9,4.2,12.9C4.2,17.9,8.1,22,13.3,22.3v-1.3h-1.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C22.1,16.3,18.2,12.2,13.3,11.9z",
						handleSize: "80%",
						handleStyle: {
							color: "#fff",
							shadowBlur: 3,
							shadowColor: "rgba(0, 0, 0, 0.6)",
							shadowOffsetX: 2,
							shadowOffsetY: 2
						},
						textStyle: {
							color: "#999"
						},
						borderColor: "#ccc"
					}
				],
				series: aSeries.length > 0 ? aSeries : [{
					name: "Freight",
					type: "line",
					data: aTimeSeriesData,
					smooth: true,
					symbol: "none",
					large: true,
					largeThreshold: 2000,
					animation: aTimeSeriesData.length > 2000 ? false : true
				}]
			};

			// Apply performance optimizations for large datasets
			if (aTimeSeriesData.length > 2000) {
				oChartOption.animation = false;
				oChartOption.progressive = 1000;
				oChartOption.progressiveThreshold = 3000;
			}

			// Apply SAP Horizon theme colors
			oChartOption = ThemeColors.applyThemeColors(oChartOption);
			console.log("Applied Horizon theme colors to chart"); // Debug log

			// Update chart - wait for chart to be ready
			const oChart = this.byId("echart");
			console.log("Chart control:", oChart); // Debug log
			console.log("Chart option:", oChartOption); // Debug log
			console.log("Series data:", oChartOption.series); // Debug log
			
			if (oChart) {
				// Check if chart instance exists
				if (oChart._chart) {
					console.log("Chart instance exists, setting option directly"); // Debug log
					oChart.setOption(oChartOption);
					// Force resize to ensure chart renders
					setTimeout(() => {
						if (oChart._chart) {
							oChart._chart.resize();
							console.log("Chart resized"); // Debug log
						}
					}, 100);
				} else {
					// Wait for chart to be initialized
					console.log("Chart instance not ready, waiting..."); // Debug log
					this._waitForChartAndSetOption(oChart, oChartOption);
				}
			} else {
				Log.error("EChart control not found");
				console.error("EChart control not found");
			}
		},

		/**
		 * Wait for chart to be ready and then set option
		 * @param {object} oChart - EChart control instance
		 * @param {object} oOption - Chart option
		 */
		_waitForChartAndSetOption: function (oChart, oOption) {
			// Check if chart is ready (has _chart instance)
			if (oChart._chart) {
				oChart.setOption(oOption);
				Log.info("Chart updated with Northwind data");
				return;
			}

			// Wait for chartReady event
			oChart.attachChartReady(() => {
				oChart.setOption(oOption);
				Log.info("Chart updated with Northwind data (after chart ready)");
			}, this);

			// Also set option immediately (it will be saved and applied when chart initializes)
			oChart.setOption(oOption);
			Log.info("Chart option set (chart will apply when ready)");
		},

		/**
		 * Show error message
		 * @param {string} sMessage - Error message
		 */
		_showError: function (sMessage) {
			console.error("Error:", sMessage); // Debug log
			Log.error(sMessage);
			// Try to show message box if available
			if (sap && sap.m && sap.m.MessageBox) {
				sap.m.MessageBox.error(sMessage, {
					title: "Error"
				});
			}
		}
	});
});
