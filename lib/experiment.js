var fs = require('fs');
var trial = eval(fs.readFileSync('lib/trial.js', 'utf8'));
var enums = eval(fs.readFileSync('lib/enum.js', 'utf8'));


var Experiment = {
  loadExperiment: function(inputFilePath, participantId, participantColName='Participant', trialId = 0) {
    var exp = (function (ifp, pid, tid, pcn) {

      if(inputFilePath == undefined || participantId == undefined) {
        console.error('You need to provide a path for the configuration file and the current user ID.');
        return false;
      }

      // INPUT INFORMATION
      // Parameters are the "header" of the file -> array[] of strings.
      // PartColName -> name of the column where the participant names are
      var _parameters, _partColName = pcn;
      // OUTPUT INFORMATION
      // resultHeader will be the header used in the data recorded file.
      // timerHeader will be the part of the header concatenated to results header.
      var _resultHeader, _timerHeader;

      // path to configuration and saving files
      var _inputFilePath = ifp, _outputFilePath = 'results_'+participantId+'.csv';
      // ID of the current participant
      var _participantId = pid;
      // list of all trials loaded for the experiment
      var _trials;
      var _currentTrialId = trialId-1; // -1 because next trial is going to be loaded

      // record behavior of the module
      var _recordBehavior = RecordBehavior.SaveOnTrialEnd;

      function getTrial(index) {
        if (index < 0 || _trials.Count <= index) { console.error('Specified index is lesser than 0 or greater than the loaded trial number.'); return null; }
        return _trials[index];
      }

      return {
        // load the configuration file
        loadConfigurationFile:
        function() {
          // console.log("Loading configuration file for participant '" + _participantId+"'")
          if(_inputFilePath==undefined) { console.error("No configuration file specified."); return false; }

          _trials = [];

          var data = fs.readFileSync(_inputFilePath, 'utf8');
          if (!data) { console.error('Could not read file at '+_inputFilePath); return false; }
          var lines = data.split('\n');
          // load header
          _parameters = lines[0].split(',');

          // need to load current participant information
          var userColId = _parameters.indexOf(_partColName), i = 1;
          if(userColId < 0) {
            console.error("Participant column name does not match any ("+_partColName+", "+_parameters+")");
            return false;
          }
          var participantFound = false;
          while(i < lines.length) {
            var linesplit = lines[i].split(',');
            if(linesplit[userColId] == _participantId) { participantFound = true; _trials.push(Trial.createTrial(this, lines[i].split(','))); }
            else if(0 < _trials.length) { break; }
            i++;
          }
          if(!participantFound) { console.log('Could not find participant '+_participantId+' in the configuration file.'); }
          return participantFound;
        },

        // parameters / results
        getParameters: function() { return _parameters; },

        getParameterData: function(param) {
          var t = getTrial(_currentTrialId);
          if(!t) { console.error('No current trial loaded.'); return null; }

          if(param!==undefined) {
            var index = _parameters.indexOf(param);
            if(index < 0) { console.error('Unknown parameter \''+param+'\''); return null; }
            return t.getParameterData(index);
          } else { return t.getParameterData(); }
        },

        getParameterIndex: function(param) { return _parameters.indexOf(param); },

        setResultHeader: function(header) { _resultHeader = header; },

        getResultHeader: function() { return _resultHeader; },

        setTimerHeader: function(header) { _timerHeader = header; },

        getTimerHeader: function() { return _timerHeader; },

        setOutputPath: function(path) { _outputFilePath = path; },

        // trials
        getCurrentTrialIndex: function() { return _currentTrialId; },

        getCurrentTrial: function() { return getTrial(_currentTrialId); },

        getTrialCount: function() { return _trials.length; },

        loadNextTrial: function() {
          _currentTrialId++;
          if (_trials.length <= _currentTrialId) { console.error("No more trial to load."); return null; }
          return _trials[_currentTrialId];
        },

        loadTrial: function(index) { var t = getTrial(index); if(t) { _currentTrialId = index; } },

        startTrial: function() { var t = getTrial(_currentTrialId); if(t) { t.startTrial(); } },

        endTrial: function() {
          var t = getTrial(_currentTrialId);
          if(t) {
            t.endTrial();
            if(_recordBehavior == RecordBehavior.SaveOnTrialEnd) { this.saveCurrentTrial(); }
          } else { console.error('No current trial!'); }
        },

        saveResultData: function(tag, data) {
          if(typeof(tag)!=='string' || typeof(data)!=='string') { console.error('Data should be saved in a string format.'); return; }
          var t = getTrial(_currentTrialId);
          if(t) { t.saveResultData(tag,data); }
        },

        getResultData: function(tag) {
          var t = getTrial(_currentTrialId);
          if(t) { return t.getResultData(tag); }
          return null;
        },

        addTimer: function(tag) {
          var t = getTrial(_currentTrialId);
          if(t) { return t.addTimer(tag); }
        },

        removeTimer: function(tag) {
          var t = getTrial(_currentTrialId);
          if(t) { return t.removeTimer(tag); }
        },

        startTimer: function(tag) {
          var t = getTrial(_currentTrialId);
          if(t) { return t.startTimer(tag); }
        },

        pauseTimer: function(tag) {
          var t = getTrial(_currentTrialId);
          if(t) { return t.pauseTimer(tag); }
        },

        resumeTimer: function(tag) {
          var t = getTrial(_currentTrialId);
          if(t) { return t.resumeTimer(tag); }
        },

        stopTimer: function(tag) {
          var t = getTrial(_currentTrialId);
          if(t) { return t.stopTimer(tag); }
        },

        getTimerDuration: function(tag) {
          var t = getTrial(_currentTrialId);
          if(t) { return t.getTimerDuration(tag); }
        },

        getTimerState: function(tag) {
          var t = getTrial(_currentTrialId);
          if(t) { return t.getTimerState(tag); }
          else { return null; }
        },

        saveCurrentTrial: function() {
          var t = _trials[_currentTrialId];

          if(!fs.existsSync(_outputFilePath)) {
            var data = _parameters.join(',');
            if(_resultHeader) { data += ','+_resultHeader.join(','); }
            data += ',TaskCompletionTime';
            if(_timerHeader) { data += ','+_timerHeader.join(','); }
            fs.writeFileSync(_outputFilePath, data+'\n', 'utf8');
          }

          // save parameters of this trial first
          var data = t.getParameterData().join(',');
          // save all results saved for this trial
          var resultData = t.getResultData();
          if (resultData) {
            if (_resultHeader != null) { for (var i in _resultHeader) { data += ',' + t.getResultData(_resultHeader[i]); } }
            // order does not matter if the results header was provided
            else { for (var k in resultData) { data += ',' + resultData[k]; } }
          }
          // always save main timer
          data += ',' + t.getMainDuration();
          // save all timers at the end
          if (_timerHeader) { for (var i in _timerHeader) { data += ',' + t.getTimerDuration(_timerHeader[i]); } }

          fs.appendFile(_outputFilePath, data+'\n', 'utf8', (err) => { if (err) { throw err; } });
        },

      }
    })(inputFilePath, participantId, trialId, participantColName);

    var loaded = exp.loadConfigurationFile();
    return loaded ? exp : null;
  }
}
