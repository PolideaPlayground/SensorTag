// @flow

import { put, call } from "redux-saga/effects"
import { Device, Service, Characteristic, BleError } from "react-native-ble-plx"
import { log, logError } from "./Reducer"

export type SensorTagTestMetadata = {
  id: string,
  title: string,
  execute: (device: Device) => Generator<any, boolean, any>
}

export const SensorTagTests: { [string]: SensorTagTestMetadata } = {
  READ_ALL_CHARACTERISTICS: {
    id: "READ_ALL_CHARACTERISTICS",
    title: "Read all characteristics",
    execute: readAllCharacteristics
  },
  READ_TEMPERATURE: {
    id: "READ_TEMPERATURE",
    title: "Read temperature",
    execute: readTemperature
  }
}

function* readAllCharacteristics(device: Device): Generator<*, boolean, *> {
  try {
    const services: Array<Service> = yield call([device, device.services])
    for (const service of services) {
      yield put(log("Found service: " + service.uuid))
      const characteristics: Array<Characteristic> = yield call([
        service,
        service.characteristics
      ])
      for (const characteristic of characteristics) {
        if (characteristic.uuid == "00002a02-0000-1000-8000-00805f9b34fb")
          continue

        yield put(log("Found characteristic: " + characteristic.uuid))
        if (characteristic.isReadable) {
          yield put(log("Reading value..."))
          var c = yield call([characteristic, characteristic.read])
          yield put(log("Got base64 value: " + c.value))
          if (characteristic.isWritableWithResponse) {
            yield call(
              [characteristic, characteristic.writeWithResponse],
              c.value
            )
            yield put(log("Successfully written value back"))
          }
        }
      }
    }
  } catch (error) {
    yield put(logError(error))
    return false
  }

  return true
}

function* readTemperature(device: Device): Generator<*, boolean, *> {
  yield put(log("Read temperature"))
  return false
}
