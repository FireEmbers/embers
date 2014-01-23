var embers = require('./post-processing.js');

var maps =[
    [1, 3, 20],
    [2, 2, 30],
    [3, 1, 40],
    [4, 4, 50]
];

for(var i = 0; i < maps.length; i++) {
  embers.addMap(maps[i]);
}

console.log(embers);
var finalMaps = embers.process();
console.log(finalMaps);
