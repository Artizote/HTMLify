# API Errors

class APIError:
    """ API Error Code """

    initials = {
        "general"   :   1000,
        "auth"      :   2000,
        "resource"  :   3000,
        "rate"      :   4000,
        "server"    :   5000,
    }

    codes_used = set()

    def __init__(self, type, code, message):
        if type not in APIError.initials.keys():
            raise ValueError("Invalid Error Type")

        code = code + APIError.initials[type]
        if code in APIError.codes_used:
            raise ValueError("Error Code must be unique")
        APIError.codes_used.add(code)

        self.type = type
        self.code = code
        self.message = message

    def __repr__(self) -> str:
        return f"<APIError {self.code}>"

    def to_dict(self, **extra) -> dict:
        return {
            "code": self.code,
            "message": self.message,
            **extra,
        }


class APIErrors:

    # General Errors
    MISSING_PARAMETERS = APIError("general", 1, "Missing parameters")
    INVALID_PARAMETERS = APIError("general", 2, "Invalid paramaters")
    VALIDATION_FAILED  = APIError("general", 3, "Validation failed")
    MALFORMED_JSON     = APIError("general", 4, "Malformed JSON body")
    MISSING_JSON       = APIError("general", 5, "JSON body missing")
    INVALID_DATA       = APIError("general", 6, "Invalid data")
    MISSING_DATA       = APIError("general", 7, "Missing data")

    # Auth Errors
    UNAUTHORIZED        = APIError("auth", 1, "Unauthorized")
    INVALID_CREDENTIALS = APIError("auth", 2, "Invalid Credentials")
    MISSING_API_KEY     = APIError("auth", 3, "Missing API Key")
    INVALID_API_KEY     = APIError("auth", 4, "Invalid API Key")
    FORBIDDEN           = APIError("auth", 5, "Forbidden")

    # Resource Errors
    NOT_FOUND       = APIError("resource", 1, "Resource not found")
    ALREADY_EXISTS  = APIError("resource", 2, "Resource already exists")

    # Rate Errors
    RATE_LIMITED    = APIError("rate", 1, "Too many requests")

    # Server Errors
    INTERNAL_ERROR  = APIError("server", 1, "Internal Server Error")


    @classmethod
    def all_errors(cls) -> list[APIError]:
        errors = []
        for attr in dir(cls):
            if attr == attr.upper():
                errors.append(getattr(cls, attr))
        return errors

    @classmethod
    def by_code(cls, code) -> APIError | None:
        for error in cls.all_errors():
            if error.code == code:
                return error


def error_respones_dict(error: APIError, **extra) -> dict:
    return {
        "success": False,
        "error": error.to_dict(),
        **extra
    }

