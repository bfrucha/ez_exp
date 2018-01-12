Ez Exp
=========

EzExp is a node module that simplifies boring aspect of experiment building: coding. More precisely, it helps you load configuration files in the csv format (created using software like [Touchstone](https://github.com/jdfekete/touchstone-platforms) for example) to run all your participant trials easily, without worrying about back end tasks. An output file in the csv format also containing custom data recorded along the experiment is saved during or at the end of the experiment. Let's learn how to make you earn valuable time.

### Quick tutorial

An example is provided in the module hierarchy. You can run it using the command *'node node_modules/ez_exp/example.js'*. We'll go through the code contained in the file to show you how the module works. First, the module can be loaded using:
```javascript
var ez_exp = require('ez_exp'); // this line is different in the example file because libraries have to be without the require keyword
```

The interface used to interact with the EzExp module can be instantiated using the *loadExperiment* function. The parameters are the *path* to the configuration file, the user ID, and the column name where to find the participant ID in the csv configuration file. The number of the current trial to start with can also be provided, which is especially useful in case of recovery from a crash. The configuration file and first trial are loaded automatically.
```javascript
var experiment = ez_exp.loadExperiment('example_data/exp_parameters.csv', 'user-1', 'Participant');
```

In the case of our example, the csv file contains 4 columns with 3 independant variables.
```csv
Var_A,Var_B,Var_C,Participant
1,2,3,user-0
2,3,1,user-0
3,2,1,user-0
2,1,3,user-1
3,2,1,user-1
1,3,2,user-1
3,1,2,user-2
1,2,3,user-2
2,3,1,user-2
```

Information relative to the current trial can be accessed easily.

```javascript
var a = experiment.getParameterData('Var_A'); // retrieve information for Var_A column (i.e. 2 in our case)
experiment.startTrial(); // start the main timer of the trial to record the task completion time
```

Information can be added to a trial on-the-fly to store dynamically information relative to the participant/experiment.

```javascript
// a tag is necessary to create/access/delete recorded data
var result_tag = 'Success';
// data are stored in the string format (to avoid problem while writing the output file)
experiment.saveResultData(result_tag, 'true');
// the same data can be accessed later in a string format
var savedData = experiment.getResultData(result_tag);
// the header of the results for the csv output file has to be explicited to save data in the right order
experiment.setResultHeader([result_tag]);
```


A trial contains a main timer that records the task completion time. However, several timers can be created and accessed with a tag.
```javascript
var timer_tag = 'InteractionTime';
experiment.addTimer(timer_tag);
experiment.startTimer(timer_tag);
// [...]
experiment.stopTimer(timer_tag); // stop the timer after a while
// a header for the timers has to be explicited also for the same reason than before
experiment.setTimerHeader([timer_tag]);
```


A trial can finally be ended like this:
```javascript
experiment.endTrial(); // by default, the data are saved after the end of each trial
```

The output file resulting from our example looks like this (time values may vary):
```csv
Var_A,Var_B,Var_C,Participant,Success,TaskCompletionTime,InteractionTime
2,1,3,user-1,true,4007,2003
```
Data from the configuration file are duplicated and the results are saved according to the result and timer headers specified. The TaskCompletionTime column is added by default and contains task completion times of all trials (i.e. time between the start and end of the trial).

A full documentation is available in the git repository under the [doc](https://github.com/bfrucha/ez_exp/tree/master/doc) folder.
