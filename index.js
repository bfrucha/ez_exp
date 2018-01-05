var fs = require('fs');
var ez_exp = eval(fs.readFileSync('lib/experiment.js', 'utf8'));
module.exports.enums = eval(fs.readFileSync('lib/enum.js', 'utf8'));

module.exports.loadExperiment = Experiment.loadExperiment;

module.exports.test = function () {
  var t1 = exp.createTrial(['1','2']);
  var t2 = exp.createTrial(['3','4']);

  t1.startTrial();
  var i = 0;
  while(i++ < 1000000);
  t2.startTrial();
  console.log(t1.getMainDuration(), t2.getMainDuration());
};
