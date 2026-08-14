import bcrypt
from fastapi import APIRouter,Depends,HTTPException,status,Form
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
import datetime
import os
from dotenv import load_dotenv
from database import get_connection

load_dotenv()
SECRET_KEY=os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET KEY not loaded")
print("SECRET KEY loaded")

security=HTTPBearer()
router=APIRouter()


class Add_user(BaseModel):
    username:str
    password:str

@router.post("/signup")
def user_add(user_data:Add_user):
    username=user_data.username
    password=user_data.password
    passwordHash=password.encode('utf-8')
    hashed_password=bcrypt.hashpw(passwordHash,bcrypt.gensalt())
    connection=get_connection()
    cursor=connection.cursor()
    cursor.execute("INSERT INTO users (username,password_hash) VALUES (%s,%s)",(username,hashed_password))
    connection.commit()
    connection.close()
    return {"message":"user added"}

from fastapi import HTTPException, Form

@router.post("/login")
def user_login(
    username: str = Form(...),
    password: str = Form(...)
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT id, username, password_hash, role FROM users WHERE username=%s",
        (username,)
    )

    user_row = cursor.fetchone()

    if user_row is None:
        connection.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid username/password"
        )

    stored_hash = user_row[2]

    if isinstance(stored_hash, str):
        stored_hash = stored_hash.encode("utf-8")

    password_byte = password.encode("utf-8")

    if bcrypt.checkpw(password_byte, stored_hash):
        user_id = user_row[0]
        user_name = user_row[1]
        user_role = user_row[3]

        token = generate_token(user_id, user_name, user_role)

        connection.close()

        return {
            "message": "login success",
            "access_token": token,
            "token_type": "Bearer"
        }

    connection.close()

    raise HTTPException(
        status_code=401,
        detail="Invalid username/password"
    )

def generate_token(user_id:int,user_name:str,user_role:str):
#payload creation
    payload={
        "userId":user_id,
        "userName":user_name,
        "userRole":user_role,
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