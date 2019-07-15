// @flow

import React from "react";
import { Provider } from "react-redux";
import { store } from "./Store";
import SensorTag from "./SensorTag";

export default function App() {
  return (
    <Provider store={store}>
      <SensorTag />
    </Provider>
  );
}
