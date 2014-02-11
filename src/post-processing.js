var StatsArray = require('stats-array');

function  postProcessing () {

  this.maps = [];
  this.avg = [];
  this.ldev = [];
  this.udev = [];

  this.addMap =  function (map) {
    this.maps.push(map);
  };

  this.process = function() {
    var values = [];
    for (var pos = 0; pos < this.maps[0].length; pos++) {
      var array = [];
      for (var i = 0; i < this.maps.length; i++) {
        var map = this.maps[i];
        array.push(map[pos]);
      }
      var mean = array.mean();
      var moe = array.marginOfError(0.90);
      this.avg.push(mean);
      this.ldev.push(mean - moe);
      this.udev.push(mean + moe);
    }

    return {
      avg: this.avg,
      ldev: this.ldev,
      udev: this.udev
    };
  };

}

module.exports = postProcessing;