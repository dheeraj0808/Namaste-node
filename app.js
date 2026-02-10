require("./xyz.js");
const { CalculateSum, substact, Multiply } = require("./Calculate/index.js");
var a = 20;
var b = 10;
CalculateSum(a, b);
substact(a, b);
Multiply(a, b);
// we can also use the functions from the Calculate module in the xyz.js file
// because we have imported the Calculate module in the xyz.js file
// we can also use the functions from the Calculate module in this file
// because we have imported the Calculate module in this file