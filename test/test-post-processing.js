var postProcessing = require('./../src/post-processing.js');
var test = require('tap').test;

test('simple execution', function (t) {

  var maps =[
    [1, 3, 20],
    [2, 2, 30],
    [3, 1, 40],
    [4, 4, 50]
  ];

  for(var i = 0; i < maps.length; i++) {
    postProcessing.addMap(maps[i]);
  }

  var finalMaps = postProcessing.process();

  t.equal(finalMaps.avg[0], 2.5, 'average 1');
  t.equal(finalMaps.avg[2], 35, 'average 2');
  t.equal(finalMaps.ldev[0], 1.4382216156372367, 'ldev');
  t.equal(finalMaps.udev[2], 45.617783843627635, 'udev');

  t.end();
});
