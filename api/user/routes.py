from flask import Blueprint, jsonify

user = Blueprint('user', __name__, url_prefix="/user")

@user.route('/')
def getUser():
    user = {"name": "Bob"}

    # need interaction with core server

    return user

@user.route('/', methods=["POST"])
def createUser():
    user = {"name": "Bob"}

    # need interaction with core server

    return user

@user.route('/', methods=["PUT"])
def editUser():
    # need interaction with core server
    return "Hello!"

@user.route('/', methods=["DELETE"])
def deleteUser():
    # need interaction with core server
    user = {"name": "Bob"}
    return True