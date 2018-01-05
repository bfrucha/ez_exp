eval(require('fs').readFileSync(__dirname+'/lib/experiment.js', 'utf8'));

// create a new experiment object
// parameters given are the path to the parameter file, the name of the current participant and the name of the column where to find participant ids
var experiment = Experiment.loadExperiment(__dirname+'/example_data/exp_parameters.csv', 'user-1', 'Participant');

// default path to record data is 'results_[participant ID].csv'
experiment.setOutputPath(__dirname+'/example_data/results_user-1.csv');

// load information
experiment.loadNextTrial();
var a = experiment.getParameterData('Var_A');
experiment.startTrial();

// [...]

// a tag is necessary to create/access/delete recorded data
var result_tag = 'Success';
// data can be saved for the current trial to be saved in the output file
experiment.saveResultData(result_tag, 'true');
// the same data can be accessed later in a string format
var success = experiment.getResultData(result_tag);
// the header of the results has to be explicited so data can be written correctly in the output file
experiment.setResultHeader([result_tag]);

// [...]

// a trial contains a main timer that records the task completion time
// however, other timers can be created and accessed with a tag
var timer_tag = 'InteractionTime';
experiment.addTimer(timer_tag);
experiment.startTimer(timer_tag);

// wait for 2000ms to stop the timer
setTimeout(() => { experiment.stopTimer(timer_tag); }, 2000);
// a header for the timers has to be explicited also
experiment.setTimerHeader([timer_tag]);

// wait 4000ms to end the current trial
// the default behavior is to record data after a trial ends
setTimeout(() => {
  experiment.endTrial();
  console.log('Result data should now be written in the output file specified earlier (i.e. "example_data/results_user-1.csv"');
}, 4000);
