const { utils, writeFile } = require('xlsx');
const path = require('path');

const deliveries = [
  ['123 Marina Bay Street', '018953', 'John Lim', '6581234567', 'Ground floor'],
  ['456 East Coast Drive', '520098', 'Sarah Tan', '6581234568', 'Unit 12-05'],
  ['789 Tampines Street 71', '456318', 'Ahmad Hassan', '6581234569', 'Block 789'],
  ['321 Clementi Road', '678568', 'Lisa Wong', '6581234570', 'Office, 3rd floor'],
  ['654 Orchard Road', '238843', 'Rajesh Kumar', '6581234571', 'Near MRT'],
  ['246 Queens Road', '737570', 'Sophie Ng', '6581234572', 'Apt 04-12'],
  ['321 Bukit Merah Lane', '640084', 'David Chen', '6581234573', 'Shophouse'],
  ['987 Bedok Reservoir Road', '470234', 'Michelle Chua', '6581234574', 'Duplex'],
  ['654 Novena Plaza', '307623', 'Priya Nair', '6581234575', 'Shopping mall'],
  ['135 Joo Chiat Road', '427619', 'Tony Goh', '6581234576', 'Restaurant'],
  ['579 Geylang Serai', '402000', 'Fatimah Ali', '6581234577', 'Market'],
  ['802 Hougang Avenue', '530802', 'Peter Tan', '6581234578', 'Industrial area'],
  ['145 Ang Mo Kio Drive', '565050', 'Grace Lee', '6581234579', 'Community centre'],
  ['368 Bukit Batok Street', '650368', 'Kumar Raj', '6581234580', 'Residential'],
  ['987 Changi Drive', '498765', 'Benny Lee', '6581234581', 'Airport area'],
];

const rows = [
  ['Address', 'Postal Code', 'Customer Name', 'Contact Number', 'Notes'],
  ...deliveries,
];

const sheet = utils.aoa_to_sheet(rows);
const book = utils.book_new();
utils.book_append_sheet(book, sheet, 'Deliveries');

const outputPath = path.resolve(__dirname, '..', 'sample-deliveries.xlsx');
writeFile(book, outputPath);

console.log(`Wrote ${deliveries.length} deliveries to ${outputPath}`);
