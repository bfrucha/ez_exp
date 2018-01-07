var fs = require('fs');
eval(require('fs').readFileSync(__dirname+'/lib/experiment.js', 'utf8'));

// Test for trial load and data saving/accessing
var exp = EzExp.loadExperiment(__dirname+'/example_data/exp_parameters.csv', 'user-1');

var header = exp.getParameters();
var pdata = exp.getParameterData();
console.log('('+(header.length==4)+') Header of configuration file is of length 4');
console.log('('+(pdata.length==4)+') Data of first trial is of length 4: '+pdata);
console.log('All columns can be accessed correctly: ');
var er = ['2','1','3','user-1'];
for(var i in header) { console.log( '('+(exp.getParameterData(header[i])==er[i])+') '+header[i]+' = '+exp.getParameterData(header[i])); }

console.log('('+(exp.getTrialCount()==3)+') Number of loaded trials = 3');
console.log('('+(exp.getCurrentTrialIndex()==0)+') Current trial index = 0');
exp.loadNextTrial();
console.log('('+(exp.getCurrentTrialIndex()==1)+') Current trial index = 1');
exp.loadNextTrial();
console.log('('+(exp.getCurrentTrialIndex()==2)+') Current trial index should now be 2');
console.log('('+(exp.loadNextTrial()==null)+') Impossible to load more trial');
console.log('('+(exp.getCurrentTrialIndex()==2)+') Trial index still = 2');

console.log('Loading experiment on trial 2 from start:');
var exp2 = EzExp.loadExperiment(__dirname+'/example_data/exp_parameters.csv', 'user-1', 'Participant', 2);
console.log('('+(exp2.getCurrentTrialIndex()==2)+') Trial index loaded = 2');
var res = true;
var pd1 = exp.getParameterData(), pd2 = exp2.getParameterData();
for(var i in pd1) { res = res && (pd1[i]===pd2[i]); }
console.log('('+res+') Parameters are the same for both experiments loaded ['+exp.getParameterData()+'] ['+exp2.getParameterData()+']');

exp.saveResultData('Success', 'true');
console.log('('+('true'===exp.getResultData('Success'))+') Data can be saved/accessed.');
exp.startTrial(); exp.endTrial();
console.log('('+fs.existsSync(exp.getOutputPath())+') Output file correctly saved after trial end.');
var header = exp.getParameters().join(',')+',Success,TaskCompletionTime';
var data = fs.readFileSync(exp.getOutputPath(), 'utf8');
console.log('('+(data.split('\n')[0]===header)+') Header of the output file correctly formatted:');
console.log('('+(data.split('\n').length===3)+') Trial correctly recorded');
console.log(data);
fs.unlinkSync(exp.getOutputPath())

var resHeader = ['Res1','Res2','Res3'];
exp2.saveResultData(resHeader[2], '0x984513');
exp2.saveResultData(resHeader[0], 'true');
exp2.saveResultData(resHeader[1], '10');
exp2.setResultHeader(resHeader);
exp2.setOutputPath(__dirname+'/example_data/exp2_test.csv');
exp2.saveCurrentTrial();
header = exp2.getParameters().join(',')+','+exp2.getResultHeader()+',TaskCompletionTime';
data = fs.readFileSync(exp2.getOutputPath(), 'utf8');
console.log('('+(data.split('\n')[0]===header)+') Header of the output file correctly formatted:');
console.log(data);
fs.unlinkSync(exp2.getOutputPath());

var timerHeader = ['Timer3','Timer2','Timer1','Timer4'];
exp2.setTimerHeader(timerHeader);
exp2.addTimer(timerHeader[2]); exp2.addTimer(timerHeader[1]); exp2.addTimer(timerHeader[0]); exp2.addTimer(timerHeader[3]);

exp2.startTrial();
exp2.startTimer('Timer4');
setTimeout(() => { exp2.startTimer(timerHeader[0]); }, 500);
setTimeout(() => { exp2.startTimer(timerHeader[1]); }, 1000);
setTimeout(() => { exp2.startTimer(timerHeader[2]); }, 1500);

setTimeout(() => { exp2.stopTimer(timerHeader[2]); }, 2000);
setTimeout(() => { exp2.stopTimer(timerHeader[1]); }, 2500);
setTimeout(() => { exp2.stopTimer(timerHeader[0]); }, 3000);

setTimeout(() => {
  exp2.endTrial();

  console.log('('+(exp2.getTimerDuration(timerHeader[0])>exp2.getTimerDuration(timerHeader[1]))+') Durations ok.');
  console.log('('+(exp2.getTimerDuration(timerHeader[0])>exp2.getTimerDuration(timerHeader[2]))+') Durations ok.');
  console.log('('+(exp2.getTimerDuration(timerHeader[1])>exp2.getTimerDuration(timerHeader[2]))+') Durations ok.');
  console.log('('+(exp2.getTimerState(timerHeader[3])===EzExp.Enums.TimerState.Stopped)+') State ok.');
  header = exp2.getParameters().join(',')+','+exp2.getResultHeader()+',TaskCompletionTime,'+exp2.getTimerHeader();
  data = fs.readFileSync(exp2.getOutputPath(), 'utf8');
  console.log('('+(data.split('\n')[0]===header)+') Header of the output file correctly formatted: '+header);
  console.log(data);
  fs.unlinkSync(exp2.getOutputPath())
}, 3500);
