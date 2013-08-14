var embers = require('./../index');

var ignitionPt = [ 41 + 46.0 / 60 + 41.88 /3600, - (8 +  9.0 / 60 + 4.39/3600)];

var U = 1;
var alpha= 135;

embers(ignitionPt, U, alpha, function(data){
  console.log(data);
});





