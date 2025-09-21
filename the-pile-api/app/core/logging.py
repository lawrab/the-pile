"""
Logging configuration for The Pile API

This module provides unified logging configuration that integrates with uvicorn's
colored formatters to ensure consistent, colored output across all application logs.
"""

import logging
import sys
from typing import Optional


class ColoredFormatter(logging.Formatter):
    """
    Custom formatter that provides colored output similar to uvicorn's formatters.
    Uses ANSI color codes for different log levels.
    """

    # ANSI color codes matching uvicorn's style
    COLORS = {
        "DEBUG": "\033[36m",  # Cyan
        "INFO": "\033[32m",  # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",  # Red
        "CRITICAL": "\033[35m",  # Magenta
        "RESET": "\033[0m",  # Reset
    }

    def __init__(self, fmt: Optional[str] = None, use_colors: Optional[bool] = None):
        super().__init__()
        self.use_colors = (
            use_colors if use_colors is not None else self._should_use_colors()
        )
        self.fmt = fmt or "%(levelname)s:     %(message)s"

    def _should_use_colors(self) -> bool:
        """Auto-detect if colors should be used based on terminal support."""
        return hasattr(sys.stderr, "isatty") and sys.stderr.isatty()

    def format(self, record: logging.LogRecord) -> str:
        """Format the log record with colors if enabled."""
        if self.use_colors and record.levelname in self.COLORS:
            # Create a copy of the record to avoid modifying the original
            record = logging.LogRecord(
                record.name,
                record.levelno,
                record.pathname,
                record.lineno,
                record.msg,
                record.args,
                record.exc_info,
                record.funcName,
                record.stack_info if hasattr(record, "stack_info") else None,
            )
            # Apply color to levelname
            record.levelname = f"{self.COLORS[record.levelname]}{record.levelname}{self.COLORS['RESET']}"

        # Format using our template
        formatter = logging.Formatter(self.fmt)
        return formatter.format(record)


def setup_logging(log_level: str = "INFO", use_colors: Optional[bool] = None) -> None:
    """
    Configure logging for The Pile API with colored output.

    This function sets up logging to work alongside uvicorn's logging system,
    providing consistent colored output for all application logs.

    Args:
        log_level: Minimum log level to display (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        use_colors: Whether to use colored output (auto-detected if None)
    """

    # Get the root logger
    root_logger = logging.getLogger()

    # Only configure if not already configured by uvicorn
    if not root_logger.handlers:
        # Create colored formatter
        formatter = ColoredFormatter(use_colors=use_colors)

        # Create console handler
        console_handler = logging.StreamHandler(sys.stderr)
        console_handler.setFormatter(formatter)
        console_handler.setLevel(getattr(logging, log_level.upper()))

        # Configure root logger
        root_logger.setLevel(getattr(logging, log_level.upper()))
        root_logger.addHandler(console_handler)

    # Configure application-specific loggers to use the same formatting
    app_loggers = [
        "app",
        "app.api",
        "app.api.v1",
        "app.services",
        "app.core",
    ]

    for logger_name in app_loggers:
        logger = logging.getLogger(logger_name)
        logger.setLevel(getattr(logging, log_level.upper()))

        # Ensure these loggers use the same handler as root
        if not logger.handlers and root_logger.handlers:
            # Set propagate to True so messages go to root logger's handlers
            logger.propagate = True


def get_app_logger(name: str) -> logging.Logger:
    """
    Get a properly configured logger for application modules.

    This is a convenience function that ensures the logger is properly
    configured for colored output.

    Args:
        name: Usually __name__ from the calling module

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Ensure the logger will propagate to configured handlers
    logger.propagate = True

    return logger


def configure_uvicorn_integration() -> None:
    """
    Configure logging to work seamlessly with uvicorn's existing setup.

    This function should be called during application startup to ensure
    all application logs use uvicorn's colored formatting.
    """
    # Check if uvicorn loggers exist and are configured
    uvicorn_logger = logging.getLogger("uvicorn")

    if uvicorn_logger.handlers:
        # uvicorn is configured, use its setup
        root_logger = logging.getLogger()

        # If uvicorn has configured the root logger, we're good
        if not root_logger.handlers:
            # Create our own colored handler
            setup_logging()
    else:
        # uvicorn not configured yet, set up our own
        setup_logging()
