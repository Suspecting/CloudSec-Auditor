import re

import boto3
from botocore.exceptions import BotoCoreError, ClientError, NoCredentialsError, ProfileNotFound

from services.aws_profile_service import get_available_aws_profiles


PROFILE_NAME_PATTERN = re.compile(r"^[A-Za-z0-9_.@+=,:/-]{1,128}$")


def validate_profile_name(profile_name: str) -> None:
    """
    Validates AWS profile name format before using it.

    This prevents weird or unsafe input from being passed into boto3 session logic.
    """

    if not profile_name or not PROFILE_NAME_PATTERN.match(profile_name):
        raise ValueError(
            "Invalid AWS profile name format."
        )


def ensure_profile_exists(profile_name: str) -> None:
    """
    Checks whether the requested AWS profile exists locally.
    """

    profiles = get_available_aws_profiles()

    if profile_name not in profiles:
        raise ProfileNotFound(profile=profile_name)


def create_aws_session(profile_name: str) -> boto3.Session:
    """
    Creates a boto3 session from a local AWS CLI profile.

    Security note:
    This function does not read, return, log, or expose AWS credential values.
    """

    validate_profile_name(profile_name)
    ensure_profile_exists(profile_name)

    return boto3.Session(profile_name=profile_name)


def mask_account_id(account_id: str) -> str:
    """
    Masks AWS account ID for safer frontend display.
    Example: 123456789012 -> 1234********
    """

    if not account_id or len(account_id) < 4:
        return "unknown"

    return account_id[:4] + "*" * max(len(account_id) - 4, 0)


def get_safe_profile_identity(profile_name: str) -> dict:
    """
    Validates an AWS profile by calling STS GetCallerIdentity.

    This confirms the profile works without exposing credential values.
    """

    session = create_aws_session(profile_name)
    sts_client = session.client("sts")

    identity = sts_client.get_caller_identity()

    account_id = identity.get("Account", "")
    arn = identity.get("Arn", "")
    user_id = identity.get("UserId", "")

    return {
        "profile": profile_name,
        "valid": True,
        "account_id_masked": mask_account_id(account_id),
        "arn_preview": arn[:18] + "..." if arn else "unknown",
        "user_id_preview": user_id[:8] + "..." if user_id else "unknown",
        "credential_values_exposed": False,
        "safe_for_read_only_scan": True,
    }


def explain_aws_validation_error(error: Exception) -> str:
    """
    Converts boto3/botocore errors into frontend-safe messages.
    """

    if isinstance(error, ProfileNotFound):
        return "AWS profile was not found locally."

    if isinstance(error, NoCredentialsError):
        return "AWS credentials were not found for this profile."

    if isinstance(error, ClientError):
        return "AWS rejected the profile validation request."

    if isinstance(error, BotoCoreError):
        return "AWS SDK failed to validate this profile."

    if isinstance(error, ValueError):
        return str(error)

    return "Unable to validate AWS profile."
