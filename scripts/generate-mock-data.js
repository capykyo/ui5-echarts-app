#!/usr/bin/env node

/**
 * Script to generate large mock datasets for OData testing
 * Usage: node scripts/generate-mock-data.js [count]
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_COUNT = 10000;
const count = parseInt(process.argv[2]) || DEFAULT_COUNT;

console.log(`Generating ${count.toLocaleString()} records...`);

/**
 * Generate sales data
 */
function generateSalesData(recordCount) {
  const data = [];
  const startDate = new Date(2020, 0, 1);
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const products = Array.from({ length: 100 }, (_, i) => `Product-${String(i + 1).padStart(3, '0')}`);
  
  for (let i = 0; i < recordCount; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const amount = Math.floor(Math.random() * 100000) + 1000;
    const quantity = Math.floor(Math.random() * 100) + 1;
    
    data.push({
      ID: i + 1,
      Amount: amount,
      Quantity: quantity,
      OrderDate: date.toISOString().split('T')[0],
      ProductID: Math.floor(Math.random() * 100) + 1,
      ProductName: products[Math.floor(Math.random() * products.length)],
      Region: regions[Math.floor(Math.random() * regions.length)],
      SalesRep: `Rep-${String(Math.floor(Math.random() * 50) + 1).padStart(2, '0')}`,
      CustomerID: Math.floor(Math.random() * 500) + 1,
      CustomerName: `Customer-${String(Math.floor(Math.random() * 500) + 1).padStart(3, '0')}`
    });
  }
  
  return data;
}

/**
 * Generate time series data for chart testing
 */
function generateTimeSeriesData(recordCount) {
  const data = [];
  const startDate = new Date(2020, 0, 1);
  const baseValue = 1000;
  
  for (let i = 0; i < recordCount; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    // Add some trend and noise
    const trend = i * 0.5;
    const noise = (Math.random() - 0.5) * 200;
    const value = Math.max(0, Math.floor(baseValue + trend + noise));
    
    data.push({
      ID: i + 1,
      Date: date.toISOString().split('T')[0],
      DateTime: date.toISOString(),
      Value: value,
      Category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    });
  }
  
  return data;
}

/**
 * Generate product data
 */
function generateProductData(count = 100) {
  const data = [];
  const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Toys'];
  
  for (let i = 0; i < count; i++) {
    data.push({
      ID: i + 1,
      Name: `Product ${String(i + 1).padStart(3, '0')}`,
      Category: categories[Math.floor(Math.random() * categories.length)],
      Price: Math.floor(Math.random() * 1000) + 10,
      Stock: Math.floor(Math.random() * 1000),
      Supplier: `Supplier-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`
    });
  }
  
  return data;
}

// Generate datasets
const datasets = {
  Sales: generateSalesData(count),
  TimeSeries: generateTimeSeriesData(count),
  Products: generateProductData(100)
};

// Create output directory
const outputDir = path.join(__dirname, '..', 'mock-data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write JSON file
const jsonPath = path.join(outputDir, 'mock-data.json');
fs.writeFileSync(jsonPath, JSON.stringify(datasets, null, 2));
console.log(`✓ Generated JSON file: ${jsonPath}`);
console.log(`  - Sales: ${datasets.Sales.length.toLocaleString()} records`);
console.log(`  - TimeSeries: ${datasets.TimeSeries.length.toLocaleString()} records`);
console.log(`  - Products: ${datasets.Products.length.toLocaleString()} records`);

// Write individual files for easier access
Object.keys(datasets).forEach(key => {
  const filePath = path.join(outputDir, `${key.toLowerCase()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(datasets[key], null, 2));
  console.log(`✓ Generated ${key} file: ${filePath}`);
});

// Generate OData service metadata structure
const metadata = {
  "@odata.context": "$metadata#Sales",
  value: datasets.Sales
};

const odataPath = path.join(outputDir, 'odata-sales.json');
fs.writeFileSync(odataPath, JSON.stringify(metadata, null, 2));
console.log(`✓ Generated OData format file: ${odataPath}`);

console.log('\n✅ Mock data generation completed!');
console.log(`\nTo use with JSON Server:`);
console.log(`  npm install -g json-server`);
console.log(`  json-server ${jsonPath} --port 3000`);
console.log(`\nThen access: http://localhost:3000/Sales`);
