var StatsArray = require('stats-array');

var Embers = {
  maps  : [],
  avg   : [],
  ldev  : [],
  udev  : [],

  addMap:  function (map) {
    this.maps.push(map);
  },

  process: function() {
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
  }

};

module.exports = Embers;