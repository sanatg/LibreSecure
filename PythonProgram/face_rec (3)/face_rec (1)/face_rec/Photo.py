#// open webcam and take a picture and save it

def main():
    import cv2
    import numpy as np
    import os
    import time

    # initialize the camera
    cap = cv2.VideoCapture(0)

    # take a picture
    ret, frame = cap.read()

    # save the picture
    cv2.imwrite('C:/Users/DAKSH AGGARWAL/Downloads/face_rec (1)/face_rec/Test.jpg', frame)

    # close the camera
    cap.release()

    # open the saved picture
    img = cv2.imread('C:/Users/DAKSH AGGARWAL/Downloads/face_rec (1)/face_rec/Test.jpg')

    # show the picture
    cv2.imshow('image', img)
    cv2.waitKey(10)
    cv2.destroyAllWindows()

main()