var engine = require('embersengine');
var getGisMap = require('gisClient');
var cconv = require('cconv');
var ignToKml = require('ignMapToKml');

module.exports = function(ignitionPt, U, std, alpha, callback){

  var rows = 50;
  var cols = 50;

  var height = 2000;
  var width = 2000;

  var moisture = 5; //percentage 

  //compute boundaries in ETRS89 LAEA (srid 3035)
  //to pass to the postgis client 
  var boundaries = computeBoundaries(ignitionPt, rows, cols, height, width);
  function computeBoundaries(cA, rows, cols, height, width){

    var sridA = 4258;
    var sridB = 3035;

    var f = true;

    cB = cconv(sridA, sridB, cA, f);

    var W = cB[0] - width/2;
    var E = cB[0] + width/2;
    var N = cB[1] + height/2;
    var S = cB[1] - height/2;

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
  var ignMaps = new Array(3);

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

      computeIgnMaps();

    }
  }

  function computeIgnMaps(){


    //dataUnits array has 3 sub arrays, each for a different cenario of wind speed
    //Each data Unit is [% moisture, Wind Speed in m/s, wind direction degrees clockwise from north]

    Uavg = U;
    Umax = U*(1+std/100);
    Umin = (U*(1-std/100) >= 0) ? U*(1-std/100): 0;
    var dataUnits = [
      [moisture, Uavg, alpha], //Average speed
      [moisture, Umin, alpha], //Min speed
      [moisture, Umax, alpha]  //Max speed
    ];

    //This is done in sync
    for (n = 0; n < dataUnits.length; n++){
      ignMaps[n] = JSON.parse(Run(dataUnits[n]));
    }

    function Run(dataUnit){

      return engine(dataUnit, rows, cols, aspectMap, slopeMap, clcMap, height, width);
    }

    postProcessMaps();
  }

  function postProcessMaps(){
    var maps = {
      'averageCase': ignMaps[0],
      'bestCase': ignMaps[1], 
      'worstCase': ignMaps[2],
      'clc': clcMap
    }

    var tf = 120;

    var worstCase = ignToKml(maps['worstCase'], tf, ignitionPt, rows, cols, height, width);
    var bestCase = ignToKml(maps['bestCase'] , tf, ignitionPt, rows, cols, height, width);    
    var averageCase = ignToKml(maps['averageCase'] , tf, ignitionPt, rows, cols, height, width);

    var kmlMaps = {
      'worstCase': worstCase['kml'],
      'bestCase': bestCase['kml'],
      'averageCase': averageCase['kml']
    };

    var pathArrays = {
      'worstCase': worstCase['path'],
      'bestCase': bestCase['path'],
      'averageCase': averageCase['path']
    }

    callback(kmlMaps, pathArrays);
  }



}