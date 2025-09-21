"""
Input validation and sanitization service for The Pile API.

This service provides comprehensive validation for all user inputs to prevent
security vulnerabilities including SSRF, XSS, and injection attacks.
"""

import html
import re
from typing import Optional

from fastapi import HTTPException


class InputValidationService:
    """Centralized input validation and sanitization service."""

    # Steam ID pattern: 17-digit number starting with 765611 (covers both 76561197 and 76561198 prefixes)
    # Steam IDs are 64-bit integers that typically start with 765611 for normal users
    STEAM_ID_PATTERN = re.compile(r"^765611[0-9]{11}$")

    # Valid characters for amnesty reasons (alphanumeric, spaces, basic punctuation)
    SAFE_TEXT_PATTERN = re.compile(r"^[a-zA-Z0-9\s\.,!?\-\'\"]+$")

    @staticmethod
    def validate_steam_id(steam_id: str) -> str:
        """
        Validate Steam ID format.

        Steam IDs are 64-bit integers that typically start with 765611 when converted
        to decimal. The format is: 765611 + 11 additional digits (17 digits total).

        Args:
            steam_id: Steam ID string to validate

        Returns:
            Validated Steam ID string

        Raises:
            HTTPException: If Steam ID format is invalid
        """
        if not steam_id:
            raise HTTPException(status_code=400, detail="Steam ID is required")

        if not isinstance(steam_id, str):
            steam_id = str(steam_id)

        # Remove any whitespace
        steam_id = steam_id.strip()

        # Check if empty after stripping
        if not steam_id:
            raise HTTPException(status_code=400, detail="Steam ID is required")

        # Validate format
        if not InputValidationService.STEAM_ID_PATTERN.match(steam_id):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid Steam ID format. Must be 17-digit number "
                    "starting with 765611"
                ),
            )

        return steam_id

    @staticmethod
    def validate_pile_entry_id(pile_entry_id: int) -> int:
        """
        Validate pile entry ID bounds.

        Args:
            pile_entry_id: Pile entry ID to validate

        Returns:
            Validated pile entry ID

        Raises:
            HTTPException: If ID is out of valid range
        """
        if not isinstance(pile_entry_id, int):
            raise HTTPException(
                status_code=400, detail="Pile entry ID must be an integer"
            )

        if pile_entry_id < 1 or pile_entry_id > 2147483647:
            raise HTTPException(
                status_code=400,
                detail="Invalid pile entry ID. Must be between 1 and 2147483647",
            )

        return pile_entry_id

    @staticmethod
    def validate_user_id(user_id: int) -> int:
        """
        Validate user ID bounds.

        Args:
            user_id: User ID to validate

        Returns:
            Validated user ID

        Raises:
            HTTPException: If ID is out of valid range
        """
        if not isinstance(user_id, int):
            raise HTTPException(status_code=400, detail="User ID must be an integer")

        if user_id < 1 or user_id > 2147483647:
            raise HTTPException(
                status_code=400,
                detail="Invalid user ID. Must be between 1 and 2147483647",
            )

        return user_id

    @staticmethod
    def sanitize_text_input(text: Optional[str], max_length: int = 500) -> str:
        """
        Sanitize text input to prevent XSS and other injection attacks.

        Args:
            text: Text to sanitize
            max_length: Maximum allowed length

        Returns:
            Sanitized text string

        Raises:
            HTTPException: If text exceeds maximum length
        """
        if not text:
            return ""

        # Strip whitespace
        text = text.strip()

        # Check length before processing
        if len(text) > max_length:
            raise HTTPException(
                status_code=400,
                detail=f"Text input too long. Maximum {max_length} characters allowed",
            )

        # First, remove dangerous characters that could be used for attacks
        # Remove characters commonly used in injections but preserve basic punctuation
        sanitized = re.sub(r"[<>{}[\]\\|`~@#$%^&*()+=;:/\-]", "", text)

        # HTML escape to prevent XSS (after character removal to avoid double escaping)
        sanitized = html.escape(sanitized)

        return sanitized

    @staticmethod
    def validate_amnesty_reason(reason: Optional[str]) -> str:
        """
        Validate and sanitize amnesty reason text.

        Args:
            reason: Amnesty reason to validate

        Returns:
            Validated and sanitized reason

        Raises:
            HTTPException: If reason is invalid
        """
        if not reason:
            return ""

        # Use general text sanitization with specific length limit
        sanitized_reason = InputValidationService.sanitize_text_input(
            reason, max_length=500
        )

        return sanitized_reason

    @staticmethod
    def validate_pagination_params(skip: int = 0, limit: int = 100) -> tuple[int, int]:
        """
        Validate pagination parameters.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            Tuple of validated (skip, limit)

        Raises:
            HTTPException: If parameters are invalid
        """
        if skip < 0:
            raise HTTPException(
                status_code=400, detail="Skip parameter must be non-negative"
            )

        if limit < 1:
            raise HTTPException(
                status_code=400, detail="Limit parameter must be positive"
            )

        if limit > 1000:
            raise HTTPException(
                status_code=400, detail="Limit parameter too large (max 1000)"
            )

        return skip, limit

    @staticmethod
    def validate_sort_field(sort_field: str, allowed_fields: list[str]) -> str:
        """
        Validate sort field against allowed list.

        Args:
            sort_field: Field name to sort by
            allowed_fields: List of allowed field names

        Returns:
            Validated sort field

        Raises:
            HTTPException: If sort field is not allowed
        """
        if sort_field not in allowed_fields:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid sort field. Allowed fields: {', '.join(allowed_fields)}"
                ),
            )

        return sort_field

    @staticmethod
    def validate_sort_order(sort_order: str) -> str:
        """
        Validate sort order parameter.

        Args:
            sort_order: Sort order ('asc' or 'desc')

        Returns:
            Validated sort order

        Raises:
            HTTPException: If sort order is invalid
        """
        if sort_order.lower() not in ["asc", "desc"]:
            raise HTTPException(
                status_code=400, detail="Invalid sort order. Must be 'asc' or 'desc'"
            )

        return sort_order.lower()
