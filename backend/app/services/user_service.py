from typing import Optional

from app.utils import is_valid_email_address
from app.models import User


class UserNotFound(Exception): ...

class UsernameNotAvailable(Exception): ...
class UsernameIsTooLong(Exception): ...
class UsernameNotValid(Exception): ...

class EmailNotValid(Exception): ...
class EmailIsTaken(Exception): ...

class NameIsTooLong(Exception): ...

class BioIsTooLong(Exception): ...


class UserService:

    @staticmethod
    def get_user(username: str) -> Optional[User]:
        user = User.by_username(username)
        return user

    @staticmethod
    def get_user_by_id(id: int) -> Optional[User]:
        user = User.by_id(id)
        return user

    @staticmethod
    def get_user_by_api_key(api_key: str) -> Optional[User]:
        user = User.by_api_key(api_key)
        return user

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        user = User.get_or_none(User.email == email)
        return user

    @staticmethod
    def create_user(username: str, email: str, password: str) -> User:

        username = username.lower().strip()
        email = email.lower().strip()

        if len(username) > 64:
            raise UsernameIsTooLong()
        if not User.is_username_valid(username):
            raise UsernameNotValid()
        if not User.is_username_available(username):
            raise UsernameNotAvailable()
        if not is_valid_email_address(email):
            raise EmailNotValid()
        if User.get_or_none(User.email == email):
            raise EmailIsTaken()

        user: User = User.create(
            name=username,
            username=username,
            email=email
        )

        user.set_password(password)

        return user

    @staticmethod
    def update_user_name(username: str, name: str):
        user = User.by_username(username)
        if not user:
            raise UserNotFound()
        if len(name) > 64:
            raise NameIsTooLong()
        user.name = name
        user.save()

    @staticmethod
    def update_user_bio(username: str, bio: str):
        user = User.by_username(username)
        if not user:
            raise UserNotFound()
        if len(bio) > 512:
            raise BioIsTooLong()
        user.bio = bio
        user.save()

    @staticmethod
    def update_user_password(username: str, password: str):
        user = User.by_username(username)
        if not user:
            raise UserNotFound()
        user.set_password(password)

    @staticmethod
    def auth_user(user_or_username: str | User, password: str) -> bool:
        user = None
        if isinstance(user_or_username, User):
            user = user_or_username
        if isinstance(user_or_username, str):
            user = User.by_username(user_or_username)

        if not user:
            return False

        return user.match_password(password)

