sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"ui5/echarts/app/utils/PerformanceMonitor",
	"ui5/echarts/app/utils/OptimizationStrategies",
	"ui5/echarts/app/utils/DataGenerator",
	"ui5/echarts/app/utils/ThemeColors"
], function (Controller, JSONModel, Log, PerformanceMonitor, OptimizationStrategies, DataGenerator, ThemeColors) {
	"use strict";

	return Controller.extend("ui5.echarts.app.controller.Optimization", {
		onInit: function () {
			// Initialize performance monitor
			this._oPerformanceMonitor = new PerformanceMonitor();

			// Define scenarios
			const aScenarios = [
				{
					key: "sampling",
					text: "Data Sampling (LTTB)",
					description: "Compare rendering with full dataset vs LTTB sampled dataset"
				},
				{
					key: "performance",
					text: "Performance Metrics",
					description: "Compare performance metrics across different data volumes"
				},
				{
					key: "data-volume",
					text: "Data Volume Comparison",
					description: "Compare rendering performance with 1K, 10K, and 100K data points"
				},
				{
					key: "progressive",
					text: "Progressive Rendering",
					description: "Compare standard rendering vs progressive rendering"
				}
			];

			const oModel = new JSONModel({
				scenarios: aScenarios,
				selectedScenario: "sampling",
				description: "",
				performanceData: []
			});
			this.getView().setModel(oModel);

			// Get router and attach route matched event
			this.getRouter().getRoute("optimization").attachPatternMatched(this._onOptimizationMatched, this);
		},

		_onOptimizationMatched: function (oEvent) {
			const sScenario = oEvent.getParameter("arguments").scenario || "sampling";
			this.getView().getModel().setProperty("/selectedScenario", sScenario);
			this._loadScenario(sScenario);
		},

		onScenarioChange: function (oEvent) {
			const sSelectedKey = oEvent.getParameter("selectedItem").getKey();
			this.getView().getModel().setProperty("/selectedScenario", sSelectedKey);
			this._loadScenario(sSelectedKey);
		},

		_loadScenario: function (sScenario) {
			switch (sScenario) {
				case "sampling":
					this._loadSamplingScenario();
					break;
				case "performance":
					this._loadPerformanceScenario();
					break;
				case "data-volume":
					this._loadDataVolumeScenario();
					break;
				case "progressive":
					this._loadProgressiveScenario();
					break;
				default:
					Log.warning("Unknown scenario: " + sScenario);
			}
		},

		_loadSamplingScenario: function () {
			// Reset performance monitor to ensure clean measurements
			this._oPerformanceMonitor.reset();
			
			// Generate large dataset
			const oGenerator = new DataGenerator();
			const aFullData = oGenerator.generateTimeSeriesData(10000);
			
			// Measure LTTB sampling time
			this._oPerformanceMonitor.startTiming("lttb-sampling");
			const aSampledData = OptimizationStrategies.applyLTTBSampling(aFullData, 1000);
			this._oPerformanceMonitor.endTiming("lttb-sampling");

			// Render before (full data) - wait a bit to ensure clean state
			setTimeout(function () {
				this._renderChart("chartBefore", aFullData, false);
				
				// Render after (sampled data) - wait for before to complete
				setTimeout(function () {
					this._renderChart("chartAfter", aSampledData, false);
					
					// Compare performance after both charts are rendered
					setTimeout(function () {
						this._comparePerformance("sampling");
					}.bind(this), 500);
				}.bind(this), 1000);
			}.bind(this), 100);
		},

		_loadPerformanceScenario: function () {
			// This will show performance metrics in a table
			const oGenerator = new DataGenerator();
			const mVolumes = {
				"1K": oGenerator.generateTimeSeriesData(1000),
				"10K": oGenerator.generateTimeSeriesData(10000),
				"100K": oGenerator.generateTimeSeriesData(100000)
			};

			// Render before and after for 10K data
			this._renderChart("chartBefore", mVolumes["10K"], false);
			this._renderChart("chartAfter", mVolumes["10K"], true);
			
			setTimeout(function () {
				this._comparePerformance("performance");
			}.bind(this), 2000);
		},

		_loadDataVolumeScenario: function () {
			// Reset performance monitor
			this._oPerformanceMonitor.reset();
			
			// Use same time range (1 year = 365 days) but different data point densities
			// Before: 1K points over 1 year
			// After: 10K points over same 1 year period
			const dStartDate = new Date(2020, 0, 1);
			const iDays = 365; // 1 year
			const iMillisecondsPerDay = 24 * 60 * 60 * 1000;
			
			// Generate 1K points over 1 year
			// Interval: 365 days / 1000 points = 0.365 days per point
			const a1K = [];
			const fInterval1K = iDays / 1000;
			let fCurrentValue1K = 100;
			
			for (let i = 0; i < 1000; i++) {
				const dDate = new Date(dStartDate);
				dDate.setTime(dStartDate.getTime() + i * fInterval1K * iMillisecondsPerDay);
				
				fCurrentValue1K += (Math.random() - 0.5) * 20;
				fCurrentValue1K = Math.max(0, fCurrentValue1K);
				
				a1K.push([
					dDate.getTime(),
					parseFloat(fCurrentValue1K.toFixed(2))
				]);
			}
			
			// Generate 10K points over same 1 year period
			// Interval: 365 days / 10000 points = 0.0365 days per point
			const a10K = [];
			const fInterval10K = iDays / 10000;
			let fCurrentValue10K = 100;
			
			for (let i = 0; i < 10000; i++) {
				const dDate = new Date(dStartDate);
				dDate.setTime(dStartDate.getTime() + i * fInterval10K * iMillisecondsPerDay);
				
				fCurrentValue10K += (Math.random() - 0.5) * 20;
				fCurrentValue10K = Math.max(0, fCurrentValue10K);
				
				a10K.push([
					dDate.getTime(),
					parseFloat(fCurrentValue10K.toFixed(2))
				]);
			}

			// Render before (1K points) and after (10K points) with same time range
			setTimeout(function () {
				this._renderChart("chartBefore", a1K, false);
				
				setTimeout(function () {
					this._renderChart("chartAfter", a10K, true);
					
					setTimeout(function () {
						this._comparePerformance("data-volume");
					}.bind(this), 500);
				}.bind(this), 1000);
			}.bind(this), 100);
		},

		_loadProgressiveScenario: function () {
			const oGenerator = new DataGenerator();
			const aData = oGenerator.generateTimeSeriesData(10000);

			this._renderChart("chartBefore", aData, false);
			this._renderChart("chartAfter", aData, true);
			
			setTimeout(function () {
				this._comparePerformance("progressive");
			}.bind(this), 2000);
		},

		_renderChart: function (sChartId, aData, bOptimized) {
			const oChart = this.byId(sChartId);
			if (!oChart) {
				return;
			}

			// Format data count for display
			const iDataCount = aData ? aData.length : 0;
			const sDataCountText = iDataCount >= 1000 ? 
				(iDataCount / 1000).toFixed(1) + "K points" : 
				iDataCount + " points";
			
			// Prepare chart option
			let oChartOption = {
				title: {
					text: (bOptimized ? "Optimized" : "Original") + " (" + sDataCountText + ")",
					left: "center"
				},
				tooltip: {
					trigger: "axis"
				},
				xAxis: {
					type: "time"
				},
				yAxis: {
					type: "value"
				},
				series: [{
					name: "Data",
					type: "line",
					data: aData,
					smooth: true,
					symbol: "none"
				}]
			};

			// Apply optimizations if needed
			if (bOptimized) {
				oChartOption = OptimizationStrategies.optimizeForLargeDataset(oChartOption, aData.length);
			}

			// Apply theme
			oChartOption = ThemeColors.applyThemeColors(oChartOption);

			// Render chart with proper performance monitoring
			const fnRender = function () {
				if (oChart._chart) {
					// Chart already initialized
					// Start performance monitoring right before setOption
					this._oPerformanceMonitor.startTiming(sChartId + "-render");
					this._oPerformanceMonitor.takeMemorySnapshot(sChartId + "-before");
					
					// Set option (synchronous call, but rendering is async)
					oChart.setOption(oChartOption, { notMerge: false });
					
					// Wait for rendering to complete
					// Use setTimeout to wait for next event loop cycle after setOption
					setTimeout(function () {
						// Use requestAnimationFrame to wait for actual paint
						requestAnimationFrame(function () {
							requestAnimationFrame(function () {
								this._oPerformanceMonitor.endTiming(sChartId + "-render");
								this._oPerformanceMonitor.takeMemorySnapshot(sChartId + "-after");
							}.bind(this));
						}.bind(this));
					}.bind(this), 0);
				} else {
					// Chart not initialized yet, wait for chartReady
					oChart.attachChartReady(function () {
						// Start timing after chart is ready (initialization time not included)
						this._oPerformanceMonitor.startTiming(sChartId + "-render");
						this._oPerformanceMonitor.takeMemorySnapshot(sChartId + "-before");
						
						oChart.setOption(oChartOption, { notMerge: false });
						
						// Wait for rendering to complete
						setTimeout(function () {
							requestAnimationFrame(function () {
								requestAnimationFrame(function () {
									this._oPerformanceMonitor.endTiming(sChartId + "-render");
									this._oPerformanceMonitor.takeMemorySnapshot(sChartId + "-after");
								}.bind(this));
							}.bind(this));
						}.bind(this), 0);
					}.bind(this), this);
				}
			}.bind(this);

			fnRender();
		},

		_comparePerformance: function (sScenario) {
			const oReport = this._oPerformanceMonitor.generateReport();
			const aPerformanceData = [];

			// Extract metrics
			const fBeforeTime = oReport.timings["chartBefore-render"] ? 
				oReport.timings["chartBefore-render"].average : 0;
			const fAfterTime = oReport.timings["chartAfter-render"] ? 
				oReport.timings["chartAfter-render"].average : 0;

			const oBeforeMemory = oReport.snapshots.find(function (s) {
				return s.label === "chartBefore-after";
			});
			const oAfterMemory = oReport.snapshots.find(function (s) {
				return s.label === "chartAfter-after";
			});

			const fBeforeMemory = oBeforeMemory ? (oBeforeMemory.memory.used / 1024 / 1024).toFixed(2) : "N/A";
			const fAfterMemory = oAfterMemory ? (oAfterMemory.memory.used / 1024 / 1024).toFixed(2) : "N/A";

			// Calculate improvements
			const fTimeImprovement = fBeforeTime > 0 ? 
				((fBeforeTime - fAfterTime) / fBeforeTime * 100).toFixed(2) + "%" : "N/A";

			aPerformanceData.push({
				metric: "Render Time",
				before: fBeforeTime.toFixed(2) + " ms",
				after: fAfterTime.toFixed(2) + " ms",
				improvement: fTimeImprovement
			});

			aPerformanceData.push({
				metric: "Memory Usage",
				before: fBeforeMemory + " MB",
				after: fAfterMemory + " MB",
				improvement: "N/A"
			});

			this.getView().getModel().setProperty("/performanceData", aPerformanceData);
		},

		onNavBack: function () {
			this.getRouter().navTo("chartList");
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});
});
