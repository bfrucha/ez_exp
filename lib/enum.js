if(!EzExp) {
  /** Namespace of the EzExp module
  * @namespace
  */
  var EzExp = {};
}

/** Enumerators used in the EzExp module.
* @namespace
*/
EzExp.Enums = {
  /** Different states used by EzExp trials.
  * @readonly
  * @enum {number}
  */
  TrialState: { NotStarted: 0, Started: 1, Ended: 2 },

  /** Different states used by EzExp timers.
  * @readonly
  * @enum {number}
  */
  TimerState: { NotStarted: 0, Started: 1, Paused: 2, Stopped: 3 },

  /** Behavior used by EzExp to record output files.
  * @readonly
  * @enum {number}
  */
  RecordBehavior: { SaveOnTrialEnd: 0, SaveOnUserDemand: 1 }
}
