import sqlite3
import bcrypt
from fastapi import APIRouter,Depends,HTTPException,status
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
import datetime
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY=os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET KEY not loaded")
print("SECRET KEY loaded")

security=HTTPBearer()
router=APIRouter()

def user_table():
    try:
        connection=sqlite3.connect("inventory.db")
        cursor=connection.cursor()
        table="""
        CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
        );
        """
        cursor.execute(table) 
        connection.commit()
        connection.close()
        print("user table created")  
    except Exception as e:
        print("exception",e)
        
user_table() 

class Add_user(BaseModel):
    username:str
    password:str

@router.post("/signup")
def user_add(user_data:Add_user):
    username=user_data.username
    password=user_data.password
    passwordHash=password.encode('utf-8')
    hashed_password=bcrypt.hashpw(passwordHash,bcrypt.gensalt())
    connection=sqlite3.connect("inventory.db")
    cursor=connection.cursor()
    cursor.execute("INSERT INTO users (username,password_hash) VALUES (?,?)",(username,hashed_password))
    connection.commit()
    connection.close()
    return {"message":"user added"}

@router.post("/login")
def user_login(username:str,password:str):
    connection=sqlite3.connect("inventory.db")
    cursor=connection.cursor()
    cursor.execute("SELECT id,username,password_hash FROM users WHERE username=?",(username,))
    user_row=cursor.fetchone()

    if user_row is None:
        return "Login failed"
    
    stored_hash=user_row[2]
    password_byte=password.encode('utf-8')

    if bcrypt.checkpw(password_byte,stored_hash):
        user_id=user_row[0]
        user_name=user_row[1]
        token=generate_token(user_id,user_name)
        return {
            "message":"login success",
            "access_token":token,
            "token_type":"Bearer"
            }
    else:
        return {"message":"invalid credentials"}


def generate_token(user_id:int,user_name:str):
#payload creation
    payload={
        "userId":user_id,
        "userName":user_name,
        "exp":datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=60)
    }
    secret_key=SECRET_KEY
    token=jwt.encode(payload,secret_key,algorithm="HS256")
    return token

def decode_verify_token(credentials:HTTPAuthorizationCredentials=Depends(security)):
    try:
        token=credentials.credentials
        decoded_payload=jwt.decode(token,SECRET_KEY,algorithms=["HS256"])
        print("token valid")
        return decoded_payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,detail="token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid token"
                )

@router.get("/protected-route")
def read_protected_data(current_user:dict=Depends(decode_verify_token)):
    return {
        "message":"access granted",
        "user data":current_user
    }