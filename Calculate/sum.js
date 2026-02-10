console.log("sum module is excuted");
var x = "Hello World";
function CalculateSum(a,b){
    const sum =a+b;
    console.log("sum is " + sum);
}
function substact(a,b){
    const sub =a-b;
    console.log("substraction is " + sub);
}

module.exports ={ CalculateSum,substact};