var enums = eval(require('fs').readFileSync('lib/enum.js', 'utf8'));

var Timer = {
  createTimer: function() {
    return (function() {

      var _temporalState = TimerState.NotStarted;

      var _startTime = 0, _endTime = 0, _duration = 0;

      // user can pause and resume the timer which is recorded as marks in time
      var _breaks = [];

      function computeDuration() {
        if(_temporalState == TimerState.Stopped) { _duration = _endTime - _startTime; }
        else {
          if(_startTime) { _duration = Date.now() - _startTime; }
          else { _duration = 0; }
        }

        var count = _breaks.length;
        if(count > 0) {
          // timer was resumed correctly after pausing
          if(count % 2 == 0) {
            // remove from duration the time between pauses and resumes
            for(var i = 0; i < count; i=i+2) { _duration -= _breaks[i+1] - _breaks[i]; }
          }
          // timer is stilled paused
          else {
            // don't take into account last pause
            for(var i = 0; i < count-1; i=i+2) { _duration -= _breaks[i+1] - _breaks[i]; }
          }
        }
        return _duration;
      }

      return {
        start: function() {
          if(_temporalState == TimerState.Stopped) { console.error('Timer already stopped.'); return; }
          else if(_temporalState != TimerState.NotStarted) { console.error('Timer already started.'); return; }
          _startTime = Date.now();
          _temporalState = TimerState.Started;
        },

        pause: function() {
          if(_temporalState == TimerState.Paused) { console.error('Timer already paused.'); return; }
          else if(_temporalState == TimerState.Stopped) { console.error('Timer already stopped.'); return; }
          _breaks.push[Date.now()];
          _temporalState = TimerState.Paused;
        },

        resume: function() {
          if(_temporalState == TimerState.Stopped) { console.error('Timer already stopped.'); return; }
          else if(_temporalState != TimerState.Paused) { console.error('Timer not paused.'); return; }
          _breaks.push[Date.now()];
          _temporalState = TimerState.Started;
        },

        stop: function() {
          if(_temporalState == TimerState.Stopped) { console.error('Timer already stopped.'); return; }
          else if(_temporalState == TimerState.NotStarted) { console.error('Timer not started.'); return; }
          _endTime = Date.now();
          _temporalState = TimerState.Stopped;
        },

        getDuration: function() { return computeDuration(); },

        getStartTime: function() {
          if(_temporalState == TimerState.NotStarted) { console.error("Timer not started yet"); }
          return _startTime;
        },

        getEndTime: function() {
          if(_temporalState == TimerState.Stopped) { console.error("Timer not stopped yet"); }
          return _endTime;
        },

        getState: function() { return _temporalState; }
      }
    })();
  }
}
