from fastapi import APIRouter, HTTPException

from schemas.response_models import AwsProfileValidationResponse, AwsProfilesResponse
from services.aws_profile_service import get_available_aws_profiles
from services.aws_session_service import (
    explain_aws_validation_error,
    get_safe_profile_identity,
)

router = APIRouter()


@router.get("/api/aws/profiles", response_model=AwsProfilesResponse)
def list_aws_profiles():
    """
    Lists local AWS CLI profile names.

    Security note:
    This endpoint never returns AWS access keys, secret keys, session tokens,
    or credential values. It only returns profile names.
    """

    profiles = get_available_aws_profiles()

    return {
        "status": "success",
        "profiles": profiles,
        "count": len(profiles),
        "credential_values_exposed": False,
    }


@router.get(
    "/api/aws/profiles/{profile_name}/validate",
    response_model=AwsProfileValidationResponse,
)
def validate_aws_profile(profile_name: str):
    """
    Validates a local AWS CLI profile using STS GetCallerIdentity.

    Security note:
    This endpoint does not expose AWS access keys, secret keys, session tokens,
    or raw credential values.
    """

    try:
        identity = get_safe_profile_identity(profile_name)

        return {
            "status": "success",
            **identity,
            "message": "AWS profile validated successfully.",
        }

    except Exception as error:
        message = explain_aws_validation_error(error)

        raise HTTPException(
            status_code=400,
            detail=message,
        )
