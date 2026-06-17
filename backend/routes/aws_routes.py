from fastapi import APIRouter

from schemas.response_models import AwsProfilesResponse
from services.aws_profile_service import get_available_aws_profiles

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
