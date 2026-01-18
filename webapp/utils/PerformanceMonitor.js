/**
 * Performance Monitor Utility
 * Provides performance monitoring capabilities for chart rendering
 */
sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	return BaseObject.extend("ui5.echarts.app.utils.PerformanceMonitor", {
		_timings: {},
		_startTimes: {},
		_memorySnapshots: [],

		/**
		 * Start timing for a specific operation
		 * @param {string} sName - Operation name
		 */
		startTiming: function (sName) {
			this._startTimes[sName] = performance.now();
		},

		/**
		 * End timing and record the duration
		 * @param {string} sName - Operation name
		 * @returns {number} Duration in milliseconds
		 */
		endTiming: function (sName) {
			if (!this._startTimes[sName]) {
				return 0;
			}
			const fDuration = performance.now() - this._startTimes[sName];
			if (!this._timings[sName]) {
				this._timings[sName] = [];
			}
			this._timings[sName].push(fDuration);
			delete this._startTimes[sName];
			return fDuration;
		},

		/**
		 * Get memory usage (if available)
		 * @returns {Object} Memory usage information
		 */
		getMemoryUsage: function () {
			if (performance.memory) {
				return {
					used: performance.memory.usedJSHeapSize,
					total: performance.memory.totalJSHeapSize,
					limit: performance.memory.jsHeapSizeLimit
				};
			}
			return null;
		},

		/**
		 * Take a memory snapshot
		 * @param {string} sLabel - Snapshot label
		 */
		takeMemorySnapshot: function (sLabel) {
			const oMemory = this.getMemoryUsage();
			if (oMemory) {
				this._memorySnapshots.push({
					label: sLabel,
					timestamp: Date.now(),
					memory: oMemory
				});
			}
		},

		/**
		 * Get FPS (Frames Per Second) - approximate
		 * @returns {number} Estimated FPS
		 */
		getFPS: function () {
			// Simple FPS estimation using requestAnimationFrame
			return new Promise(function (resolve) {
				let iFrames = 0;
				const fStartTime = performance.now();
				const fnCount = function () {
					iFrames++;
					if (performance.now() - fStartTime < 1000) {
						requestAnimationFrame(fnCount);
					} else {
						resolve(iFrames);
					}
				};
				requestAnimationFrame(fnCount);
			});
		},

		/**
		 * Generate performance report
		 * @returns {Object} Performance report
		 */
		generateReport: function () {
			const oReport = {
				timings: {},
				memory: this.getMemoryUsage(),
				snapshots: this._memorySnapshots
			};

			// Calculate average timings
			for (const sName in this._timings) {
				const aTimings = this._timings[sName];
				oReport.timings[sName] = {
					count: aTimings.length,
					total: aTimings.reduce(function (sum, val) {
						return sum + val;
					}, 0),
					average: aTimings.reduce(function (sum, val) {
						return sum + val;
					}, 0) / aTimings.length,
					min: Math.min.apply(null, aTimings),
					max: Math.max.apply(null, aTimings)
				};
			}

			return oReport;
		},

		/**
		 * Reset all measurements
		 */
		reset: function () {
			this._timings = {};
			this._startTimes = {};
			this._memorySnapshots = [];
		}
	});
});
