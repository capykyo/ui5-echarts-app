/**
 * Data Generator Utility
 * Generates large-scale time series data for performance testing
 */
sap.ui.define([
	"sap/ui/base/Object"
], function (BaseObject) {
	"use strict";

	return BaseObject.extend("ui5.echarts.app.utils.DataGenerator", {
		/**
		 * Generate time series data
		 * @param {number} iCount - Number of data points
		 * @param {Object} oOptions - Generation options
		 * @returns {Array} Generated data array
		 */
		generateTimeSeriesData: function (iCount, oOptions) {
			oOptions = oOptions || {};
			const dStartDate = oOptions.startDate || new Date(2020, 0, 1);
			const fBaseValue = oOptions.baseValue || 100;
			const fVariance = oOptions.variance || 20;
			const fTrend = oOptions.trend || 0;

			const aData = [];
			let fCurrentValue = fBaseValue;

			for (let i = 0; i < iCount; i++) {
				const dDate = new Date(dStartDate);
				dDate.setDate(dDate.getDate() + i);

				// Add trend
				fCurrentValue += fTrend;

				// Add random variance
				fCurrentValue += (Math.random() - 0.5) * fVariance;

				// Ensure value stays positive
				fCurrentValue = Math.max(0, fCurrentValue);

				aData.push([
					dDate.getTime(),
					parseFloat(fCurrentValue.toFixed(2))
				]);
			}

			return aData;
		},

		/**
		 * Generate multiple series data
		 * @param {number} iSeriesCount - Number of series
		 * @param {number} iPointsPerSeries - Points per series
		 * @returns {Array} Array of series data
		 */
		generateMultiSeriesData: function (iSeriesCount, iPointsPerSeries) {
			const aSeries = [];
			for (let i = 0; i < iSeriesCount; i++) {
				aSeries.push({
					name: "Series " + (i + 1),
					data: this.generateTimeSeriesData(iPointsPerSeries, {
						baseValue: 100 + i * 10,
						variance: 15 + i * 2,
						trend: 0.1 * (i % 2 === 0 ? 1 : -1)
					})
				});
			}
			return aSeries;
		},

		/**
		 * Generate data for different volume levels
		 * @returns {Object} Data for different volumes
		 */
		generateVolumeComparisonData: function () {
			return {
				"1K": this.generateTimeSeriesData(1000),
				"10K": this.generateTimeSeriesData(10000),
				"100K": this.generateTimeSeriesData(100000)
			};
		}
	});
});
