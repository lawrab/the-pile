"""
Integration tests for Auth API endpoints.
"""

from datetime import datetime, timedelta, timezone

from app.models.user import User


class TestAuthEndpoints:
    """Integration tests for /api/v1/auth endpoints."""

    def test_delete_profile_unauthorized(self, client):
        """Test deleting profile without authentication."""
        response = client.delete("/api/v1/auth/profile")
        assert response.status_code == 401  # FastAPI returns 401 for missing auth

    def test_delete_profile_success(
        self, client, auth_headers, sample_user, db_session, mock_jwt_decode
    ):
        """Test successful profile deletion request."""
        # Verify user has no deletion timestamps initially
        assert sample_user.deletion_requested_at is None
        assert sample_user.deletion_scheduled_at is None

        response = client.delete("/api/v1/auth/profile", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert "message" in data
        assert "deletion_date" in data
        assert "grace_period_ends" in data
        assert "notice" in data
        assert "Account deletion scheduled successfully" in data["message"]

        # Verify user has deletion timestamps set
        db_session.refresh(sample_user)
        assert sample_user.deletion_requested_at is not None
        assert sample_user.deletion_scheduled_at is not None

        # Verify 30-day grace period
        time_diff = (
            sample_user.deletion_scheduled_at - sample_user.deletion_requested_at
        )
        assert (
            abs(time_diff.total_seconds() - (30 * 24 * 3600)) < 60
        )  # Within 1 minute tolerance

    def test_delete_profile_already_requested(
        self, client, auth_headers, sample_user, db_session, mock_jwt_decode
    ):
        """Test deleting profile when deletion is already requested."""
        # Set deletion timestamps
        now = datetime.now(timezone.utc)
        sample_user.deletion_requested_at = now
        sample_user.deletion_scheduled_at = now + timedelta(days=30)
        db_session.commit()

        response = client.delete("/api/v1/auth/profile", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert "Account deletion already requested" in data["message"]
        assert "deletion_date" in data
        assert "grace_period_ends" in data

    def test_cancel_deletion_unauthorized(self, client):
        """Test canceling deletion without authentication."""
        response = client.post("/api/v1/auth/profile/cancel-deletion")
        assert response.status_code == 401

    def test_cancel_deletion_success(
        self, client, auth_headers, sample_user, db_session, mock_jwt_decode
    ):
        """Test successful deletion cancellation."""
        # Set deletion timestamps
        now = datetime.now(timezone.utc)
        sample_user.deletion_requested_at = now
        sample_user.deletion_scheduled_at = now + timedelta(days=30)
        db_session.commit()

        response = client.post(
            "/api/v1/auth/profile/cancel-deletion", headers=auth_headers
        )
        assert response.status_code == 200

        data = response.json()
        assert "Account deletion request cancelled successfully" in data["message"]
        assert data["status"] == "active"

        # Verify deletion timestamps are cleared
        db_session.refresh(sample_user)
        assert sample_user.deletion_requested_at is None
        assert sample_user.deletion_scheduled_at is None

    def test_cancel_deletion_not_requested(
        self, client, auth_headers, sample_user, db_session, mock_jwt_decode
    ):
        """Test canceling deletion when no deletion was requested."""
        # Ensure no deletion timestamps
        assert sample_user.deletion_requested_at is None
        assert sample_user.deletion_scheduled_at is None

        response = client.post(
            "/api/v1/auth/profile/cancel-deletion", headers=auth_headers
        )
        assert response.status_code == 400

        data = response.json()
        assert "No deletion request found to cancel" in data["detail"]

    def test_get_current_user_with_deletion_pending(
        self, client, auth_headers, sample_user, db_session, mock_jwt_decode
    ):
        """Test getting current user when deletion is pending."""
        # Set deletion timestamps
        now = datetime.now(timezone.utc)
        sample_user.deletion_requested_at = now
        sample_user.deletion_scheduled_at = now + timedelta(days=30)
        db_session.commit()

        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == sample_user.id
        # Verify deletion timestamps are included in the response
        assert "deletion_requested_at" in data
        assert "deletion_scheduled_at" in data
        assert data["deletion_requested_at"] is not None
        assert data["deletion_scheduled_at"] is not None

    def test_delete_profile_user_not_found(
        self, client, auth_headers, db_session, mock_jwt_decode
    ):
        """Test deleting profile when user is not found in database."""
        # Clear all users from database
        db_session.query(User).delete()
        db_session.commit()

        response = client.delete("/api/v1/auth/profile", headers=auth_headers)
        assert response.status_code == 404

        data = response.json()
        assert "User not found" in data["detail"]
