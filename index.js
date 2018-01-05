var exp = require('ez_exp/experiment.js');
module.exports.enums = require('ez_exp/enum.js');

module.exports.loadExperiment = exp.loadExperiment;

module.exports.test = function () {
  var t1 = exp.createTrial(['1','2']);
  var t2 = exp.createTrial(['3','4']);

  t1.startTrial();
  var i = 0;
  while(i++ < 1000000);
  t2.startTrial();
  console.log(t1.getMainDuration(), t2.getMainDuration());
};
