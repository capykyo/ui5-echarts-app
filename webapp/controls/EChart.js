sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
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
			// Initialize the control
		},

		onAfterRendering: function () {
			if (!this._chart) {
				// Initialize ECharts instance
				const oDomRef = this.getDomRef();
				if (oDomRef) {
					// ECharts initialization will be handled here
				}
			}
		},

		setOption: function (oOption) {
			this.setProperty("option", oOption);
			if (this._chart) {
				this._chart.setOption(oOption);
			}
			return this;
		},

		exit: function () {
			if (this._chart) {
				this._chart.dispose();
				this._chart = null;
			}
		},

		renderer: function (oRM, oControl) {
			oRM.openStart("div", oControl);
			oRM.style("width", oControl.getWidth());
			oRM.style("height", oControl.getHeight());
			oRM.openEnd();
			oRM.close("div");
		}
	});
});
