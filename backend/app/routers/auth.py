from fastapi import APIRouter, Depends, HTTPException, Request, Body, Header, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserOut
from app.crud.user import create_user, get_user_by_email
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.auth.auth import verify_password, create_access_token, create_refresh_token
from app.utils.security import parse_device_from_user_agent, verify_recaptcha, create_email_token, verify_email_token
from fastapi.responses import JSONResponse
from app.models.token import RefreshToken
from datetime import datetime, timedelta
from user_agents import parse
from fastapi import Cookie
from app.auth.auth import get_current_user
#from app.utils.mailer import send_confirmation_email
from app.auth.firebase_verify import get_current_firebase_user, verify_firebase_token
from app.models.user import User
from app.firebase_admin import auth
from app.models.ticket import Ticket, TicketStatus
from app.schemas.auth_register import FirebaseRegisterRequest
from app.crud import user as crud_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

from sqlalchemy.exc import IntegrityError

def _make_unique_username(db: Session, base: str) -> str:
    base = (base or "").strip()
    if not base:
        base = "user"

    # foarte important: limite + curatare minima
    base = base[:40]

    candidate = base
    i = 0
    while True:
        exists = db.query(User).filter(User.username == candidate).first()
        if not exists:
            return candidate
        i += 1
        candidate = f"{base}_{i}"
        if len(candidate) > 50:
            candidate = candidate[:50]


#old register, using local
# @router.post("/register", response_model=UserOut)
# async def register_user(user: UserCreate, db: Session = Depends(get_db), captcha_token: str = Body(..., embed = True), background_tasks: BackgroundTasks = Depends()) :
#     if not verify_recaptcha(captcha_token):
#         raise HTTPException(status_code=400, detail="Captcha verification failed")
#     #check user exists    
#     db_user = get_user_by_email(db, user.email)
#     if db_user:
#         raise HTTPException(status_code=400, detail="Email already registered")
#     #create inactive user
#     new_user = create_user(db, user, is_active=False)
#     token = create_email_token(db, user)
#     background_tasks.add_task(send_confirmation_email, new_user.email, token)
#     return new_user@router.post("/register/firebase", response_model=FirebaseAuthResponse)
def register_firebase_user(
    payload: FirebaseRegisterRequest,
    user_data: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db),
):
    email = user_data.get("email")
    firebase_uid = user_data.get("uid")

    if not firebase_uid or not email:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # cauta user dupa firebase_uid (mai stabil) sau email
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    if not user:
        base_username = (payload.username or email.split("@")[0]).strip()
        username = _make_unique_username(db, base_username)

        user = User(
            email=email,
            username=username,
            firebase_uid=firebase_uid,
            first_name=payload.first_name,
            last_name=payload.last_name,
        )
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            # retry simplu: regenereaza username (race condition)
            username = _make_unique_username(db, f"{base_username}_1")
            user.username = username
            db.add(user)
            db.commit()
        db.refresh(user)
    else:
        # update “non-destructiv”: seteaza doar daca payload are valori
        changed = False

        if user.firebase_uid is None:
            user.firebase_uid = firebase_uid
            changed = True

        # daca user nu are username set (la tine e NOT NULL, deci probabil exista),
        # dar las aici ca safety
        if not user.username:
            base_username = (payload.username or email.split("@")[0]).strip()
            user.username = _make_unique_username(db, base_username)
            changed = True

        if payload.first_name is not None and payload.first_name != user.first_name:
            user.first_name = payload.first_name
            changed = True

        if payload.last_name is not None and payload.last_name != user.last_name:
            user.last_name = payload.last_name
            changed = True

        if changed:
            db.commit()
            db.refresh(user)

    return {
        "ok": True,
        "user": {
            "firebase_uid": user.firebase_uid,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
        },
    }

#old login, using local jwt
# @router.post("/login")
# async def login_user(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db), x_captcha_token: str = Header(None)):
    
