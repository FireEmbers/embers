var engine = require('embersengine');
var getGisMap = require('gisClient');
var cconv = require('cconv');
var ignToKml = require('ignMapToKml');
var fs = require('fs');
var join = require('path').join;
var DataUnitStream = require('./src/dataUnitStream');
var postProcessing = require('./src/post-processing.js');
var CrowdProcess = require('crowdprocess');

var programString = fs.readFileSync(join(__dirname, 'src', 'program.min.js'));

module.exports = function(opts, credentials, callback){

  var crowdprocess = CrowdProcess(credentials);

  var ignitionPt = opts.ignitionPt;
  var u = opts.u;
  var std = opts.std;
  var moisture = opts.moisture;
  var alpha = opts.alpha;
  var rows = opts.rows;
  var cols = opts.cols;
  var height = opts.height;
  var width = opts.width;
  var n = opts.n;

  console.log('Embers start...');

  console.log('Resolution: %dx%d',rows,cols, 'Size:', height,'[km]');

  //var moisture = 5; //percentage 

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

  getClcMap();
  function getClcMap(){

    getGisMap(boundaries, 'postgis', onClcMap);

    function onClcMap(err, map){

      if (err) return callback(err, null);

      console.log('Got clc maps...');

      clcMap = JSON.parse(map);

      getTerrainMap();
    }
  }

  function getTerrainMap(){
    getGisMap(boundaries, 'grass',onTerrainMap);

    function onTerrainMap(err, terrainMaps){

      if (err) return callback(err, null);

      console.log('Got terrain maps...');

      terrainMaps = JSON.parse(terrainMaps);

      aspectMap = terrainMaps["aspect"];
      slopeMap = terrainMaps["slope"];

      computeIgnMaps();

    }
  }

  function computeIgnMaps(){

    //Build Run function string from browserify code
    var RunString = getProgram();
    var job = crowdprocess({
      program: RunString,
      onResults: postProcessMaps,
      mock:false
    });

    function getProgram(){

      function Run(dataUnit){

        //never mind the path inside the req(), is just a reference for the 
        //browserified module in program.js
        var engine = req('/home/fsousa/src/crp/embers/engine/src/program.js');

        return engine(dataUnit, rows, cols, aspectMap, slopeMap, clcMap, height, width);

      }

      var
       string = Run.toString() + ';' + programString +
      'var rows =' + rows.toString() + ';' +
      'var cols =' + cols.toString() + ';' +
      'var height =' + height.toString() + ';' +
      'var width =' + width.toString() + ';' +
      'var slopeMap =' + JSON.stringify(slopeMap) + ';' +
      'var aspectMap =' + JSON.stringify(aspectMap) + ';' +
      'var clcMap =' + JSON.stringify(clcMap) + ';';

      return string;
    }

    //create data unit stream
    //console.log(moisture, u, alpha, std);
    var dataStream = DataUnitStream(moisture, u, alpha, std, n);
    console.log('Running simulations...');

    dataStream.pipe(job);

    //dataStream.on('data', function (data) {console.log(data)});

    var resultCounter = 0;
    job.on('data', function (map) {
      if ( ++resultCounter % 10 === 0) {
        console.log(resultCounter, 'Maps done...');
      }
      postProcessing.addMap(JSON.parse(map));
      //write2D(JSON.parse(map), rows, cols, './testmap_'+resultCounter+'.map');
    });

    job.on('error', function (err) {
      console.log('-->Job error :', err);
    });

  }

  var kmlMaps = {};
  function postProcessMaps(allMaps){

    console.log('Post-processing...');

    var finalMaps = postProcessing.process();

    var optsIn1 = {
      data1: finalMaps.udev,
      rows: rows,
      cols: cols,
      height: height,
      width: width,
      tf: 120,
      ignPt: ignitionPt,
      lineColour: 'ff0055ff',
      polyColour: 'b30055ff',
      tag: '1hour Best Case CI95%'
    };

    var optsOut1 = {
      data1: finalMaps.udev,
      data2: finalMaps.ldev,
      rows: rows,
      cols: cols,
      height: height,
      width: width,
      tf: 120,
      ignPt: ignitionPt,
      lineColour: 'ff0000ff',
      polyColour: 'b30000ff',
      tag: '1hour Worst Case CI95%'
    };

    var optsIn2 = {
      data1: finalMaps.udev,
      rows: rows,
      cols: cols,
      height: height,
      width: width,
      tf: 180,
      ignPt: ignitionPt,
      lineColour: 'ff0055ff',
      polyColour: 'b30055ff',
      tag: '2hour Best Case CI95%'
    };

    var optsOut2 = {
      data1: finalMaps.udev,
      data2: finalMaps.ldev,
      rows: rows,
      cols: cols,
      height: height,
      width: width,
      tf: 180,
      ignPt: ignitionPt,
      lineColour: 'ff0000ff',
      polyColour: 'b30000ff',
      tag: '2hour Worst Case CI95%'
    };

    kmlMaps.kmlIn1 = ignToKml(optsIn1).kml;
    kmlMaps.kmlOut1 = ignToKml(optsOut1).kml;
    kmlMaps.kmlIn2 = ignToKml(optsIn2).kml;
    kmlMaps.kmlOut2 = ignToKml(optsOut2).kml;

    callback(null, kmlMaps);
  }
};
