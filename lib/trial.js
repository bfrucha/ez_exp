var fs = require('fs');
var timer = eval(fs.readFileSync('lib/timer.js', 'utf8'));
var enums = eval(fs.readFileSync('lib/enum.js', 'utf8'));

var Trial = {
  createTrial: function(experiment, parameterData) {
    return (function(exp, pd) {

      var _parentExperiment = exp;

      // Recorded values associated to the parameter header referenced in the Experiment module
      var _parameterData = pd;

      // Dictionary used to save data about the trial dynamically.
      var _resultData = {};

      // Main timer used to time the overall trial.
      var _mainTimer = Timer.createTimer();

      // Dictionary of timers with their names used to reference them as the dictionary keys.
      // This dictionary will always at least contain one main timer for the trial.
      var _timers = {};

      // Current state of the trial.
      var _trialState = TrialState.NotStarted;

      return {
        getParameterData: function(index) {
          if(index!==undefined) { return _parameterData[index]; }
          else { return _parameterData; }
        },

        saveResultData: function(tag, data) { _resultData[tag] = data; },

        getResultData: function(tag) {
          if(tag) {
            if(_resultData[tag]===undefined) { console.error('Unknown result tag ('+tag+')'); return null; }
            else { return _resultData[tag]; }
          } else { return _resultData; }
        },

        startTrial: function() { _mainTimer.start(); _trialState = TrialState.Started; },

        endTrial: function() {
          // stop all timers
          for(var t in _timers) { if(_timers[t].getState() != TimerState.Stopped) { _timers[t].stop(); } }
          _mainTimer.stop();
          _trialState = TrialState.Ended;
        },

        addTimer: function(tag) { _timers[tag] = Timer.createTimer(); },

        removeTimer: function(tag) { delete _timers[tag]; },

        startTimer: function(tag) {
          if(_timers[tag]) { _timers[tag].start(); }
          else { console.error('Unknown timer tag ('+tag+')'); }
        },

        pauseTimer: function(tag) {
          if(_timers[tag]) { _timers[tag].pause(); }
          else { console.error('Unknown timer tag ('+tag+')'); }
        },

        resumeTimer: function(tag) {
          if(_timers[tag]) { _timers[tag].resume(); }
          else { console.error('Unknown timer tag ('+tag+')'); }
        },

        stopTimer: function(tag) {
          if(_timers[tag]) { _timers[tag].stop(); }
          else { console.error('Unknown timer tag ('+tag+')'); }
        },

        getTimerState: function(tag) {
          if(_timers[tag]) { return _timers[tag].getState(); }
          else { console.error('Unknown timer tag ('+tag+')'); return null; }
        },

        getTimerDuration: function(tag) {
          if(_timers[tag]) { return _timers[tag].getDuration(); }
          else { console.error('Unknown timer tag ('+tag+')'); return null; }
        },

        getMainDuration: function() { return _mainTimer.getDuration(); },

        getState: function() { return _trialState; }
      };
    })(experiment, parameterData);
  }
}
