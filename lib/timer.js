var enums = eval(require('fs').readFileSync(__dirname+'/lib/enum.js', 'utf8'));

if(!EzExp) { var EzExp = {}; }
/** Class representing a timer.
* @class
*/
EzExp.Timer = function() {
  var that = this;

  /** State of the timer (see {@link EzExp.Enums.TimerState|TimerState}).
  * @type {EzExp.Enums.TimerState}
  * @private
  */
  this._temporalState = EzExp.Enums.TimerState.NotStarted;

  /** Starting time in milliseconds from January 1, 1970 00:00:00 UTC
  * @type {number}
  * @default [0]
  * @private
  */
  this._startTime = 0;
  /** Ending time in milliseconds from January 1, 1970 00:00:00 UTC
  * @type {number}
  * @default [0]
  * @private
  */
  this._endTime = 0;
  /** Duration in milliseconds.
  * @type {number}
  * @default [0]
  * @private
  */
  this._duration = 0;

  // user can pause and resume the timer which is recorded as marks in time
  /** Array of times that reference pause/resume events
  * @type {number[]}
  * @private
  */
  this._breaks = [];

  /** Compute the current duration of the timer (i.e. time between {@link EzExp.Timer#_startTime|_startTime} and {@link EzExp.Timer#_endTime|_endTime}
   * or the current time if the timer is not stopped, with all pause-resume intervals substracted).
   * @return {number} Duration of the timer (i.e. {@link EzExp.Timer#_duration|_duration}).
   */
  this.computeDuration = function() {
    if(that._temporalState == EzExp.Enums.TimerState.Stopped) { that._duration = that._endTime - that._startTime; }
    else {
      if(that._startTime) { that._duration = Date.now() - that._startTime; }
      else { that._duration = 0; }
    }

    var count = that._breaks.length;
    if(count > 0) {
      // timer was resumed correctly after pausing
      if(count % 2 == 0) {
        // remove from duration the time between pauses and resumes
        for(var i = 0; i < count; i=i+2) { that._duration -= that._breaks[i+1] - that._breaks[i]; }
      }
      // timer is stilled paused
      else {
        // don't take into account last pause
        for(var i = 0; i < count-1; i=i+2) { that._duration -= that._breaks[i+1] - that._breaks[i]; }
      }
    }
    return that._duration;
  };

  /** Start the timer.
  * @return {boolean} Whether the timer was correctly started.
  */
  this.start = function() {
    if(that._temporalState == EzExp.Enums.TimerState.Stopped) { console.error('Timer already stopped.'); return false; }
    else if(that._temporalState != EzExp.Enums.TimerState.NotStarted) { console.log('Timer already started.'); return true; }
    that._startTime = Date.now();
    that._temporalState = EzExp.Enums.TimerState.Started;
    return true;
  };

  /** Pause the timer.
  * @return {boolean} Whether the timer was correctly paused.
  */
  this.pause = function() {
    if(that._temporalState == EzExp.Enums.TimerState.Paused) { console.log('Timer already paused.'); return true; }
    else if(that._temporalState == EzExp.Enums.TimerState.NotStarted) { console.error('Timer not started yet.'); return false; }
    else if(that._temporalState == EzExp.Enums.TimerState.Stopped) { console.error('Timer already stopped.'); return false; }
    that._breaks.push[Date.now()];
    that._temporalState = EzExp.Enums.TimerState.Paused;
    return true;
  };

  /** Resume the timer.
  * @return {boolean} Whether the timer was correctly resumed.
  */
  this.resume = function() {
    if(that._temporalState == EzExp.Enums.TimerState.Stopped) { console.error('Timer already stopped.'); return false; }
    else if(that._temporalState == EzExp.Enums.TimerState.NotStarted) { console.error('Timer not started yet.'); return false; }
    else if(that._temporalState == EzExp.Enums.TimerState.Started) { console.error('Timer not paused.'); return true; }
    that._breaks.push[Date.now()];
    that._temporalState = EzExp.Enums.TimerState.Started;
    return true;
  };

  /** Stop the timer.
  * @return {boolean} Whether the timer was correctly resumed.
  */
  this.stop = function() {
    if(that._temporalState == EzExp.Enums.TimerState.Stopped) { console.error('Timer already stopped.'); return true; }
    else if(that._temporalState == EzExp.Enums.TimerState.NotStarted) { console.error('Timer not started.'); return false; }
    that._endTime = Date.now();
    that._temporalState = EzExp.Enums.TimerState.Stopped;
    return true;
  };

  /** Get the duration of the timer.
  * @return {number} Duration of the timer (0 if not started already).
  */
  this.getDuration = function() { return that.computeDuration(); };

  /** Get the raw start time of the timer.
  * @return {number} Raw start time (0 if not started already).
  */
  this.getStartTime = function() { return that._startTime; };

  /** Get the raw end time of the timer.
  * @return {number} Raw end time (0 if not started already).
  */
  this.getEndTime = function() {
    if(that._temporalState == EzExp.Enums.TimerState.Stopped) { console.error("Timer not stopped yet"); return 0; }
    return that._endTime;
  };

  /** Get the state of the timer.
  * @return {EzExp.Enums.TimerState} State of the timer.
  */
  this.getState = function() { return that._temporalState; };
};
