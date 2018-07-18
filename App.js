import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  SafeAreaView,
  FlatList,
  Platform,
  Button
} from "react-native";
import { BleManager, Device, BleError, LogLevel } from "react-native-ble-plx";

type Props = {};

type State = {
  text: Array<string>
};

function arrayBufferToHex(buffer) {
  if (!buffer) return null;
  const values = new Uint8Array(buffer);
  var string = "";
  for (var i = 0; i < values.length; i += 1) {
    const num = values[i].toString(16);
    string += num.length == 1 ? "0" + num : num;
  }
  return string;
}

export default class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      text: []
    };
  }

  componentDidMount() {
    const manager = new BleManager();
    manager.onStateChange(newState => {
      if (newState != "PoweredOn") return;
      this._log("Started scanning...");
      manager.startDeviceScan(
        null,
        {
          allowDuplicates: true
        },
        (error, device) => {
          if (error) {
            this._logError("SCAN", error);
            return;
          }
          this._log("Device: " + device.name, device);
        }
      );
    }, true);
  }

  _log = (text: string, ...args) => {
    const message = "[" + Date.now() % 10000 + "] " + text;
    this.setState({
      text: [message, ...this.state.text]
    });
  };

  _logError = (tag: string, error: BleError) => {
    this._log(
      tag +
        "ERROR(" +
        error.errorCode +
        "): " +
        error.message +
        "\nREASON: " +
        error.reason +
        " (att: " +
        error.attErrorCode +
        ", ios: " +
        error.iosErrorCode +
        ", and: " +
        error.androidErrorCode +
        ")"
    );
  };

  delay = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  };

  render() {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <Button
          onPress={() => {
            this.setState({
              text: []
            });
          }}
          title={"Clear"}
        />
        <FlatList
          style={styles.container}
          data={this.state.text}
          renderItem={({ item }) => <Text> {item} </Text>}
          keyExtractor={(item, index) => index.toString()}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
