# Troubleshooting Guide

## Resource Loading Issues

### Problem: 404 Errors for UI5 Framework Resources

**Symptoms:**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Refused to apply style from '.../library.css' because its MIME type ('text/html') is not a supported stylesheet MIME type
```

**Cause:**
The UI5 framework resources are not being served correctly. This happens when:
- Using relative paths (`/resources/...`) but UI5 CLI is not configured to serve framework resources locally
- The framework resources are not available at the expected path

**Solution:**
Use CDN for UI5 framework resources in `index.html`:

```html
<script
  id="sap-ui-bootstrap"
  src="https://openui5.hana.ondemand.com/resources/sap-ui-core.js"
  data-sap-ui-theme="sap_horizon"
  data-sap-ui-resourceroots='{"ui5.echarts.app": "./"}'
  data-sap-ui-compatVersion="edge"
  data-sap-ui-async="true"
  data-sap-ui-frameworkVersion="1.143.1">
</script>
```

### Alternative: Use Local Framework Resources

If you prefer to use local framework resources:

1. **Install UI5 framework locally:**
```bash
npm install @openui5/sap.ui.core @openui5/sap.m @openui5/sap.ui.layout --save-dev
```

2. **Update ui5.yaml to serve framework resources:**
```yaml
framework:
  name: OpenUI5
  version: 1.143.1
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: sap.ui.layout
```

3. **Use relative path in index.html:**
```html
<script
  id="sap-ui-bootstrap"
  src="/resources/sap-ui-core.js"
  ...>
</script>
```

**Note:** CDN approach is recommended for development as it's simpler and doesn't require downloading framework files.

---

## Module Loading Errors

### Problem: Failed to load 'sap/ui/base/Log.js'

**Symptoms:**
```
ModuleError: Failed to resolve dependencies of 'ui5/echarts/app/controller/Main.controller.js'
 -> 'sap/ui/base/Log.js': failed to load
```

**Cause:**
- UI5 framework resources are not loaded correctly
- Using wrong import path

**Solution:**
1. Ensure UI5 framework is loaded (see Resource Loading Issues above)
2. Verify the import statement:
```javascript
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/base/Log"  // Correct path
], function (Controller, Log) {
  // ...
});
```

---

## ECharts Loading Issues

### Problem: ECharts library not found

**Symptoms:**
```
ReferenceError: echarts is not defined
```

**Solution:**
The EChart control automatically loads ECharts from CDN. If you prefer to use npm package:

1. **Install ECharts:**
```bash
npm install echarts
```

2. **Update EChart.js to use require:**
```javascript
_loadEChartsLibrary: function () {
  if (typeof require !== "undefined") {
    return new Promise((resolve) => {
      require(["echarts"], (echarts) => {
        window.echarts = echarts;
        resolve();
      });
    });
  }
  // Fallback to CDN...
}
```

---

## OData Model Issues

### Problem: OData model not available

**Symptoms:**
```
OData model not available
Error loading Northwind data
```

**Solution:**
1. Check `manifest.json` configuration:
```json
{
  "sap.ui5": {
    "models": {
      "": {
        "dataSource": "northwind",
        "type": "sap.ui.model.odata.v4.ODataModel"
      }
    }
  }
}
```

2. Verify service URL is accessible:
```bash
curl "https://services.odata.org/V4/Northwind/Northwind.svc/Orders?\$top=1"
```

3. Check browser console for CORS errors

---

## Performance Issues

### Problem: Slow rendering with large datasets

**Symptoms:**
- Chart takes long time to render
- Browser becomes unresponsive
- High memory usage

**Solution:**
1. Enable performance optimizations in chart option:
```javascript
{
  large: true,
  largeThreshold: 2000,
  animation: false,  // For datasets > 2000
  progressive: 1000,
  progressiveThreshold: 3000
}
```

2. Implement data sampling for very large datasets (> 10K points)

3. Use pagination when loading from OData:
```javascript
urlParameters: {
  "$top": 10000,  // Limit results
  "$skip": 0
}
```

---

## Build Issues

### Problem: Build fails or produces errors

**Solution:**
1. Clean build directory:
```bash
npm run build -- --clean-dest
```

2. Check for syntax errors:
```bash
npm run lint
```

3. Verify ui5.yaml configuration

---

## Common Fixes Checklist

- [ ] UI5 framework resources loaded (CDN or local)
- [ ] ECharts library loaded
- [ ] OData model configured in manifest.json
- [ ] Service URL is accessible
- [ ] No CORS issues
- [ ] Browser console shows no errors
- [ ] All dependencies installed (`npm install`)

---

## Getting Help

1. Check browser console for detailed error messages
2. Verify network tab for failed requests
3. Check UI5 documentation: https://sapui5.hana.ondemand.com/
4. Review project logs and error messages
