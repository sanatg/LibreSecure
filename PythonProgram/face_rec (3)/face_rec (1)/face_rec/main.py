import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate("Key.json")
firebase_admin.initialize_app(cred)

db = firestore.client() # create a document reference

def sign_up():  # create a new user
    loggedin = False
    ask = input('new user?')
    if ask == 'yes':
        print("Welcome")
        email = input('email id')
        password = input('password')
        info = {'username':email, 'password': password}
        check = db.collection('users').document(email).get()
        if check.exists:
            print('Username alreay taken')
            signed_up = False
            sign_up()
        else:
            db.collection('users').document(email).set(info)
            print("Signup Successful")
            signed_up = True
            text_file = open("creds.txt", "w")
            text_file.write(email +","+ password) 
            text_file.close()
            print("Credentials saved")
    else:
        login()

def auto_login():
    print("Welcome")
    text_file = open("creds.txt", "r")
    data = text_file.read().split(",")
    email = data[0]
    password = data[1]
    account = db.collection('users').document(email).get()
    if account.exists:
        print(account.to_dict())
        print("Login Successful")
        loggedin = True
        print(email)
        print(password)
    
    else:
        sign_up()
    text_file.close()

def login():
    loggedin = False
    print("Welcome")
    email = input('email id')
    password = input('password')
    account = db.collection('users').document(email).get()
    if account.exists:
        if account.to_dict()['password'] == password:
            print("Login Successful")
            loggedin = True
            text_file = open("creds.txt", "w")
            text_file.write(email +","+ password) 
            text_file.close()
            print("Credentials saved")
            print(email)
            print(password)

try:
    text_file = open("creds.txt", "r")
    text_file.close()
    auto_login()
except:
    sign_up()


