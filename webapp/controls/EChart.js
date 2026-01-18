sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler",
	"sap/base/Log"
], function (Control, ResizeHandler, Log) {
	"use strict";

	return Control.extend("ui5.echarts.app.controls.EChart", {
		metadata: {
			properties: {
				width: { type: "sap.ui.core.CSSSize", defaultValue: "100%" },
				height: { type: "sap.ui.core.CSSSize", defaultValue: "400px" },
				option: { type: "object", defaultValue: {} }
			},
			events: {
				chartReady: {}
			}
		},

		init: function () {
			this._sResizeHandlerId = null;
			this._bEChartsLoaded = false;
		},

		onAfterRendering: function () {
			console.log("EChart onAfterRendering called"); // Debug log
			if (!this._chart) {
				console.log("Loading ECharts library..."); // Debug log
				this._loadEChartsLibrary().then(() => {
					console.log("ECharts library loaded, initializing chart..."); // Debug log
					this._initChart();
					this._registerResizeHandler();
				}).catch((oError) => {
					console.error("Failed to load ECharts library:", oError); // Debug log
					Log.error("Failed to load ECharts library", oError);
				});
			} else {
				console.log("Chart already initialized"); // Debug log
			}
		},

		/**
		 * Load ECharts library dynamically
		 * @returns {Promise} Promise that resolves when ECharts is loaded
		 */
		_loadEChartsLibrary: function () {
			if (this._bEChartsLoaded || typeof echarts !== "undefined") {
				this._bEChartsLoaded = true;
				return Promise.resolve();
			}

			return new Promise((resolve, reject) => {
				if (typeof require !== "undefined") {
					// Try to load via require (if available through ui5-tooling-modules)
					try {
						require(["echarts"], (echarts) => {
							window.echarts = echarts;
							this._bEChartsLoaded = true;
							resolve();
						}, reject);
					} catch (e) {
						// Fallback to CDN
						this._loadEChartsFromCDN().then(resolve).catch(reject);
					}
				} else {
					// Load from CDN
					this._loadEChartsFromCDN().then(resolve).catch(reject);
				}
			});
		},

		/**
		 * Load ECharts from CDN
		 * @returns {Promise} Promise that resolves when ECharts is loaded
		 */
		_loadEChartsFromCDN: function () {
			return new Promise((resolve, reject) => {
				// Check if ECharts is already loaded
				if (typeof echarts !== "undefined") {
					this._bEChartsLoaded = true;
					resolve();
					return;
				}

				// Check if script is already being loaded
				if (document.getElementById("echarts-script")) {
					// Already loading, poll until echarts is available
					const checkInterval = setInterval(() => {
						if (typeof echarts !== "undefined") {
							clearInterval(checkInterval);
							this._bEChartsLoaded = true;
							resolve();
						}
					}, 100);

					// Set timeout to prevent infinite polling (10 seconds)
					setTimeout(() => {
						clearInterval(checkInterval);
						if (typeof echarts === "undefined") {
							reject(new Error("ECharts failed to load within timeout period"));
						}
					}, 10000);
					return;
				}

				// Create and load script
				const oScript = document.createElement("script");
				oScript.id = "echarts-script";
				oScript.src = "https://cdn.jsdelivr.net/npm/echarts@6.0.0/dist/echarts.min.js";
				oScript.onload = () => {
					this._bEChartsLoaded = true;
					resolve();
				};
				oScript.onerror = () => {
					reject(new Error("Failed to load ECharts from CDN"));
				};
				document.head.appendChild(oScript);
			});
		},

		/**
		 * Initialize ECharts instance
		 */
		_initChart: function () {
			const oDomRef = this.getDomRef();
			console.log("_initChart called, DOM ref:", oDomRef); // Debug log
			
			if (!oDomRef) {
				Log.warning("DOM reference not available for EChart initialization");
				console.warn("DOM reference not available");
				return;
			}

			// Ensure container has proper dimensions
			const sHeight = this.getHeight();
			const sWidth = this.getWidth();
			
			// Force set height and width if not set or is 0
			if (!oDomRef.style.height || oDomRef.style.height === "0px" || oDomRef.offsetHeight === 0) {
				oDomRef.style.height = sHeight;
				console.log("Fixed container height to:", sHeight); // Debug log
			}
			if (!oDomRef.style.width || oDomRef.style.width === "0px" || oDomRef.offsetWidth === 0) {
				oDomRef.style.width = sWidth;
				console.log("Fixed container width to:", sWidth); // Debug log
			}
			oDomRef.style.display = "block";
			oDomRef.style.minHeight = sHeight;
			oDomRef.style.boxSizing = "border-box";

			console.log("Container dimensions:", oDomRef.offsetWidth, "x", oDomRef.offsetHeight); // Debug log

			if (typeof echarts === "undefined") {
				Log.error("ECharts library not loaded");
				console.error("ECharts library not loaded");
				return;
			}

			console.log("Initializing ECharts instance..."); // Debug log
			try {
				this._chart = echarts.init(oDomRef, null, {
					renderer: "canvas",
					useDirtyRect: true // Performance optimization
				});

				console.log("ECharts instance created:", this._chart); // Debug log

				// Apply initial option if available
				const oOption = this.getOption();
				console.log("Current option:", oOption); // Debug log
				
				if (oOption && Object.keys(oOption).length > 0) {
					this._chart.setOption(oOption, { notMerge: false });
					Log.info("ECharts instance initialized with option");
					console.log("Chart option applied during initialization"); // Debug log
				} else {
					Log.info("ECharts instance initialized (no option yet)");
					console.log("Chart initialized but no option available yet"); // Debug log
				}

				this.fireChartReady();
				console.log("Chart ready event fired"); // Debug log
				
				// Force resize after initialization to ensure chart renders
				setTimeout(() => {
					if (this._chart && oDomRef) {
						this._chart.resize();
						console.log("Chart resized after initialization, dimensions:", oDomRef.offsetWidth, "x", oDomRef.offsetHeight); // Debug log
					}
				}, 100);
			} catch (oError) {
				console.error("Error initializing ECharts:", oError); // Debug log
				Log.error("Error initializing ECharts", oError);
			}
		},

		/**
		 * Register resize handler
		 */
		_registerResizeHandler: function () {
			if (!this._sResizeHandlerId) {
				this._sResizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
			}
		},

		/**
		 * Handle resize event
		 */
		_onResize: function () {
			if (this._chart) {
				try {
					this._chart.resize();
				} catch (oError) {
					Log.error("Error resizing chart", oError);
				}
			}
		},

		/**
		 * Set chart option
		 * @param {object} oOption - ECharts option object
		 * @returns {sap.ui.core.Control} this for method chaining
		 */
		setOption: function (oOption) {
			console.log("setOption called with:", oOption); // Debug log
			console.log("Chart instance exists:", !!this._chart); // Debug log
			this.setProperty("option", oOption, true);
			
			// If chart is already initialized, apply option immediately
			if (this._chart && oOption && Object.keys(oOption).length > 0) {
				try {
					console.log("Applying option to existing chart instance"); // Debug log
					console.log("Series count:", oOption.series ? oOption.series.length : 0); // Debug log
					this._chart.setOption(oOption, { notMerge: false });
					Log.info("Chart option updated");
					console.log("Chart option applied successfully"); // Debug log
					
					// Force resize to ensure chart renders
					setTimeout(() => {
						if (this._chart) {
							this._chart.resize();
							console.log("Chart resized after setOption"); // Debug log
						}
					}, 50);
				} catch (oError) {
					console.error("Error setting chart option:", oError); // Debug log
					Log.error("Error setting chart option", oError);
				}
			} else if (oOption && Object.keys(oOption).length > 0) {
				// Chart not yet initialized, but option is saved
				// It will be applied when chart initializes in _initChart
				console.log("Chart option saved, will be applied when chart initializes"); // Debug log
				Log.info("Chart option saved, will be applied when chart initializes");
			} else {
				console.warn("setOption called but option is empty or chart not ready"); // Debug log
			}
			
			return this;
		},

		/**
		 * Cleanup on exit
		 */
		exit: function () {
			// Unregister resize handler
			if (this._sResizeHandlerId) {
				ResizeHandler.deregister(this._sResizeHandlerId);
				this._sResizeHandlerId = null;
			}

			// Dispose chart instance
			if (this._chart) {
				try {
					this._chart.dispose();
				} catch (oError) {
					Log.error("Error disposing chart", oError);
				}
				this._chart = null;
			}
		},

		renderer: function (oRM, oControl) {
			oRM.openStart("div", oControl);
			oRM.style("width", oControl.getWidth());
			oRM.style("height", oControl.getHeight());
			oRM.style("display", "block");
			oRM.style("min-height", oControl.getHeight());
			oRM.openEnd();
			oRM.close("div");
		}
	});
});
