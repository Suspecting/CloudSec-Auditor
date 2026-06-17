from boto3.session import Session


def get_available_aws_profiles() -> list[str]:
    """
    Returns locally configured AWS CLI profile names.

    This function only reads available profile names from the local AWS config.
    It does not expose access keys, secret keys, tokens, or credential values.
    """

    session = Session()
    profiles = session.available_profiles

    return sorted(profiles)
