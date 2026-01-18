# Free OData Mock Services for Large Dataset Testing

This document lists free OData mock services that can be used to test large dataset performance in UI5 ECharts applications.

## 1. SAP Northwind OData Service (Recommended)

### Service URL
- **Base URL**: `https://services.odata.org/V4/Northwind/Northwind.svc/`
- **Metadata**: `https://services.odata.org/V4/Northwind/Northwind.svc/$metadata`
- **Documentation**: https://www.odata.org/odata-services/

### Features
- ✅ Free and public
- ✅ Standard OData V4 protocol
- ✅ Multiple entity sets (Orders, Products, Customers, etc.)
- ✅ Supports $filter, $orderby, $top, $skip
- ✅ Good for testing pagination and filtering

### Example Endpoints
```
# Get all orders (with pagination)
https://services.odata.org/V4/Northwind/Northwind.svc/Orders?$top=1000

# Get orders with filters
https://services.odata.org/V4/Northwind/Northwind.svc/Orders?$filter=OrderDate gt 1996-01-01&$top=5000

# Get order details (expand)
https://services.odata.org/V4/Northwind/Northwind.svc/Orders?$expand=Order_Details&$top=100
```

### Limitations
- ⚠️ Limited dataset size (thousands of records)
- ⚠️ Not suitable for testing millions of records
- ⚠️ Rate limiting may apply

---

## 2. TripPin OData Service

### Service URL
- **Base URL**: `https://services.odata.org/TripPinRESTierService/(S(1))/`
- **Metadata**: `https://services.odata.org/TripPinRESTierService/(S(1))/$metadata`
- **Documentation**: https://www.odata.org/odata-services/

### Features
- ✅ Free and public
- ✅ OData V4 REST API
- ✅ Travel and people data
- ✅ Supports CRUD operations
- ✅ Good for testing different data types

### Example Endpoints
```
# Get all people
https://services.odata.org/TripPinRESTierService/(S(1))/People

# Get airports
https://services.odata.org/TripPinRESTierService/(S(1))/Airports

# Get trips with filters
https://services.odata.org/TripPinRESTierService/(S(1))/Trips?$top=1000
```

### Limitations
- ⚠️ Small dataset
- ⚠️ Not suitable for large-scale performance testing

---

## 3. JSON Server (Self-hosted Solution)

### Setup
```bash
npm install -g json-server
```

### Create Large Dataset
Create a `db.json` file with large dataset:

```json
{
  "sales": [
    // Generate 100,000+ records programmatically
  ],
  "products": [
    // Generate product data
  ]
}
```

### Start Server
```bash
json-server --watch db.json --port 3000
```

### Convert to OData
Use `json-server-odata` middleware or create custom OData wrapper.

### Advantages
- ✅ Full control over data size
- ✅ Can generate millions of records
- ✅ Local hosting
- ✅ Customizable response times

### Limitations
- ⚠️ Requires setup
- ⚠️ Not true OData (needs wrapper)
- ⚠️ Limited OData features

---

## 4. MockAPI.io (Free Tier)

### Service URL
- **Base URL**: `https://YOUR_PROJECT_ID.mockapi.io/api/v1/`
- **Website**: https://mockapi.io/

### Features
- ✅ Free tier available
- ✅ RESTful API (can be adapted for OData)
- ✅ Can create large datasets
- ✅ Supports pagination
- ✅ Custom endpoints

### Limitations
- ⚠️ Not native OData
- ⚠️ Free tier has limits
- ⚠️ Requires account setup

---

## 5. Local OData Mock Server (Recommended for Large Data)

### Using OData Mock Server Tools

#### Option A: SAP CAP (Cloud Application Programming)
```bash
npm install -g @sap/cds-dk
cds init my-mock-service
# Create service definition with large dataset
cds serve
```

#### Option B: OData Mock Server (npm package)
```bash
npm install odata-mock-server
```

