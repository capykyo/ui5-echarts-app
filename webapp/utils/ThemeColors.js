/**
 * SAP Horizon Theme Colors Utility
 * Provides color palette for ECharts to match SAP Horizon theme
 */
sap.ui.define([
	"sap/ui/core/theming/ThemeHelper"
], function (ThemeHelper) {
	"use strict";

	return {
		/**
		 * Get SAP Horizon theme colors
		 * @returns {Object} Color palette object
		 */
		getHorizonColors: function () {
			// SAP Horizon theme color palette
			// These colors are based on SAP Horizon design system
			const aColorPalette = [
				"#0070F2", // Primary Blue (Brand)
				"#D27700", // Accent Orange
				"#AA0808", // Accent Red
				"#BA066C", // Accent Pink
				"#5D36FF", // Accent Purple
				"#046C7A", // Accent Teal
				"#256F3A", // Accent Green
				"#E9730C", // Accent Orange 2
				"#0070F2", // Primary Blue (repeat for more series)
				"#8B1868"  // Accent Magenta
			];

			// Get current theme name
			const sTheme = sap.ui.getCore().getConfiguration().getTheme();
			const bIsDark = sTheme.indexOf("dark") !== -1 || sTheme.indexOf("evening") !== -1;

			// Text colors based on theme
			const sTextColor = bIsDark ? "#EAECEE" : "#1D2D3E";
			const sSecondaryTextColor = bIsDark ? "#8396A8" : "#6A6D70";
			const sBorderColor = bIsDark ? "#A9B4BE" : "#89919A";
			const sBackgroundColor = bIsDark ? "#1D232A" : "#FFFFFF";
			const sGridColor = bIsDark ? "#2C3D4F" : "#F5F6F7";

			return {
				color: aColorPalette,
				textStyle: {
					color: sTextColor,
					fontFamily: "72, 72full, Arial, Helvetica, sans-serif"
				},
				title: {
					textStyle: {
						color: sTextColor
					}
				},
				legend: {
					textStyle: {
						color: sTextColor
					},
					itemGap: 20
				},
				tooltip: {
					backgroundColor: sBackgroundColor,
					borderColor: sBorderColor,
					borderWidth: 1,
					textStyle: {
						color: sTextColor,
						fontSize: 12
					},
					axisPointer: {
						lineStyle: {
							color: sBorderColor,
							width: 1
						},
						crossStyle: {
							color: sBorderColor
						}
					}
				},
				grid: {
					borderColor: sGridColor
				},
				xAxis: {
					axisLine: {
						lineStyle: {
							color: sBorderColor
						}
					},
					axisTick: {
						lineStyle: {
							color: sBorderColor
						}
					},
					axisLabel: {
						color: sSecondaryTextColor
					},
					splitLine: {
						lineStyle: {
							color: sGridColor,
							type: "dashed"
						}
					}
				},
				yAxis: {
					axisLine: {
						lineStyle: {
							color: sBorderColor
						}
					},
					axisTick: {
						lineStyle: {
							color: sBorderColor
						}
					},
					axisLabel: {
						color: sSecondaryTextColor
					},
					splitLine: {
						lineStyle: {
							color: sGridColor,
							type: "dashed"
						}
					}
				},
				dataZoom: {
					textStyle: {
						color: sSecondaryTextColor
					},
					borderColor: sBorderColor,
					dataBackground: {
						areaStyle: {
							color: sGridColor
						}
					},
					selectedDataBackground: {
						areaStyle: {
							color: aColorPalette[0] + "40" // Primary color with opacity
						}
					},
					handleStyle: {
						color: sBackgroundColor,
						borderColor: sBorderColor
					}
				}
			};
		},

		/**
		 * Apply Horizon theme colors to ECharts option
		 * @param {Object} oOption - ECharts option object
		 * @returns {Object} Option object with theme colors applied
		 */
		applyThemeColors: function (oOption) {
			const oThemeColors = this.getHorizonColors();
			const oMergedOption = jQuery.extend(true, {}, oOption);

			// Apply color palette
			oMergedOption.color = oThemeColors.color;

			// Merge textStyle
			oMergedOption.textStyle = jQuery.extend(true, {}, oThemeColors.textStyle, oOption.textStyle || {});

			// Merge title
			if (oMergedOption.title) {
				oMergedOption.title.textStyle = jQuery.extend(true, {}, oThemeColors.title.textStyle, oMergedOption.title.textStyle || {});
			} else {
				oMergedOption.title = oThemeColors.title;
			}

			// Merge tooltip
			oMergedOption.tooltip = jQuery.extend(true, {}, oThemeColors.tooltip, oMergedOption.tooltip || {});
			if (oMergedOption.tooltip.textStyle) {
				oMergedOption.tooltip.textStyle = jQuery.extend(true, {}, oThemeColors.tooltip.textStyle, oMergedOption.tooltip.textStyle);
			}

			// Merge legend
			oMergedOption.legend = jQuery.extend(true, {}, oThemeColors.legend, oMergedOption.legend || {});
			if (oMergedOption.legend.textStyle) {
				oMergedOption.legend.textStyle = jQuery.extend(true, {}, oThemeColors.legend.textStyle, oMergedOption.legend.textStyle);
			}

			// Merge grid
			oMergedOption.grid = jQuery.extend(true, {}, oThemeColors.grid, oMergedOption.grid || {});

			// Merge xAxis
			if (Array.isArray(oMergedOption.xAxis)) {
				oMergedOption.xAxis = oMergedOption.xAxis.map(function (axis) {
					const oMergedAxis = jQuery.extend(true, {}, oThemeColors.xAxis, axis);
					if (axis.axisLine) {
						oMergedAxis.axisLine = jQuery.extend(true, {}, oThemeColors.xAxis.axisLine, axis.axisLine);
					}
					if (axis.axisLabel) {
						oMergedAxis.axisLabel = jQuery.extend(true, {}, oThemeColors.xAxis.axisLabel, axis.axisLabel);
					}
					return oMergedAxis;
				});
			} else {
				oMergedOption.xAxis = jQuery.extend(true, {}, oThemeColors.xAxis, oMergedOption.xAxis || {});
			}

			// Merge yAxis
			if (Array.isArray(oMergedOption.yAxis)) {
				oMergedOption.yAxis = oMergedOption.yAxis.map(function (axis) {
					const oMergedAxis = jQuery.extend(true, {}, oThemeColors.yAxis, axis);
					if (axis.axisLine) {
						oMergedAxis.axisLine = jQuery.extend(true, {}, oThemeColors.yAxis.axisLine, axis.axisLine);
					}
					if (axis.axisLabel) {
						oMergedAxis.axisLabel = jQuery.extend(true, {}, oThemeColors.yAxis.axisLabel, axis.axisLabel);
					}
					return oMergedAxis;
				});
			} else {
				oMergedOption.yAxis = jQuery.extend(true, {}, oThemeColors.yAxis, oMergedOption.yAxis || {});
			}

			// Merge dataZoom
			if (oMergedOption.dataZoom && Array.isArray(oMergedOption.dataZoom)) {
				oMergedOption.dataZoom = oMergedOption.dataZoom.map(function (zoom) {
					const oMergedZoom = jQuery.extend(true, {}, oThemeColors.dataZoom, zoom);
					if (zoom.textStyle) {
						oMergedZoom.textStyle = jQuery.extend(true, {}, oThemeColors.dataZoom.textStyle, zoom.textStyle);
					}
					return oMergedZoom;
				});
			} else if (!oMergedOption.dataZoom) {
				oMergedOption.dataZoom = oThemeColors.dataZoom;
			}

			return oMergedOption;
		}
	};
});
