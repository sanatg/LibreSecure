# os library
import os
# computer vision libs
import cv2
import face_recognition
import face_recognition as fr
#cant explain this one
import numpy as np
# we use the sleep func to make the program wait for some time
from time import sleep
#enables the code to speak like google assistant 
import pyttsx3
#self explanatory
import datetime
# firebase
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import pyrebase 
#automating mouse and keyboar
import pyautogui

cred = credentials.Certificate("key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

assistant = pyttsx3.init('sapi5')
voices = assistant.getProperty('voices')
assistant.setProperty('voice',voices[1].id)

firebaseConfig = {
  'apiKey': "AIzaSyBJusUaBN2ZMKS8E5Dy4rBg-GbCzzU-mGc",
  'authDomain': "libre-ad313.firebaseapp.com",
  'databaseURL': "https://libre-ad313.firebaseio.com",
  'projectId': "libre-ad313",
  'storageBucket': "libre-ad313.appspot.com",
  'messagingSenderId': "982734233976",
  'appId': "1:982734233976:web:246d0cfeeb4a281504e88d",
  'measurementId': "G-5W45EBKQNG"
};
firebase=pyrebase.initialize_app(firebaseConfig)

#define storage
storage=firebase.storage()

def speak(audio):
    print(" ")
    assistant.say(audio)
    print(audio)
    assistant.runAndWait()

def get_encoded_faces():
    """
    looks through the faces folder and encodes all
    the faces

    :return: dict of (name, image encoded)
    """
    encoded = {}

    for dirpath, dnames, fnames in os.walk("./faces"):
        for f in fnames:
            if f.endswith(".jpg") or f.endswith(".png"):
                face = fr.load_image_file("faces/" + f)
                encoding = fr.face_encodings(face)[0]
                encoded[f.split(".")[0]] = encoding

    return encoded


def unknown_image_encoded(img):
    """
    encode a face given the file name
    """
    face = fr.load_image_file("faces/" + img)
    encoding = fr.face_encodings(face)[0]

    return encoding


def classify_face(im):
    """
    will find all of the faces in a given image and label
    them if it knows what they are

    :param im: str of file path
    :return: list of face names
    """
    faces = get_encoded_faces()
    faces_encoded = list(faces.values())
    known_face_names = list(faces.keys())

    img = cv2.imread(im, 1)
    #img = cv2.resize(img, (0, 0), fx=0.5, fy=0.5)
    #img = img[:,:,::-1]
 
    face_locations = face_recognition.face_locations(img)
    unknown_face_encodings = face_recognition.face_encodings(img, face_locations)

    face_names = []
    for face_encoding in unknown_face_encodings:
        # See if the face is a match for the known face(s)
        matches = face_recognition.compare_faces(faces_encoded, face_encoding)
        name = "Unknown"

        # use the known face with the smallest distance to the new face
        face_distances = face_recognition.face_distance(faces_encoded, face_encoding)
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            name = known_face_names[best_match_index]

        face_names.append(name)

        for (top, right, bottom, left), name in zip(face_locations, face_names):
            # Draw a box around the face
            cv2.rectangle(img, (left-20, top-20), (right+20, bottom+20), (255, 0, 0), 2)

            # Draw a label with a name below the face
            cv2.rectangle(img, (left-20, bottom -15), (right+20, bottom+20), (255, 0, 0), cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(img, name, (left -20, bottom + 15), font, 1.0, (255, 255, 255), 2)


    # Display the resulting image

            return face_names 


from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushServerError,
    PushTicketError,
)
import rollbar
from requests.exceptions import ConnectionError, HTTPError


# Basic arguments. You should extend this function with the push features you
# want to use, or simply pass in a `PushMessage` object.
def send_push_message(token,title, message, extra=None):
    try:
        response = PushClient().publish(
            PushMessage(to=token,
                        title=title,    
                        body=message,
                        data=extra))
    except PushServerError as exc:
        # Encountered some likely formatting/validation error.
        rollbar.report_exc_info(
            extra_data={
                'token': token,
                'title': title,
                'message': message,
                'extra': extra,
                'errors': exc.errors,
                'response_data': exc.response_data,
            })
        raise
    except (ConnectionError, HTTPError) as exc:
        # Encountered some Connection or HTTP error - retry a few times in
        # case it is transient.
        rollbar.report_exc_info(
            extra_data={'token': token,'title': title, 'message': message, 'extra': extra})
        raise Self.retry(exc=exc)

    try:
        # We got a response back, but we don't know whether it's an error yet.
        # This call raises errors so we can handle them with normal exception
        # flows.
        response.validate_response()
    except DeviceNotRegisteredError:
        # Mark the push token as inactive
        from notifications.models import PushToken
        PushToken.objects.filter(token=token).update(active=False)
    except PushTicketError as exc:
        # Encountered some other per-notification error.
        rollbar.report_exc_info(
            extra_data={
                'token': token,
                'title': title,
                'message': message,
                'extra': extra,
                'push_response': exc.push_response._asdict(),
            })
        raise self.retry(exc=exc)


def main():
    speak('matching faces')
    result = str(classify_face("test.jpg"))
    if result == "['Daksh']":
        speak("face synchronized")
        speak("Welcome Daksh")
        speak("system is fully innitialised and executable")
        db.collection('user#UUW82').document('intruderdecision').delete()
    else:
        speak("face not recognized")
        speak("reporting to the owner")
        storage.child('intruder').put("test.jpg")
        imgurl = storage.child('intruder').get_url(None)
        data = {'time': datetime.datetime.now(), 'decision':"", 'image':imgurl}
        db.collection('user#UUW82').document('intruderdecision').set(data)
        speak("waiting for conformation from the owner")
        usertoken = db.collection('userToken').document('expoPushToken').get().to_dict()
        #usertoken = 'ExponentPushToken[IjC2z6FENyi8YZZlytHP8Z]'
        usertoken = usertoken['expopushtoken']
        usertitle = "Intruder Alert!!"
        message = "Someone is using your device"
        send_push_message(usertoken,usertitle,message)
        wait_for_reply()

def wait_for_reply():
    while True:
        result = db.collection('user#UUW82').document('intruderdecision').get().to_dict()
        resultmain = result['decision']
        resultmain = str(resultmain)
        resultmain = resultmain.replace("{'decision': '","")
        resultmain = resultmain.replace("'}","")
        if resultmain == 'accept':
            speak("face accepted")
            db.collection('user#UUW82').document('intruderdecision').delete()
            break
        elif resultmain == 'reject':
            speak("face rejected")
            db.collection('user#UUW82').document('intruderdecision').delete()
            lock()
            break  
        else:
            sleep(3)
            print("waiting for reply")
            print(result)

def lock():
    pyautogui.keyDown('winleft')
    pyautogui.press('l')
    pyautogui.keyUp('winleft')


main()

# pip install pyrebase
