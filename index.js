import ReactDOM from "react-dom";
import React from "react";
import "antd/dist/antd.css";
import "./index.css";
import Board from "./Board";
import Detail from "./Detail";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route path="/detail/:id">
            <Detail />
          </Route>
          <Route path="/">
            <Board />
          </Route>
        </Switch>
      </Router>
    </>
  );
}

const app = document.createElement("div");
app.id = "app";
document.querySelector("body").appendChild(app);

ReactDOM.render(<App />, app);
