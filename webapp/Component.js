sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ui5/echarts/app/model/models",
	"ui5/echarts/app/model/ChartData"
], function (UIComponent, Device, models, ChartData) {
	"use strict";

	return UIComponent.extend("ui5.echarts.app.Component", {
		metadata: {
			manifest: "json",
			interfaces: [],
			publicMethods: [],
			properties: {},
			events: {}
		},

		init: function () {
			// Call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// Restore persisted data-source preference as early as possible
			var bUseMock = localStorage.getItem("ui5.echarts.useMockData") === "true";
			ChartData.setUseMockData(bUseMock);

			// Set the device model
			this.setModel(models.createDeviceModel(), "device");

			// Create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
});
