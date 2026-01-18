# Quick Start: Using OData Mock Services

## Option 1: SAP Northwind (Easiest - No Setup)

### 1. Update manifest.json

Add OData model configuration:

```json
{
  "sap.ui5": {
    "models": {
      "": {
        "dataSource": "northwind",
        "type": "sap.ui.model.odata.v4.ODataModel",
        "settings": {
          "serviceUrl": "https://services.odata.org/V4/Northwind/Northwind.svc/",
          "odataVersion": "4.0"
        }
      }
    },
    "dataSources": {
      "northwind": {
        "uri": "https://services.odata.org/V4/Northwind/Northwind.svc/",
        "type": "OData",
        "settings": {
          "odataVersion": "4.0"
        }
      }
    }
  }
}
```

### 2. Load Data in Controller

```javascript
sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("ui5.echarts.app.controller.Main", {
    onInit: function () {
      const oModel = this.getView().getModel();
      
      // Load orders data (up to 10K records)
      oModel.read("/Orders", {
        urlParameters: {
          "$top": 10000,
          "$orderby": "OrderDate desc"
        },
        success: (oData) => {
          const aOrders = oData.results || oData.value || [];
          console.log(`Loaded ${aOrders.length} orders`);
          this._prepareChartData(aOrders);
        },
        error: (oError) => {
          console.error("Error loading data:", oError);
        }
      });
    },

    _prepareChartData: function (aOrders) {
      // Transform OData to ECharts format
      const aData = aOrders.map((oOrder, i) => [
        new Date(oOrder.OrderDate).getTime(),
        parseFloat(oOrder.Freight) || 0
      ]);

      const oChart = this.byId("echart");
      if (oChart) {
        oChart.setOption({
          xAxis: {
            type: 'time'
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: aData,
            type: 'line',
            large: true,
            largeThreshold: 2000
          }]
        });
      }
    }
  });
});
```

---

## Option 2: Local JSON Server (Best for Large Data)

### 1. Generate Mock Data

```bash
# Generate 100K records
node scripts/generate-mock-data.js 100000
```

### 2. Install and Start JSON Server

```bash
npm install -g json-server
json-server mock-data/mock-data.json --port 3000
```

### 3. Create OData Wrapper (Optional)

For true OData support, use a wrapper or convert JSON Server responses.

### 4. Use in Controller

```javascript
// Load from local JSON server
fetch('http://localhost:3000/Sales?_limit=10000')
  .then(response => response.json())
  .then(data => {
    // Transform and use data
    this._updateChart(data);
  });
```

---

## Option 3: SAP CAP Mock Server (Most Realistic)

### 1. Install CAP

```bash
npm install -g @sap/cds-dk
```

### 2. Initialize Project

```bash
cds init mock-service
cd mock-service
```

### 3. Create Service Definition

Create `srv/service.cds`:

```cds
service LargeDataService {
  entity Sales {
    key ID: Integer;
    Amount: Decimal;
    OrderDate: Date;
    ProductID: Integer;
    Region: String;
  };
}
```

### 4. Create Mock Data

Create `srv/data/sales.csv` with large dataset.

### 5. Start Server

```bash
cds watch
```

### 6. Use in UI5

Update manifest.json with local service URL:
```json
"serviceUrl": "http://localhost:4004/odata/v4/LargeDataService/"
```

---

## Testing Large Datasets

### Performance Test Script

Create `scripts/test-performance.js`:

```javascript
const fetch = require('node-fetch');

async function testPerformance(url, recordCount) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${url}?$top=${recordCount}`);
    const data = await response.json();
    const endTime = Date.now();
    
    console.log(`Records: ${recordCount.toLocaleString()}`);
    console.log(`Response time: ${endTime - startTime}ms`);
    console.log(`Data size: ${JSON.stringify(data).length} bytes`);
    console.log(`Records received: ${data.value?.length || data.length || 0}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Test different sizes
const sizes = [1000, 5000, 10000, 50000];
const baseUrl = 'https://services.odata.org/V4/Northwind/Northwind.svc/Orders';

sizes.forEach(size => {
  testPerformance(baseUrl, size);
});
```

---

## Recommended Services by Use Case

| Use Case | Recommended Service | Setup Time |
|----------|-------------------|------------|
| Quick testing (< 10K) | SAP Northwind | 0 minutes |
| Medium testing (10K-100K) | Local JSON Server | 5 minutes |
| Large testing (100K+) | SAP CAP Mock | 15 minutes |
| Production-like testing | SAP CAP with real data | 30+ minutes |

---

## Troubleshooting

### CORS Issues
- Use local mock server for development
- Configure proxy in ui5.yaml for remote services

### Rate Limiting
- Use local mock server for heavy testing
- Implement request throttling

### Data Format
- Ensure OData responses match expected format
- Transform data in controller if needed
