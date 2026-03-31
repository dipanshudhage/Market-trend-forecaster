from fastapi import APIRouter, HTTPException
from app.schemas.user import UserCreate, UserLogin
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.database import users_collection
from datetime import timedelta

router = APIRouter()


# ========================
# 🔐 SIGNUP
# ========================
@router.post("/signup")
async def signup(user: UserCreate):
    try:
        username = user.username.strip()
        email = user.email.strip().lower()

        # check existing user
        existing_user = await users_collection.find_one({
            "$or": [
                {"username": username},
                {"email": email}
            ]
        })

        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        # hash password
        hashed_password = get_password_hash(user.password)

        # convert user object
        user_dict = user.model_dump()
        user_dict.pop("password", None)

        user_dict["username"] = username
        user_dict["email"] = email
        user_dict["full_name"] = user.full_name.strip() if user.full_name else None
        user_dict["hashed_password"] = hashed_password

        # insert into DB
        result = await users_collection.insert_one(user_dict)

        return {
            "message": "Signup successful",
            "user_id": str(result.inserted_id)
        }

    except Exception as e:
        print("SIGNUP ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ========================
# 🔐 LOGIN
# ========================
@router.post("/login")
async def login(user: UserLogin):
    try:
        identifier = user.username.strip()

        # search by username OR email
        db_user = await users_collection.find_one({
            "$or": [
                {"username": identifier},
                {"email": {"$regex": f"^{identifier}$", "$options": "i"}}
            ]
        })

        if not db_user:
            raise HTTPException(status_code=400, detail="User not found")

        # verify password
        if not verify_password(user.password, db_user["hashed_password"]):
            raise HTTPException(status_code=400, detail="Invalid password")

        # create token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        access_token = create_access_token(
            data={"sub": db_user["username"]},
            expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(db_user["_id"]),
                "username": db_user["username"],
                "email": db_user["email"],
                "full_name": db_user.get("full_name"),
                "avatar_url": db_user.get("avatar_url"),
                "banner_url": db_user.get("banner_url")
            }
        }

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
