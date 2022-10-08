import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import "./App.scss";
import "@antv/graphin-icons/dist/index.css";
import { RecoilRoot } from "recoil";
import { ToastContainer } from "material-react-toastify";
import "material-react-toastify/dist/ReactToastify.css";
import { Web3ContextProvider } from "context/Web3Context";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <RecoilRoot>
    <Web3ContextProvider>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/dashboard/:category/:value" component={Dashboard} />
        </Switch>
      </BrowserRouter>
    </Web3ContextProvider>
    <ToastContainer position="top-right" />
  </RecoilRoot>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
