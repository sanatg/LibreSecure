import { AntDesign, Entypo } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import db from "./config";
import { doc, getDoc, setDoc } from "@firebase/firestore";

const gray = "#91A1BD";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Home() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const [IntruderTitle, setIntruderTitle] = useState("Device is safe!");
  const [IntruderSubtitle, setIntruderSubtitle] = useState("no one is using your device.");
  const [ButtonDisabled, setButtonDisabled] = useState(true);
  const [IntruderImg, setIntruderImg] = useState("https://raw.githubusercontent.com/sanatg/someimg/main/photo-1503023345310-bd7c1de61c7d.jpeg");
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
    // just once outside of  settimeintervel
    const CheckIfIntruderRepeated = setInterval(async () => {
      const docRef = doc(db, "user#UUW82", "intruderdecision");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("I exist");
        setIntruderTitle("Intruder Alert!");
        setIntruderSubtitle("Someone is using your device.");
        setIntruderImg(docSnap.data().image); // change this to the image of the intruder
        setButtonDisabled(false);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        setIntruderTitle("Device is safe!");
        setIntruderSubtitle("no one is using your device.");
        setButtonDisabled(true);
        
      }
    // every 0.5 min aka 30000 milliseconds
    }, 30000);

    // and clear this timer when the component is unmounted
    return function cleanup() {
      clearInterval(CheckIfIntruderRepeated);
    };

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // creating a neumorph for all the buttons
  const NeuMorph = ({ children, size, style }) => {
    return (
      <View>
        <View>
          <View
            style={[
              styles.inner,
              {
                width: size || 40,
                height: size || 40,
                borderRadius: size / 2 || 40 / 2,
              },
              style,
            ]}
          >
            {children}
          </View>
        </View>
      </View>
    );
  };
  return (
    <ScrollView>
    <View style={styles.container}>
      <SafeAreaView style={{ alignSelf: "stretch" }}>
        <View style={{ marginHorizontal: 32, marginTop: 32 }}>
          <View style={styles.topContainer}>
            <NeuMorph size={48}>
              <AntDesign name="logout" size={20} color={gray} />
            </NeuMorph>

            <View>
              <Text style={styles.title_app}>LIBRE SECURE</Text>
            </View>

            <NeuMorph size={48}>
              <Entypo name="menu" size={24} color={gray} />
            </NeuMorph>
          </View>
          <View style={styles.intruder_pic_container}>
            <NeuMorph size={300}>
              <Image
                source={{uri: IntruderImg}}
                style={styles.intruder_pic}
              />
            </NeuMorph>
          </View>

          <View style={styles.IntruderAlert}>
            <Text style={styles.IntruderAlertTitle}>{IntruderTitle}</Text>
            <Text style={styles.IntruderAlertSubtitle}>
              {IntruderSubtitle}
            </Text>
          </View>

          <View style={styles.SecureControls}>
            
            <TouchableOpacity disabled={ButtonDisabled} onPress={async () => {await UserDecision('reject');}}>
              <NeuMorph size={80}>
                <AntDesign name="minuscircleo" size={24} color="red" />
              </NeuMorph>
            </TouchableOpacity>
            
            <TouchableOpacity disabled={ButtonDisabled} onPress={async () => {await sendPushNotification(expoPushToken);}}>
              <NeuMorph
                size={80}
                style={{ backgroundColor: "#8AAAFF", borderColor: "#8AAAFF" }}
              >
                <AntDesign name="lock" size={24} color="white" />
              </NeuMorph>
            </TouchableOpacity>

            <TouchableOpacity disabled={ButtonDisabled} onPress={async () => {await UserDecision('accept');}}>
              <NeuMorph size={80}>
                <AntDesign name="doubleright" size={24} color="green" />
              </NeuMorph>
            </TouchableOpacity>

          </View>
        </View>
      </SafeAreaView>
    </View>
    </ScrollView>
  );

  function UserDecision(decision) {
      setDoc(doc(db, "user#UUW82", "intruderdecision"), {
        decision: {decision}
      }, { merge: true });
  }
  }
  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
  async function sendPushNotification(expoPushToken) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Intruder Alert",
      body: "There is someone using your computer open the app and check more info!!!",
      data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      setTimeout(async () =>{

        const docRef = doc(db, "userToken", "expoPushToken");
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          if (doc.data().expopushtoken != token) {
            const ExpoPushTokenCollectionDoc = doc(
              db,
              "userToken",
              "expoPushToken"
            );
            setDoc(
              ExpoPushTokenCollectionDoc,
              { expopushtoken: token},
              { merge: true }
            );
          }
        } else {
          await setDoc(doc(db, "userToken", "expoPushToken"), {
            expopushtoken: token
          });
        }
        
      }, 3000)
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DEE9FD",
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  inner: {
    backgroundColor: "#DEE9F7",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#E2ECFD",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: -6,
      height: -6,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },
  title_app: {
    color: gray,
    fontWeight: "bold",
  },
  intruder_pic_container: {
    marginVertical: 32,
    alignItems: "center",
  },
  intruder_pic: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderColor: "#D7E1F3",
    borderWidth: 10,
  },

  IntruderAlert: {
    alignItems: "center",
  },
  IntruderAlertTitle: {
    fontSize: 30,
    color: "#6C7A93",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  IntruderAlertSubtitle: {
    fontSize: 10,
    marginTop: 6,
    color: gray,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  SecureControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
  },
});
