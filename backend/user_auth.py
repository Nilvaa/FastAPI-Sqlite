import bcrypt
import re
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

PASSWORD_REGEX = r"^(?!.*\s)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$"
class Add_user(BaseModel):
    username:str
    password:str

@router.post("/signup")
def user_add(user_data: Add_user):
    username = user_data.username
    password = user_data.password

    if not username.strip():
        raise HTTPException(
            status_code=400,
            detail="username cannot be empty"
        )
    if re.search(r"\s",username):
        raise HTTPException(
                status_code=400,
                detail="username cannot contain spaces"
                )
    if not re.fullmatch(PASSWORD_REGEX,password):
        raise HTTPException(
                status_code=400,
                detail="Password must be at least 8 characters and contain "
                        "uppercase, lowercase, number and special character. "
                        "Spaces are not allowed."
                )
    passwordHash = password.encode('utf-8')
    hashed_password = bcrypt.hashpw(passwordHash, bcrypt.gensalt()).decode('utf-8')  # ← added .decode('utf-8')
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO users (username, password_hash, role)
            VALUES (%s, %s, %s)
            """,
            (username, hashed_password, "user")
        )
        connection.commit()
        return {"message": "user added"}
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=400,
            detail="username already exists"
        )
    finally:
        cursor.close()
        connection.close()
    


@router.post("/login")
def user_login(
    username: str = Form(...),
    password: str = Form(...)
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT id, username, password_hash, role
            FROM users
            WHERE username = %s
            """,
            (username,)
        )

        user_row = cursor.fetchone()

        if user_row is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid username/password"
            )

        stored_hash = user_row[2]

        # PostgreSQL BYTEA may be returned as memoryview
        if isinstance(stored_hash, memoryview):
            stored_hash = stored_hash.tobytes()

        elif isinstance(stored_hash, str):
            stored_hash = stored_hash.encode("utf-8")

        password_bytes = password.encode("utf-8")

        if not bcrypt.checkpw(password_bytes, stored_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid username/password"
            )

        user_id = user_row[0]
        user_name = user_row[1]
        user_role = user_row[3]

        token = generate_token(
            user_id,
            user_name,
            user_role
        )

        return {
            "message": "login success",
            "access_token": token,
            "token_type": "Bearer"
        }

    finally:
        cursor.close()
        connection.close()

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