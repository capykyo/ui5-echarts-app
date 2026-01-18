sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ui5/echarts/app/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("ui5.echarts.app.Component", {
		metadata: {
			manifest: "json",
			interfaces: [],
			publicMethods: [],
			properties: {},
			events: {}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// Call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// Set the device model
			this.setModel(models.createDeviceModel(), "device");

			// Create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
});
