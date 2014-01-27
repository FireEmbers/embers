var Readable = require('stream').Readable;
var boxmuller = require('box-muller');

module.exports = dataStream;
function dataStream (moisture, u, alpha, std, n) {

  // input stream for the program
  var data = new Readable({objectMode: true});
  var dataunit = [0, 0, 0];
  data._read = function _read () {
    if (n--) {

      //dataUnits array has 3 sub arrays, each for a different cenario of wind speed
      //Each data Unit is [% moisture, Wind Speed in m/s, wind direction degrees clockwise from north]
      dataunit[0] = moisture/100;
      dataunit[1] = gauss(u, std/100*u);
      dataunit[1] = (dataunit[1] >= 0 ? dataunit[1] : 0);
      dataunit[2] = alpha;

      data.push(dataunit);

    } else {
      data.push(null);
    }
  };
  return data;

  function gauss(avg, sDev) {

    //zero mean, unit variance
    var sample = boxmuller();

    //returns random number with gaussian distribution
    //uses box Muller algorithm to compute normal 0-1 distribution

    var gaussNumber = avg + sDev * sample;

    return gaussNumber;
  }

}