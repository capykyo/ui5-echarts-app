# SAP Northwind OData Service Configuration

## Overview
This document describes the configuration of SAP Northwind OData Service for the UI5 ECharts application.

## Service Details

### Service URL
- **Base URL**: `https://services.odata.org/V4/Northwind/Northwind.svc/`
- **Metadata**: `https://services.odata.org/V4/Northwind/Northwind.svc/$metadata`
- **Protocol**: OData V4
- **Documentation**: https://www.odata.org/odata-services/

## Configuration

### 1. manifest.json
The OData model is configured in `webapp/manifest.json`:

```json
{
  "sap.ui5": {
    "models": {
      "": {
        "dataSource": "northwind",
        "type": "sap.ui.model.odata.v4.ODataModel",
        "settings": {
          "serviceUrl": "https://services.odata.org/V4/Northwind/Northwind.svc/",
          "odataVersion": "4.0",
          "autoExpandSelect": true,
          "earlyRequests": true
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

### 2. Controller Implementation
The controller loads data from Northwind service in `onInit()`:

```javascript
const oModel = this.getView().getModel();
oModel.read("/Orders", {
  urlParameters: {
    "$top": 10000,
    "$orderby": "OrderDate desc",
    "$select": "OrderID,OrderDate,Freight,ShipCity,ShipCountry"
  },
  success: (oData) => {
    // Process data for chart
  }
});
```

## Available Entity Sets

### Orders
- **Path**: `/Orders`**
- **Description**: Order information
- **Key Fields**: OrderID
- **Useful Fields**: OrderDate, Freight, ShipCity, ShipCountry

### Other Entities
- `/Products` - Product catalog
- `/Customers` - Customer information
- `/Employees` - Employee data
- `/Order_Details` - Order line items
- `/Categories` - Product categories
- `/Suppliers` - Supplier information

## Usage Examples

### Load Orders with Pagination
```javascript
oModel.read("/Orders", {
  urlParameters: {
    "$top": 1000,
    "$skip": 0,
    "$orderby": "OrderDate desc"
  }
});
```

### Load Orders with Filters
```javascript
oModel.read("/Orders", {
  urlParameters: {
    "$filter": "OrderDate gt 1996-01-01 and Freight gt 100",
    "$top": 5000
  }
});
```

### Load Orders with Expand
```javascript
oModel.read("/Orders", {
  urlParameters: {
    "$expand": "Order_Details",
    "$top": 100
  }
});
```

### Load Products
```javascript
oModel.read("/Products", {
  urlParameters: {
    "$top": 1000,
    "$select": "ProductID,ProductName,UnitPrice,UnitsInStock"
  }
});
```

## Data Transformation

The controller transforms OData responses to ECharts format:

```javascript
// Transform to time series
const aTimeSeriesData = aOrders
  .filter(oOrder => oOrder.OrderDate)
  .map(oOrder => {
    const oDate = new Date(oOrder.OrderDate);
    return [
      oDate.getTime(),        // X-axis: timestamp
      parseFloat(oOrder.Freight) || 0  // Y-axis: value
    ];
  });
```

## Performance Considerations

### Large Dataset Handling
- Use `$top` to limit results (max 10,000 recommended)
- Use `$filter` to reduce dataset size
- Use `$select` to fetch only needed fields
- Implement pagination for very large datasets

### Chart Performance
- Enable `large: true` for datasets > 2000 points
- Disable animation for large datasets
- Use progressive rendering for > 3000 points
- Implement data sampling for > 10,000 points

## Testing

### Test Service Availability
```bash
curl "https://services.odata.org/V4/Northwind/Northwind.svc/Orders?\$top=10"
```

### Test in Browser Console
```javascript
// After app loads
const oModel = sap.ui.getCore().getModel();
oModel.read("/Orders", {
  urlParameters: { "$top": 10 },
  success: (oData) => console.log(oData)
});
```

## Troubleshooting

### CORS Issues
- Northwind service supports CORS
- No additional configuration needed

### Rate Limiting
- Service may have rate limits
- Use local mock server for heavy testing

### Data Format
- Ensure OData V4 format is used
- Check response structure: `{ results: [...] }` or `{ value: [...] }`

## Next Steps

1. **Start the application**: `npm start`
2. **Open browser**: Navigate to `http://localhost:8080`
3. **Check console**: Verify data loading in browser console
4. **View chart**: Chart should display Northwind orders data

## References

- [OData.org Services](https://www.odata.org/odata-services/)
- [SAP UI5 OData V4 Model](https://sapui5.hana.ondemand.com/#/api/sap.ui.model.odata.v4.ODataModel)
- [Northwind Service Documentation](https://services.odata.org/V4/Northwind/Northwind.svc/)
