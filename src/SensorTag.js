// @flow

import React, { Component } from "react";
import { connect as reduxConnect } from "react-redux";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  StatusBar
} from "react-native";
import {
  type ReduxState,
  clearLogs,
  connect,
  disconnect,
  executeTest,
  forgetSensorTag,
  ConnectionState
} from "./Reducer";
import { Device } from "react-native-ble-plx";
import { SensorTagTests, type SensorTagTestMetadata } from "./Tests";

const Button = function(props) {
  const { onPress, title, ...restProps } = props;
  return (
    <TouchableOpacity onPress={onPress} {...restProps}>
      <Text
        style={[
          styles.buttonStyle,
          restProps.disabled ? styles.disabledButtonStyle : null
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

type Props = {
  sensorTag: ?Device,
  connectionState: $Keys<typeof ConnectionState>,
  logs: Array<string>,
  clearLogs: typeof clearLogs,
  connect: typeof connect,
  disconnect: typeof disconnect,
  executeTest: typeof executeTest,
  currentTest: ?string,
  forgetSensorTag: typeof forgetSensorTag
};

type State = {
  showModal: boolean
};

class SensorTag extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  sensorTagStatus(): string {
    switch (this.props.connectionState) {
      case ConnectionState.CONNECTING:
        return "Connecting...";
      case ConnectionState.DISCOVERING:
        return "Discovering...";
      case ConnectionState.CONNECTED:
        return "Connected";
      case ConnectionState.DISCONNECTED:
      case ConnectionState.DISCONNECTING:
        if (this.props.sensorTag) {
          return "Found " + this.props.sensorTag.id;
        }
    }

    return "Searching...";
  }

  isSensorTagReadyToConnect(): boolean {
    return (
      this.props.sensorTag != null &&
      this.props.connectionState === ConnectionState.DISCONNECTED
    );
  }

  isSensorTagReadyToDisconnect(): boolean {
    return this.props.connectionState === ConnectionState.CONNECTED;
  }

  isSensorTagReadyToExecuteTests(): boolean {
    return (
      this.props.connectionState === ConnectionState.CONNECTED &&
      this.props.currentTest == null
    );
  }

  renderHeader() {
    return (
      <View style={{ padding: 10 }}>
        <Text style={styles.textStyle} numberOfLines={1}>
          SensorTag: {this.sensorTagStatus()}
        </Text>
        <View style={{ flexDirection: "row", paddingTop: 5 }}>
          <Button
            disabled={!this.isSensorTagReadyToConnect()}
            style={{ flex: 1 }}
            onPress={() => {
              if (this.props.sensorTag != null) {
                this.props.connect(this.props.sensorTag);
              }
            }}
            title={"Connect"}
          />
          <View style={{ width: 5 }} />
          <Button
            disabled={!this.isSensorTagReadyToDisconnect()}
            style={{ flex: 1 }}
            onPress={() => {
              this.props.disconnect();
            }}
            title={"Disconnect"}
          />
        </View>
        <View style={{ flexDirection: "row", paddingTop: 5 }}>
          <Button
            disabled={!this.isSensorTagReadyToExecuteTests()}
            style={{ flex: 1 }}
            onPress={() => {
              this.setState({ showModal: true });
            }}
            title={"Execute test"}
          />
          <View style={{ width: 5 }} />
          <Button
            style={{ flex: 1 }}
            disabled={this.props.sensorTag == null}
            onPress={() => {
              this.props.forgetSensorTag();
            }}
            title={"Forget"}
          />
        </View>
      </View>
    );
  }

  renderLogs() {
    return (
      <View style={{ flex: 1, padding: 10, paddingTop: 0 }}>
        <FlatList
          style={{ flex: 1 }}
          data={this.props.logs}
          renderItem={({ item }) => (
            <Text style={styles.logTextStyle}> {item} </Text>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <Button
          style={{ paddingTop: 10 }}
          onPress={() => {
            this.props.clearLogs();
          }}
          title={"Clear logs"}
        />
      </View>
    );
  }

  renderModal() {
    // $FlowFixMe: SensorTagTests are keeping SensorTagTestMetadata as values.
    const tests: Array<SensorTagTestMetadata> = Object.values(SensorTagTests);

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.showModal}
        onRequestClose={() => {}}
      >
        <View
          style={{
            backgroundColor: "#00000060",
            flex: 1,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <View
            style={{
              backgroundColor: "#a92a35",
              borderRadius: 10,
              height: "50%",
              padding: 5,
              shadowColor: "black",
              shadowRadius: 20,
              shadowOpacity: 0.9,
              elevation: 20
            }}
          >
            <Text
              style={[
                styles.textStyle,
                { paddingBottom: 10, alignSelf: "center" }
              ]}
            >
              Select test to execute:
            </Text>
            <FlatList
              data={tests}
              renderItem={({ item }) => (
                <Button
                  style={{ paddingBottom: 5 }}
                  disabled={!this.isSensorTagReadyToExecuteTests()}
                  onPress={() => {
                    this.props.executeTest(item.id);
                    this.setState({ showModal: false });
                  }}
                  title={item.title}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            <Button
              style={{ paddingTop: 5 }}
              onPress={() => {
                this.setState({ showModal: false });
              }}
              title={"Cancel"}
            />
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5a070f" />
        {this.renderHeader()}
        {this.renderLogs()}
        {this.renderModal()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a92a35",
    padding: 5
  },
  textStyle: {
    color: "white",
    fontSize: 20
  },
  logTextStyle: {
    color: "white",
    fontSize: 9
  },
  buttonStyle: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    backgroundColor: "#af3c46",
    color: "white",
    textAlign: "center",
    fontSize: 20
  },
  disabledButtonStyle: {
    backgroundColor: "#614245",
    color: "#919191"
  }
});

export default reduxConnect(
  (state: ReduxState): $Shape<Props> => ({
    logs: state.logs,
    sensorTag: state.activeSensorTag,
    connectionState: state.connectionState,
    currentTest: state.currentTest
  }),
  {
    clearLogs,
    connect,
    disconnect,
    forgetSensorTag,
    executeTest
  }
)(SensorTag);
