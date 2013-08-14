module.exports = function(ignitionPt, U, alpha, callback){

  var engine = require('embersengine');
  var getGisMap = require('gisClient');
  var cconv = require('cconv');

  var rows = 10;
  var cols = 10;

  var length = 4000;
  var width = 4000;

  //compute boundaries in ETRS89 LAEA (srid 3035)
  //to pass to the postgis client 
  var boundaries = computeBoundaries(ignitionPt, rows, cols, length,  width);
  function computeBoundaries(cA, rows, cols, length, width){

    var sridA = 4258;
    var sridB = 3035;

    var f = true;

    cB = cconv(sridA, sridB, cA, f);

    var W = cB[0] - length/2;
    var E = cB[0] + length/2;
    var N = cB[1] + width/2;
    var S = cB[1] - width/2;

    var boundaries = {
      north: N,
      south: S,
      east: E,
      west: W,
      r: rows,
      c: cols
    };

    return boundaries;
  }

  var clcMap;
  var aspectMap;
  var slopeMap;
  getClcMap();
  function getClcMap(){

    getGisMap(boundaries, 'postgis', onClcMap);

    function onClcMap(map){

      clcMap = JSON.parse(map);

      getTerrainMap();
    }
  }

  function getTerrainMap(){
    getGisMap(boundaries, 'grass',onTerrainMap);

    function onTerrainMap(terrainMaps){

      terrainMaps = JSON.parse(terrainMaps);

      aspectMap = terrainMaps["aspect"];
      slopeMap = terrainMaps["slope"];

    }
  }


  // var clcMaps;
  // postgisClient

  // var var

  // aspect dataUnit 
  // function Run()

}
