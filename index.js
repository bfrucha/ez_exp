var fs = require('fs');
var ez_exp = eval(fs.readFileSync(__dirname+'/lib/experiment.js', 'utf8'));
// loading enums used in the module
eval(fs.readFileSync(__dirname+'/lib/enum.js', 'utf8'));
module.exports.Enums = EzExp.Enums;
module.exports.loadExperiment = EzExp.loadExperiment;
