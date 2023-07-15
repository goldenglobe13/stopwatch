import { useEffect, useReducer } from "react";
import "./StopWatch.css";
import { CSSTransition, TransitionGroup } from "react-transition-group";

let timesObj = [];
let listClassAnimation = "listContainer";

const defaultTimer = (
  <>
    <div className="twoD">00</div>
    <div className="oneD">:</div>
    <div className="twoD">00</div>
    <div className="oneD">:</div>
    <div className="twoD">00</div>
    <div className="oneD">.</div>
    <div className="threeD">000</div>
  </>
);

function dateToString(date) {
  const hours = Math.floor((date % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((date % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((date % (1000 * 60)) / 1000);
  const cents = Math.floor(date % 1000);
  return (
    <>
      <div className="twoD">{`${hours < 10 ? "0" : ""}${hours}`}</div>
      <div className="oneD">:</div>
      <div className="twoD">{`${minutes < 10 ? "0" : ""}${minutes}`}</div>
      <div className="oneD">:</div>
      <div className="twoD">{`${seconds < 10 ? "0" : ""}${seconds}`}</div>
      <div className="oneD">.</div>
      <div className="threeD">{`${
        cents < 100 ? (cents < 10 ? "00" : "0") : ""
      }${cents}`}</div>
    </>
  );
}

function dateAndTimeToString(date) {
  return `${date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  })}:${
    date.getTime() % 1000 < 100 ? (date.getTime() % 1000 < 10 ? "00" : "0") : ""
  }${date.getTime() % 1000}`;
}

const initialState = {
  timer: defaultTimer,
  start: false,
  savedTime: [],
  initial: true,
  paused: false,
  action: [],
  newLaps: [],
  newTotalTime: [],
  sort: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "timer/ready":
      return {
        ...state,
        timer: defaultTimer,
        start: false,
        savedTime: [],
        initial: true,
        paused: false,
        action: [],
        newLaps: [],
        newTotalTime: [],
      };
    case "timer/start":
      return {
        ...state,
        start: true,
        initial: false,
        newLaps: [...state.newLaps, 0],
        newTotalTime: [...state.newTotalTime, 0],
        action: [...state.action, "start"],
        savedTime: [...state.savedTime, new Date()],
        paused: false,
      };
    case "timer/working":
      return {
        ...state,
        start: true,
        timer: dateToString(
          new Date() -
            state.savedTime[state.savedTime.length - 1] +
            state.newLaps.reduce((prev, cur) => prev + cur, 0)
        ),
      };
    case "timer/paused":
      return {
        ...state,
        start: false,
        timer: dateToString(
          new Date() -
            state.savedTime[state.savedTime.length - 1] +
            state.newLaps.reduce((prev, cur) => prev + cur, 0)
        ),
        action: [...state.action, "lap", "paused"],
        newLaps: [
          ...state.newLaps,
          new Date() - state.savedTime[state.savedTime.length - 1],
          0,
        ],
        newTotalTime: [
          ...state.newTotalTime,
          new Date() -
            state.savedTime[state.savedTime.length - 1] +
            state.newLaps.reduce((prev, cur) => prev + cur, 0),
          0,
        ],
        savedTime: [...state.savedTime, new Date(), new Date()],
        paused: true,
      };
    case "timer/lap":
      return {
        ...state,
        action: [...state.action, "lap"],
        savedTime: [...state.savedTime, new Date()],
        newLaps: [
          ...state.newLaps,
          new Date() - state.savedTime[state.savedTime.length - 1],
        ],
        newTotalTime: [
          ...state.newTotalTime,
          new Date() -
            state.savedTime[state.savedTime.length - 1] +
            state.newLaps.reduce((prev, cur) => prev + cur, 0),
        ],
        paused: false,
      };
    case "timer/sort":
      return {
        ...state,
        sort: state.sort ? false : true,
      };
    default:
      throw new Error("Action unkonwn");
  }
}

const StopWatch = () => {
  const [
    {
      timer,
      start,
      newLaps,
      newTotalTime,
      initial,
      paused,
      savedTime,
      action,
      sort,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  function startHandler(e) {
    e.preventDefault();
    if (start) {
      dispatch({ type: "timer/paused" });
    } else {
      dispatch({ type: "timer/start" });
    }
  }

  function lapHandler(e) {
    e.preventDefault();
    dispatch({ type: "timer/lap" });
  }

  function resetHandler(e) {
    e.preventDefault();
    dispatch({ type: "timer/ready" });
  }

  function sortHandler() {
    dispatch({
      type: "timer/sort",
    });
    listClassAnimation = "listContainer flip";
    setTimeout(() => {
      listClassAnimation = "listContainer";
    }, 700);
  }

  useEffect(() => {
    let x = setInterval(() => {
      if (initial) {
        dispatch({ type: "timer/ready" });
        return;
      }
      if (!start && !initial) {
        return;
      } else {
        dispatch({
          type: "timer/working",
        });
      }
    }, 10);
    return () => clearInterval(x);
  }, [initial, start, newLaps, savedTime]);

  timesObj = savedTime.map((item, i) => {
    return {
      id: i,
      action: action[i],
      lap: newLaps[i] === 0 ? "-" : dateToString(newLaps[i]),
      totalTime: newTotalTime[i] === 0 ? "-" : dateToString(newTotalTime[i]),
      recordedTime: dateAndTimeToString(savedTime[i]),
    };
  });
  sort && timesObj.sort((a, b) => (a.id < b.id ? 1 : -1));

  return (
    <CSSTransition
      in={true}
      appear={true}
      timeout={300}
      classNames="bigContainerTrans"
    >
      <div className="bigContainer">
        <div className="timerContainer">
          <div className="timer">{timer}</div>
          <div className="controllerContainer">
            <button
              className={`btn-scale start ${start ? "stop" : ""}`}
              onClick={startHandler}
            >
              {start
                ? "stop"
                : savedTime[savedTime.length - 1] > 0
                ? "continue"
                : "start"}
            </button>
            <button className="btn-scale reset" onClick={resetHandler}>
              reset
            </button>
            <button
              className="btn-scale lap"
              onClick={lapHandler}
              disabled={initial || paused}
            >
              lap
            </button>
          </div>
        </div>

        <ul>
          <input
            type="checkbox"
            id="sort"
            name="sort"
            value={sort}
            onChange={sortHandler}
          />
          <label htmlFor="sort">Reverse order</label>
          <li className="listContainer">
            <div>Label</div>
            <div>Interval</div>
            <div>Total</div>
            <div>Time Recorded</div>
          </li>
          <TransitionGroup>
            {timesObj.map((item, i) => (
              <CSSTransition key={item.id} timeout={700} classNames="listTrans">
                <li key={item.id} className={listClassAnimation}>
                  <div>
                    {item.action}
                    {/* <input type="text" defaultValue={action[i]} /> */}
                  </div>
                  <div className="timer timerSmall">{item.lap}</div>
                  <div className="timer timerSmall">{item.totalTime}</div>
                  <div>{item.recordedTime}</div>
                </li>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </ul>
      </div>
    </CSSTransition>
  );
};

export default StopWatch;