Create `mock-server.js`:
```javascript
const ODataMockServer = require('odata-mock-server');

const server = new ODataMockServer({
  port: 3000,
  service: {
    name: 'LargeDataService',
    entities: {
      'Sales': {
        generate: (count) => {
          // Generate large dataset
          return Array.from({ length: count }, (_, i) => ({
            id: i,
            amount: Math.random() * 10000,
            date: new Date(2020, 0, 1 + i),
            product: `Product ${i % 100}`
          }));
        },
        count: 100000 // 100K records
      }
    }
  }
});

server.start();
```

---

## 6. SAP Gateway Demo System (If Available)

### Service URL
- **Base URL**: `https://sapes5.sapdevcenter.com/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/`
- **Status**: May require registration

### Features
- ✅ True SAP OData service
- ✅ Standard SAP data model
- ✅ Good for SAP-specific testing

### Limitations
- ⚠️ Availability may vary
- ⚠️ May require registration
- ⚠️ Limited dataset size

---

## Recommended Approach for Large Dataset Testing

### For Testing 10K - 100K Records
1. Use **SAP Northwind** for quick testing
2. Use **JSON Server** with generated data for custom scenarios

### For Testing 100K+ Records
1. Set up **local OData mock server** with generated data
2. Use **SAP CAP** for realistic OData behavior
3. Generate data programmatically to control size

### Data Generation Script Example

Create `scripts/generate-mock-data.js`:
```javascript
const fs = require('fs');

function generateSalesData(count) {
  const data = [];
  const startDate = new Date(2020, 0, 1);
  
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      amount: Math.floor(Math.random() * 100000),
      date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
      productId: Math.floor(Math.random() * 1000),
      region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
      salesRep: `Rep${Math.floor(Math.random() * 50)}`
    });
  }
  
  return data;
}

const largeDataset = {
  Sales: generateSalesData(100000), // 100K records
  Products: generateProductsData(1000)
};

fs.writeFileSync('mock-data.json', JSON.stringify(largeDataset, null, 2));
console.log('Generated mock data with 100K sales records');
```

---

## Integration with UI5 Application

### Update manifest.json

```json
{
  "sap.ui5": {
    "models": {
      "": {
        "dataSource": "mainService",
        "type": "sap.ui.model.odata.v4.ODataModel",
        "settings": {
          "serviceUrl": "https://services.odata.org/V4/Northwind/Northwind.svc/",
          "odataVersion": "4.0"
        }
      }
    },
    "dataSources": {
      "mainService": {
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

### Usage in Controller

```javascript
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/odata/v4/ODataModel"
], function (Controller, ODataModel) {
  "use strict";

  return Controller.extend("ui5.echarts.app.controller.Main", {
    onInit: function () {
      const oModel = this.getView().getModel();
      
      // Load large dataset with pagination
      oModel.read("/Orders", {
        urlParameters: {
          "$top": 10000,
          "$orderby": "OrderDate desc"
        },
        success: (oData) => {
          // Process data for ECharts
          this._updateChart(oData.results);
        },
        error: (oError) => {
          console.error("Error loading data:", oError);
        }
      });
    }
  });
});
```

---

## Performance Testing Tips

1. **Start Small**: Test with 1K records first
2. **Gradually Increase**: Test with 10K, 50K, 100K, 1M records
3. **Monitor Performance**: Use Chrome DevTools Performance tab
4. **Test Pagination**: Use $top and $skip for large datasets
5. **Test Filtering**: Use $filter to reduce dataset size
6. **Test Server Response**: Monitor network tab for response times

---

## Quick Start: Using SAP Northwind

1. Update `manifest.json` with Northwind service URL
2. Load data in controller:
```javascript
const oModel = this.getView().getModel();
oModel.read("/Orders", {
  urlParameters: { "$top": 5000 },
  success: (oData) => {
    // Use oData.results for chart
  }
});
```

---

## References

- [OData.org Services](https://www.odata.org/odata-services/)
- [SAP Northwind Service](https://services.odata.org/V4/Northwind/Northwind.svc/)
- [JSON Server](https://github.com/typicode/json-server)
- [SAP CAP Documentation](https://cap.cloud.sap/docs/)
