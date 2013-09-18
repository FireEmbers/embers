var engine = require('embersengine');
var getGisMap = require('gisClient');
var cconv = require('cconv');
var ignToKml = require('ignMapToKml');
var readFile = require('utils').readFile;
var createDataUnit = require('utils').createDataUnits;
var programovo = require('programovo');
var stats = require("stats-lite")

module.exports = function(ignitionPt, U, std, alpha, callback){

  var rows = 50;
  var cols = 50;

  var height = 2000;
  var width = 2000;

  var moisture = 5;//percentage 

  var runs = 10;

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
  var ignMaps = new Array(runs);

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

      loadEngine();
    }
  }

  function loadEngine(){

    readFile('program.min.js', onEngineLoad);

    function onEngineLoad(){

      programString = RunString(); 

      function RunString(){

        function Run(dataUnit){

          var engine = req('/home/fsousa/src/crp/embers/engine/src/program.js');

          return engine(dataUnit, rows, cols, aspectMap, slopeMap, clcMap, height, width);

        }

        var
         string = Run.toString() + ';' + programString +
        'var rows =' + rows.toString() + ';' +
        'var cols =' + cols.toString() + ';' +
        'var height =' + height.toString() + ';' +
        'var width =' + width.toString() + ';' +
        'var slopeMap =' + JSON.stringify(slopeArray) + ';' +
        'var aspectMap =' + JSON.stringify(aspectArray) + ';' +
        'var clcMap =' + JSON.stringify(clcArray) + ';';

        return string;
      }

      getThingsDone(programString);

    }
  }

  function getThingsDone(programString){


    //dataUnits array has 3 sub arrays, each for a different cenario of wind speed
    //Each data Unit is [% moisture, Wind Speed in m/s, wind direction degrees clockwise from north]

    //done in sync
    var DataArray = createDataUnit( runs, moisture, U, alpha);

    sendStuffToCP(dataUnits, programString);
  }

  i = 0;
  function sendStuffToCP(dataArray, programString){

    programovo(userName, pass, programString, dataArray, handleResults, onEnd);

    function handleResults(res){

      ignMaps[i++] = res;
    }

    function onEnd(){
      postProcessMaps();
    }

  }

  function postProcessMaps(){

    //Compute Average map
    var outputMaps = {
      'mean': new Array(ignMaps.lengths),
      'upperStd': new Array(ignMaps.lengths),
      'lowerStd': new Array(ignMaps.lengths),
      'clc': clcMap
    }

    //sample Array is a temporary array which stores the values at each (col,row) of the 
    //several Monte Calo maps from ignMaps
    var sampleArray = new Array(ignMaps.length);

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {

        for (var i = 0; i < ignMaps.length; i++)
          sampleArray[i] = ignMaps[i][col + cols*row];

        var mean = stats.mean(sampleArray);
        var std = stats.stdev(sampleArray);

        outputMaps['mean'] = mean;
        outputMaps['upperStd'] = mean + upperStd;
        outputMaps['lowerStd'] = mean + lowerStd;

      }
    }

    var tf = 120;

    ignToKml(outputMaps['upperStd'] , 'upperStd.kml', tf, ignitionPt, rows, cols, height, width);
    ignToKml(outputMaps['lowerStd'] , 'lowerStd.kml', tf, ignitionPt, rows, cols, height, width);
    ignToKml(outputMaps['mean'] , 'mean.kml', tf, ignitionPt, rows, cols, height, width);

    callback(maps);
  }



}
