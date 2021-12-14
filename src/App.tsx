import { useState, useEffect } from "react";
import "./App.css";

function App() {
  interface event {
    sam: number;
    payload: string;
  }
  const [events, setEvents] = useState<event[]>([]);
  const [nextEventIndex, setNextEventIndex] = useState<number | null>(null);
  const [SAM, setSAM] = useState<number | null>(null);
  const [inputSAM, setInputSAM] = useState<number | null>(null);
  const [inputPayload, setInputPayload] = useState<string>("");
  const [changedSAM, setChangedSAM] = useState<number | null>(null);
  const [display, setDisplay] = useState<string>("");

  useEffect(() => {
    FetchEvents();
  }, []);

  useEffect(() => {
    if (events) {
      findNextEvent();
    }
  }, [events, SAM]);

  useEffect(() => {
    getSAM();
  }, []);

  //every second, adds 1 to the current SAM and checks if there is a match
  useEffect(() => {
    const interval = setInterval(() => {
      if (SAM == 86400) {
        setSAM(1);
      } else if (SAM) {
        SAM && setSAM(SAM + 1);
      }

      if (
        nextEventIndex != null &&
        events &&
        SAM == events[nextEventIndex].sam
      ) {
        setDisplay(events[nextEventIndex].payload);
        if (nextEventIndex + 1 < events.length) {
          setNextEventIndex(nextEventIndex + 1);
        } else {
          setNextEventIndex(null);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [SAM]);

  //converts the current time to SAM
  const getSAM = () => {
    const today = new Date();
    const hoursInSec = today.getHours() * 60 * 60;
    const minutesInSec = today.getMinutes() * 60;
    const SAM = hoursInSec + minutesInSec + today.getSeconds();
    setSAM(SAM);
  };

  //validates the inputs and submits new event to DB.
  const SubmitEvent = async () => {
    if ((inputSAM && inputSAM < 1) || (inputSAM && inputSAM > 86400)) {
      alert("SAM must be between 1 and 86400");
    } else if (
      (inputSAM && inputSAM % 3 != 0) ||
      (inputSAM && inputSAM % 5 != 0)
    ) {
      alert("SAM must be divisible by 15");
    } else if (inputPayload.length == 0) {
      alert("Message can not be empty!");
    } else {
      try {
        const event = {
          sam: inputSAM,
          payload: inputPayload,
        };
        console.log(JSON.stringify(event));
        const response = await fetch("http://localhost:5000/api/event", {
          headers: {
            "Content-Type": "application/json",
          },
          method: "post",
          body: JSON.stringify(event),
        });

        if (response.ok) {
          FetchEvents();
          setInputSAM(null);
          setInputPayload("");
        } else {
          throw new Error("Saving the event failed!");
        }
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const FetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/event", {
        method: "get",
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        throw new Error("Fetching events failed!");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  // finds the index of the next event from the events array /
  const findNextEvent = () => {
    if (SAM && events) {
      for (let i = 0; i < events.length; i++) {
        if (SAM < events[i].sam) {
          setNextEventIndex(i);

          break;
        }
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="submit-event">
          <input
            type="number"
            placeholder="SAM"
            value={inputSAM ? inputSAM : ""}
            onChange={(e) => setInputSAM(Number(e.target.value))}
          ></input>

          <input
            type="text"
            placeholder="Message"
            value={inputPayload}
            onChange={(e) => setInputPayload(e.target.value)}
          ></input>
          <button onClick={SubmitEvent}>Submit Event</button>
        </div>
        <div className="sam">
          <p className="current-sam">Current SAM: {SAM}</p>
          <input
            type="number"
            placeholder="Change current SAM to:"
            value={changedSAM ? changedSAM : ""}
            onChange={(e) => setChangedSAM(Number(e.target.value))}
          ></input>
          <button
            onClick={() => {
              setSAM(changedSAM);
              setChangedSAM(null);
            }}
          >
            Change SAM
          </button>
        </div>

        <p className="last-event-message">Last Event Message:</p>
        <input value={display} disabled className="display"></input>
        <div className="all-events">
          <p className="events-title">All Scheduled Events</p>
          <ul className="list">
            {events.length > 0 &&
              events.map((elem, index) => {
                return (
                  <li
                    className={index == nextEventIndex ? "upcoming" : ""}
                    key={index}
                  >
                    {elem.sam + " --- " + elem.payload}
                  </li>
                );
              })}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