#     if not x_captcha_token or not await verify_recaptcha(x_captcha_token):
#         raise HTTPException(status_code=400, detail="Captcha verification failed")

    
#     user = get_user_by_email(db, form_data.username)
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

#     access_token = create_access_token({"sub": user.email})
#     refresh_token = create_refresh_token({"sub": user.email})

#     response = JSONResponse(content={
#         "access_token": access_token,
#         "token_type": "bearer"
#     })

#     response.set_cookie(
#         key="refresh_token",
#         value=refresh_token,
#         httponly=True,
#         secure=False,
#         samesite="lax",      #"none" if frontend and backend on different domains
#         max_age= 60*60*24*7, #in seconds
#         path="/"
#     )

#     ip = request.client.host
#     user_agent = request.headers.get("user-agent")
#     device_name = parse_device_from_user_agent(user_agent)
#     db_token = RefreshToken(
#             user_id=user.user_id,
#             token=refresh_token,
#             ip_address=ip,
#             user_agent=user_agent,
#             device_name=device_name,
#             expires_at=datetime.utcnow() + timedelta(days=7)
#         )
    

#     db.add(db_token)
#     db.commit()
#     return response


# @router.post("/refresh")
# def refresh_token(
#     request: Request,
#     db: Session = Depends(get_db),
#     refresh_token: str = Cookie(None),
# ):
#     if not refresh_token:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Missing refresh token",
#         )

#     db_token = db.query(RefreshToken).filter_by(token=refresh_token).first()
#     if not db_token:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid refresh token",
#         )

#     if db_token.expires_at < datetime.utcnow():
#         db.delete(db_token)
#         db.commit()
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Refresh token expired",
#         )

#     # rotate tokens
#     user = db_token.user
#     access_token = create_access_token({"sub": user.email})
#     new_refresh_token = create_refresh_token({"sub": user.email})

#     db.delete(db_token)
#     db.commit()   # ✅ actually commit here

#     new_db_token = RefreshToken(
#         user_id=user.user_id,
#         token=new_refresh_token,
#         ip_address=db_token.ip_address,
#         user_agent=db_token.user_agent,
#         device_name=db_token.device_name,
#         expires_at=datetime.utcnow() + timedelta(days=7),
#     )
#     db.add(new_db_token)
#     db.commit()

#     # send cookie + response
#     response = JSONResponse(
#         content={
#             "access_token": access_token,
#             "token_type": "bearer",
#         }
#     )
#     response.set_cookie(
#         key="refresh_token",
#         value=new_refresh_token,
#         httponly=True,
#         secure=False,   # ⚠️ set True in prod (HTTPS)
#         samesite="lax",
#         max_age=60 * 60 * 24 * 7,
#         path="/",       # ✅ cookie works site-wide
#     )

#     return response

@router.post("/login/firebase")
async def firebase_login(
    user_data: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db)
):
    """
    Logs in a Firebase-authenticated user.
    Verifies the JWT from Authorization header and ensures user exists locally.
    """
    email = user_data.get("email")
    firebase_uid = user_data.get("uid")

    if not email or not firebase_uid:
        raise HTTPException(status_code=400, detail="Invalid Firebase token payload")

    # Ensure user exists in the local database
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Generate username from email (take part before @)
        username = email.split("@")[0]
        # Ensure username is unique
        username_count = db.query(User).filter(User.username.like(f"{username}%")).count()
        if username_count > 0:
            username = f"{username}_{username_count}"
        
        user = User(
            email=email,
            username=username,
            firebase_uid=firebase_uid
        )
        db.add(user)
        db.commit()

    return {
        "message": "Login successful",
        "email": email,
        "uid": firebase_uid,
    }


@router.get("/profile")
async def get_profile(user_data: dict = Depends(get_current_firebase_user)):
    """Protected route – only accessible to valid Firebase users."""
    return {
        "uid": user_data["uid"],
        "email": user_data.get("email"),
        "message": "Firebase-authenticated access successful",
    }