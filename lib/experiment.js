var fs = require('fs');
var enums = eval(fs.readFileSync(__dirname+'/lib/enum.js', 'utf8'));
var trial = eval(fs.readFileSync(__dirname+'/lib/trial.js', 'utf8'));

if(!EzExp) { var EzExp = {}; }

/** Instantiate a new experiment to use the ez_exp module. The configuration file and the first trial are automatically loaded.
* @func
* @param {string} inputFilePath - path to the input file in csv
* @param {string} participantId - ID of the current participant
* @param {string} participantColName='Participant' - name of the column containing the participant IDs
* @param {int} trialId=0 - ID of the trial to start with (equals to 0 by default)
* @param {boolean} loadFirstTrial=true - Whether the the first trial has to be loaded.
* @return Returns a boolean whether the file was loaded correctly.
*/
EzExp.loadExperiment =  function(inputFilePath, participantId, participantColName='Participant', trialId = 0, loadFirstTrial=true) {
  var exp = new EzExp.Experiment(inputFilePath, participantId, participantColName, trialId);

  var loaded = exp.loadConfigurationFile();
  if(loadFirstTrial && exp) { exp.loadNextTrial(); }
  return loaded ? exp : null;
};

/**
* Interface that is to be used to control the ez_exp module.
* @class
*/
EzExp.Experiment = function (ifp, pid, pcn, tid) {
  if(ifp == undefined || pid == undefined) {
    console.error('You need to provide a path for the configuration file and the current user ID.');
    return null;
  }

  // INPUT INFORMATION
  /** Contains the "header" of configuration file
  * @type {string[]}
  * @private
  */
  this._parameters = [];

  /** Name of the column containing the participant IDs
  * @type {string}
  * @private
  */
  this._partColName = pcn;

  // OUTPUT INFORMATION
  /** Header for the results added dynamically during the experiment that is used in the output file.
  * @type {string[]}
  * @private
  */
  this._resultHeader;

  /** Header for the timers added dynamically during the experiment that is used in the output file.
  * @type {string[]}
  * @private
  */
  this._timerHeader;

  /** Path to the configuration file in csv format.
  * @type {string}
  * @private
  */
  this._inputFilePath = ifp;

  /** Path to the output file in csv format that will contain saved results and timer durations.
  * @type {string}
  * @private
  * @default results_[participant_ID].csv
  */
  this._outputFilePath = 'results_'+pid+'.csv';

  /** ID of the current participant.
  * @type {string|number}
  * @private
  */
  this._participantId = pid;

  /** List of all trials loaded for the given participant ID.
  * @type {array.<Trial>}
  * @private
  */
  this._trials = [];

  /** ID of the current trial.
  * @type {number}
  * @private
  */
  this._currentTrialId = tid-1; // -1 because next trial is going to be loaded

  /** Record behavior for writing the output file (see {@link EzExp.Enums.RecordBehavior})
  * @type {string|number}
  * @private
  */
  this._recordBehavior = EzExp.Enums.RecordBehavior.SaveOnTrialEnd;

  /** Get the trial at the given index.
  * @private
  * @return {EzExp.Trial} The trial or null.
  */
  this.getTrial = function(index) {
    if (index < 0 || this._trials.length <= index) { console.error('Specified index is lesser than 0 or greater than the number of loaded trials.'); return null; }
    return this._trials[index];
  };

  /** Reads information contained in the configuration file that must be in the csv format. Trials specific to the participant ID given when instantiating the Experiment are loaded.
  * @return {boolean} Returns whether the file was loaded correctly.
  */
  this.loadConfigurationFile = function() {
    // console.log("Loading configuration file for participant '" + this._participantId+"'")
    if(this._inputFilePath==undefined) { console.error("No configuration file specified."); return false; }

    this._trials = [];

    var data = fs.readFileSync(this._inputFilePath, 'utf8');
    if (!data) { console.error('Could not read file at '+this.this._inputFilePath); return false; }
    var lines = data.split('\n');
    // load header
    this._parameters = lines[0].split(',');

    // need to load current participant information
    var userColId = this._parameters.indexOf(this._partColName), i = 1;
    if(userColId < 0) {
      console.error("Participant column name does not match any ("+this._partColName+", "+this._parameters+")");
      return false;
    }
    var participantFound = false;
    while(i < lines.length) {
      var linesplit = lines[i].split(',');
      if(linesplit[userColId] == this._participantId) { participantFound = true; this._trials.push(new EzExp.Trial(lines[i].split(','))); }
      else if(0 < this._trials.length) { break; }
      i++;
    }
    if(!participantFound) { console.log('Could not find participant '+this._participantId+' in the configuration file.'); }
    return participantFound;
  };

  /** Get the header loaded from the configuration file.
  * @return {string[]} Parameters array.
  */
  this.getParameters = function() { return this._parameters; };

  /** Get current trial data for a specified column in the configuration file, or all columns if no argument is provided.
  * @param {undefined} [param] Name of the column.
  * @return {string|string[]} The data related to the column(s).
  */
  this.getParameterData = function(param) {
    var t = this.getTrial(this._currentTrialId);
    if(!t) { console.error('No current trial loaded.'); return null; }

    if(param!==undefined) {
      var index = this._parameters.indexOf(param);
      if(index < 0) { console.error('Unknown parameter \''+param+'\''); return null; }
      return t.getParameterData(index);
    } else { return t.getParameterData(); }
  };

  /** Get the index of the parameter in the configuration file header.
  * @param {string} param Name of the column.
  * @return {number} The index of -1 if not found.
  */
  this.getParameterIndex = function(param) { return this._parameters.indexOf(param); };

  // trials
  /** Get the index of the current trial loaded.
  * @return {number} Index of the current trial loaded.
  */
  this.getCurrentTrialIndex = function() { return this._currentTrialId; };

  /** Get the {@link EzExp.Trial} currently loaded.
  * @return {EzExp.Trial} The trial currently loaded.
  */
  this.getCurrentTrial = function() { return this.getTrial(this._currentTrialId); };

  /** Get the overall count of the loaded trials for the current participant. Default behavior loads all trials for a given participant ID.
  * @return {number} Overall count of the trials.
  */
  this.getTrialCount = function() { return this._trials.length; };

  /** Load the information for the next trial in the list.
  * @return {EzExp.Trial} The next trial or null if all trials have been loaded.
  */
  this.loadNextTrial = function() {
    if (this._trials.length <= this._currentTrialId+1) { console.error("No more trial to load."); return null; }
    this._currentTrialId++;
    return this._trials[this._currentTrialId];
  };

  /** Load the trial with the given index.
  * @param {number} index Index of the trial.
  * @return {EzExp.Trial} Trial loaded or null if not found.
  */
  this.loadTrial = function(index) {
    var t = this.getTrial(index);
    if(t) { this._currentTrialId = index; }
    return t;
  };

  /** Start the current trial.
  * @return {boolean} Whether the trial was correctly started.
  */
  this.startTrial = function() {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.startTrial(); }
    else { console.error('No trial currently loaded.'); return false; }
  };

  /** End the current trial. By default, the {@link EzExp.Enums.RecordBehavior|RecordBehavior} saves data in the ouput file after each trial ends.
  * @return {boolean} Whether the trial was correctly started.
  */
  this.endTrial = function() {
    var t = this.getTrial(this._currentTrialId);
    if(t) {
      var res = t.endTrial();
      if(res && this._recordBehavior == EzExp.Enums.RecordBehavior.SaveOnTrialEnd) { this.saveCurrentTrial(); }
      return res;
    } else { console.error('No current trial!'); return false; }
  };

  /** Set the path where the output file will be written
  * @param {string} path Output path.
  */
  this.setOutputPath = function(path) { this._outputFilePath = path; };

  /** Get the path where the output file will be written
  * @return {string} Output path.
  */
  this.getOutputPath = function() { return this._outputFilePath; };

  /** Set the header for the results in the outputfile.
  * @param {string[]} header Header to be set.
  */
  this.setResultHeader = function(header) { this._resultHeader = header; };

  /** Get result header specified with {@link EzExp.Experiment~setResultHeader|setResultHeader}.
  * @return {string[]} Header for the results in the output file.
  */
  this.getResultHeader = function() { return this._resultHeader; };

  /** Save data with a specified tag to be recorded later in the output file. The tag can be used to access the data with {@link EzExp.Experiment~getResultData|getResultData}.
  * The result header has to be specified to write the data in the output file using {@link EzExp.Experiment~setResultHeader|setResultHeader}.
  * @param {string} tag Tag used to access the data and name of the column in the output file. Thus, it should appear in the result header when specified in {@link EzExp.Experiment~setResultHeader|setResultHeader}.
  * @param {string} data Data to save in the output file.
  */
  this.saveResultData = function(tag, data) {
    if(typeof(tag)!=='string' || typeof(data)!=='string') { console.error('Data should be saved in a string format.'); return; }
    var t = this.getTrial(this._currentTrialId);
    if(t) { t.saveResultData(tag,data); }
  };

  /** Retrieve data stored using {@link EzExp.Experiment~setResultData|setResultData}. If no tag is specified, return all data previously saved.
  * @return {string|string[]} Data saved using the tag specified, or all the data saved.
  */
  this.getResultData = function(tag) {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.getResultData(tag); }
    return null;
  };

  /** Set the header for the timers in the outputfile.
  * @param {string[]} header Header to be set.
  */
  this.setTimerHeader = function(header) { this._timerHeader = header; };

  /** Get timer header specified with {@link EzExp.Experiment~setTimerHeader|setTimerHeader}.
  * @return {string[]} Header for the timers in the output file.
  */
  this.getTimerHeader = function() { return this._timerHeader; };

  /** Add a timer to the current trial that can be accessed with the tag specified. Two timers cannot share the same tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly created.
  */
  this.addTimer = function(tag) {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.addTimer(tag); }
    else { console.log('No trial is currently loaded'); return false; }
  };

  /** Remove the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly removed.
  */
  this.removeTimer = function(tag) {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.removeTimer(tag); }
    else { console.log('No trial is currently loaded'); return false; }
  };

  /** Start the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly started.
  */
  this.startTimer = function(tag) {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.startTimer(tag); }
    else { console.log('No trial is currently loaded'); return false; }
  };

  /** Pause the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly paused.
  */
  this.pauseTimer = function(tag) {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.pauseTimer(tag); }
    else { console.log('No trial is currently loaded'); return false; }
  };

  /** Resume the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly resumed.
  */
  this.resumeTimer = function(tag) {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.resumeTimer(tag); }
    else { console.log('No trial is currently loaded'); return false; }
  };

  /** Stop the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly stopped.
  */
  this.stopTimer = function(tag) {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.stopTimer(tag); }
    else { console.log('No trial is currently loaded'); return false; }
  };

  /** Get the duration of the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {number} Duration of the timer (0 if not started already and -1 if the tag does not exist).
  */
  this.getTimerDuration = function(tag) {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.getTimerDuration(tag); }
    else { console.log('No trial is currently loaded'); return -1; }
  };

  /** Get the state of the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {EzExp.Enums.TimerState|TimerState} State of the timer or null if the tag does not exist.
  */
  this.getTimerState = function(tag) {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.getTimerState(tag); }
    else { console.log('No trial is currently loaded'); return null; }
  };

  /** Get all timers previously saved.
  * @return {Object.<string,EzExp.Timer>} All timers saved.
  */
  this.getTimers = function() {
    var t = this.getTrial(this._currentTrialId);
    if(t) { return t.getTimers(); }
    else { console.log('No trial is currently loaded'); return null; }
  }

  /** Get the overall duration of the current trial.
  * @return {number} Duration of the trial (0 if not started already and -1 if the tag does not exist).
  */
  this.getCurrentTrialDuration = function() {
    var t = this.getTrial(_currentTrialId);
    if(t) { return t.getMainDuration(); }
    else { console.error('No trial is currently loaded'); return -1; }
  };

  /** Save the currently loaded {@link EzExp.Trial|Trial} to the output file at the path specified in {@link EzExp.Experiment~setOutputPath|setOutputPath}.
  * If the result (see {@link EzExp.Experiment#setResultHeader|setResultHeader}) and timer (see {@link EzExp.Experiment#setTimerHeader|setTimerHeader}) headers are not set yet, read information contained in the result and timer table for the current trial to complete the output file header.
  */
  this.saveCurrentTrial = function() {
    var t = this._trials[this._currentTrialId];

    if(!fs.existsSync(this._outputFilePath)) {
      var data = this._parameters.join(',');
      if(this._resultHeader) { data += ','+this._resultHeader.join(','); }
      // by default, write in header information contained in the result object
      else { for(var k in this.getResultData()) { data += ','+k; } }
      data += ',TaskCompletionTime';
      if(this._timerHeader) { data += ','+this._timerHeader.join(','); }
      // by default, write in header information contained in the timers object
      else { for(var k in this.getTimers()) { data += ','+k; } }
      fs.writeFileSync(this._outputFilePath, data+'\n', 'utf8');
    }

    // save parameters of this trial first
    var data = t.getParameterData().join(',');
    // save all results saved for this trial
    var resultData = t.getResultData();
    if (resultData) {
      if (this._resultHeader != null) { for (var i in this._resultHeader) { data += ',' + t.getResultData(this._resultHeader[i]); } }
      // order does not matter if the results header was provided
      else { for (var k in resultData) { data += ',' + resultData[k]; } }
    }
    // always save main timer
    data += ',' + t.getMainDuration();
    // save all timers at the end
    if (this._timerHeader) { for (var i in this._timerHeader) { data += ',' + t.getTimerDuration(this._timerHeader[i]); } }
    else { for (var k in t.getTimers()) { data += ',' + t.getTimerDuration(k); } }

    if(!fs.appendFileSync(this._outputFilePath, data+'\n', 'utf8')) { console.error('Could not save trial'); }
  };
};
