/**
 * Optimization Strategies Utility
 * Provides various optimization strategies for large datasets
 */
sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	var OptimizationStrategiesClass = BaseObject.extend("ui5.echarts.app.utils.OptimizationStrategies", {
		/**
		 * Apply LTTB (Largest-Triangle-Three-Buckets) sampling algorithm
		 * @param {Array} aData - Original data array
		 * @param {number} iThreshold - Target number of points
		 * @returns {Array} Sampled data array
		 */
		applyLTTBSampling: function (aData, iThreshold) {
			if (!aData || aData.length <= iThreshold) {
				return aData;
			}

			const iDataLength = aData.length;
			if (iThreshold >= iDataLength || iThreshold === 0) {
				return aData;
			}

			const aSampled = [];
			const iBucketSize = (iDataLength - 2) / (iThreshold - 2);
			let iA = 0;
			let iNextA = 0;

			aSampled.push(aData[iA]);

			for (let i = 0; i < iThreshold - 2; i++) {
				const iRangeStart = Math.floor((i + 0) * iBucketSize) + 1;
				const iRangeEnd = Math.floor((i + 1) * iBucketSize) + 1;
				const iRangeCenter = Math.floor((i + 0.5) * iBucketSize) + 1;

				let fAvgX = 0;
				let fAvgY = 0;
				let iAvgRangeStart = Math.floor(iRangeStart);
				let iAvgRangeEnd = Math.floor(iRangeEnd);

				for (let j = iAvgRangeStart; j < iAvgRangeEnd; j++) {
					fAvgX += aData[j][0];
					fAvgY += aData[j][1];
				}
				const iAvgRangeLength = iAvgRangeEnd - iAvgRangeStart;
				fAvgX /= iAvgRangeLength;
				fAvgY /= iAvgRangeLength;

				let fMaxArea = -1;
				for (let j = iAvgRangeStart; j < iAvgRangeEnd; j++) {
					const fArea = Math.abs(
						(aData[iA][0] - fAvgX) * (aData[j][1] - aData[iA][1]) -
						(aData[iA][0] - aData[j][0]) * (fAvgY - aData[iA][1])
					) * 0.5;
					if (fArea > fMaxArea) {
						fMaxArea = fArea;
						iNextA = j;
					}
				}

				aSampled.push(aData[iNextA]);
				iA = iNextA;
			}

			aSampled.push(aData[iDataLength - 1]);
			return aSampled;
		},

		/**
		 * Enable progressive rendering in ECharts option
		 * @param {Object} oOption - ECharts option object
		 * @returns {Object} Modified option object
		 */
		enableProgressiveRendering: function (oOption) {
			if (!oOption) {
				return oOption;
			}

			oOption.animation = false;
			oOption.progressive = 1000;
			oOption.progressiveThreshold = 3000;

			// Apply to all series
			if (oOption.series && Array.isArray(oOption.series)) {
				oOption.series.forEach(function (oSeries) {
					oSeries.large = true;
					oSeries.largeThreshold = 2000;
					oSeries.animation = false;
				});
			}

			return oOption;
		},

		/**
		 * Optimize ECharts option for large dataset
		 * @param {Object} oOption - ECharts option object
		 * @param {number} iDataSize - Data size
		 * @returns {Object} Optimized option object
		 */
		optimizeForLargeDataset: function (oOption, iDataSize) {
			if (!oOption || iDataSize <= 2000) {
				return oOption;
			}

			// Disable animations for large datasets
			oOption.animation = false;

			// Enable progressive rendering
			if (iDataSize > 3000) {
				oOption.progressive = 1000;
				oOption.progressiveThreshold = 3000;
			}

			// Enable large dataset mode
			oOption.large = true;
			oOption.largeThreshold = 2000;

			// Optimize series
			if (oOption.series && Array.isArray(oOption.series)) {
				oOption.series.forEach(function (oSeries) {
					oSeries.large = true;
					oSeries.largeThreshold = 2000;
					oSeries.animation = false;
					oSeries.symbol = "none"; // Remove symbols for performance
				});
			}

			return oOption;
		},

		/**
		 * Compare performance metrics
		 * @param {Object} oBefore - Before metrics
		 * @param {Object} oAfter - After metrics
		 * @returns {Object} Comparison result
		 */
		comparePerformance: function (oBefore, oAfter) {
			const oComparison = {
				renderTime: {
					before: oBefore.renderTime || 0,
					after: oAfter.renderTime || 0,
					improvement: 0
				},
				memory: {
					before: oBefore.memory || 0,
					after: oAfter.memory || 0,
					improvement: 0
				},
				fps: {
					before: oBefore.fps || 0,
					after: oAfter.fps || 0,
					improvement: 0
				}
			};

			// Calculate improvements
			if (oComparison.renderTime.before > 0) {
				oComparison.renderTime.improvement = 
					((oComparison.renderTime.before - oComparison.renderTime.after) / 
					oComparison.renderTime.before * 100).toFixed(2);
			}

			if (oComparison.memory.before > 0) {
				oComparison.memory.improvement = 
					((oComparison.memory.before - oComparison.memory.after) / 
					oComparison.memory.before * 100).toFixed(2);
			}

			if (oComparison.fps.before > 0) {
				oComparison.fps.improvement = 
					((oComparison.fps.after - oComparison.fps.before) / 
					oComparison.fps.before * 100).toFixed(2);
			}

			return oComparison;
		}
	});

	// Return singleton instance
	return new OptimizationStrategiesClass();
});
