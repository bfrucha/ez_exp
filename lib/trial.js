var fs = require('fs');
var enums = eval(fs.readFileSync(__dirname+'/lib/enum.js', 'utf8'));
var timer = eval(fs.readFileSync(__dirname+'/lib/timer.js', 'utf8'));

if(!EzExp) { var EzExp = {}; }
/** Class representing a trial.
* @class
*/
EzExp.Trial = function(parameterData) {

  var that = this;

  /** Recorded data associated to the parameter header referenced in {@link EzExp.Experiment|Experiment}.
  * @type {string[]}
  * @private
  */
  this._parameterData = parameterData;

  /** Dictionary used to save data dynamically using tags to create/access the data.
  * @type {Object.<string,string>}
  * @private
  */
  this._resultData = {};

  /** Main timer of the trial used to record the task comletion time.
  * @type {EzExp.Timer}
  * @private
  */
  this._mainTimer = new EzExp.Timer();

  /** Dictionary of timers with tags used to reference them as the dictionary keys.
  * @type {Object.<string, EzExp.Timer>}
  * @private
  */
  this._timers = {};

  /** Current state of the trial (see {@link EzExp.Enums.TrialState|TrialState}).
   * @type {EzExp.Enums.TrialState}
   * @private
   */
  this._trialState = EzExp.Enums.TrialState.NotStarted;

  /** Get current trial data for a specified column in the configuration file, or all columns if no argument is provided.
  * @param {number} [index] Index of the column.
  * @return {string|string[]} The data related to the column(s).
  */
  this.getParameterData = function(index) {
    if(index!==undefined) { return that._parameterData[index]; }
    else { return that._parameterData; }
  };

  /** Start the trial.
   * @return {boolean} Whether the trial was correctly started.
   */
  this.startTrial = function() {
    if(that._trialState !== EzExp.Enums.TrialState.NotStarted) { console.log('Trial already started'); return false; }
    that._mainTimer.start();
    that._trialState = EzExp.Enums.TrialState.Started;
    return true;
  };

  /** End the trial.
   * @return {boolean} Whether the trial was correctly started.
   */
  this.endTrial = function() {
    if(that._trialState === EzExp.Enums.TrialState.NotStarted) { console.log('Trial never started'); return false; }
    else if(that._trialState === EzExp.Enums.TrialState.Ended) { console.log('Trial already stopped'); return false; }
    // stop all timers
    for(var t in that._timers) { if(that._timers[t].getState() != EzExp.Enums.TimerState.Stopped) { that._timers[t].stop(); } }
    that._mainTimer.stop();
    that._trialState = EzExp.Enums.TrialState.Ended;
    return true;
  };

  /** Add a timer to {@link EzExp.Trial#_timers|_timers}. Two timers cannot share the same tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly created.
  */
  this.addTimer = function(tag) {
    if(tag in that._timers) { return false; }
    else { that._timers[tag] = new EzExp.Timer(); return true; }
  };

  /** Remove the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly removed.
  */
  this.removeTimer = function(tag) {
    if(tag in that._timers) { delete that._timers[tag]; return true; }
    else { return false; }
  };

  /** Start the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly started.
  */
  this.startTimer = function(tag) {
    if(tag in that._timers) { that._timers[tag].start(); return true; }
    else { console.error('Unknown timer tag ('+tag+')'); return false; }
  };

  /** Pause the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly paused.
  */
  this.pauseTimer = function(tag) {
    if(tag in that._timers) { that._timers[tag].pause(); return true; }
    else { console.error('Unknown timer tag ('+tag+')'); return false; }
  };

  /** Resume the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly resumed.
  */
  this.resumeTimer = function(tag) {
    if(tag in that._timers) { that._timers[tag].resume(); return true; }
    else { console.error('Unknown timer tag ('+tag+')'); return false; }
  };

  /** Stop the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {boolean} Whether the timer was correctly stopped.
  */
  this.stopTimer = function(tag) {
    if(tag in that._timers) { that._timers[tag].stop(); return true; }
    else { console.error('Unknown timer tag ('+tag+')'); return false; }
  };

  /** Get the duration of the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {number} Duration of the timer (0 if not started already and -1 if the tag does not exist).
  */
  this.getTimerDuration = function(tag) {
    if(tag in that._timers) { return that._timers[tag].getDuration(); }
    else { console.error('Unknown timer tag ('+tag+')'); return -1; }
  };

  /** Get the state of the timer with the given tag.
  * @param {string} tag Tag of the timer.
  * @return {EzExp.Enums.TimerState|TimerState} State of the timer or null if the tag does not exist.
  */
  this.getTimerState = function(tag) {
    if(tag in that._timers) { return that._timers[tag].getState(); }
    else { console.error('Unknown timer tag ('+tag+')'); return null; }
  };

  /** Get all timers previously saved in {@link EzExp.Trial#_timers|_timers}.
  * @return {Object.<string,EzExp.Timer>} All timers saved in {@link EzExp.Trial#_timers|_timers}.
  */
  this.getTimers = function() { return that._timers; }

  /** Get the overall duration of the trial.
  * @return {number} Duration of the timer (0 if not started already and -1 if the tag does not exist).
  */
  this.getMainDuration = function() { return that._mainTimer.getDuration(); };

  /** Get trial state (see {@link EzExp.Enums.TrialState|TrialState}).
  * @return {EzExp.Enums.TrialState} State of the trial.
  */
  this.getState = function() { return that._trialState; };

  /** Save data with a specified tag to be recorded later in the output file. If the tag already exists, the data are overridden.
  * @param {string} tag Tag used to access the data.
  * @param {string} data Data to save in the output file.
  */
  this.saveResultData = function(tag, data) { that._resultData[tag] = data; };

  /** Retrieve data stored using {@link EzExp.Trial~setResultData|setResultData}. If no tag is specified, return all data previously saved.
  * @param {string} [tag] Tag used to access the data.
  * @return {string|string[]} Data saved using the tag specified, or all the data saved.
  */
  this.getResultData = function(tag) {
    if(tag) {
      if(that._resultData[tag]===undefined) { console.error('Unknown result tag ('+tag+')'); return null; }
      else { return that._resultData[tag]; }
    } else { return that._resultData; }
  };
};
