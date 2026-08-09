import re
from typing import Optional


class QuickAddParser:
    """
    Deterministic rule-based parser for TaskFlow Quick-Add.

    This parser intentionally does not use any external
    LLM, API, network call, or API key.

    It follows the exact parsing rules defined for
    the TaskFlow AI Quick-Add feature.
    """

    # ==================================================
    # PRIORITY KEYWORDS
    # ==================================================

    HIGH_PRIORITY_KEYWORDS = (
        "urgent",
        "asap",
    )

    LOW_PRIORITY_KEYWORDS = (
        "whenever",
        "low priority",
    )

    # ==================================================
    # DATE KEYWORDS
    # ==================================================

    DATE_PHRASES = (
        "today",
        "tomorrow",
        "next week",

        # Two-word weekday phrases must come before
        # the single weekday names.
        "next monday",
        "next tuesday",
        "next wednesday",
        "next thursday",
        "next friday",
        "next saturday",
        "next sunday",

        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    )

    # ==================================================
    # PARSE
    # ==================================================

    @classmethod
    def parse(
        cls,
        description: str
    ) -> dict:
        """
        Parse a free-text task description.

        Returns:

        {
            "title": str,
            "priority": str,
            "due_date_hint": str | None
        }
        """

        if description is None:
            description = ""

        # Keep the original case untouched.
        original_description = description

        # Lower-cased working copy is used ONLY
        # for keyword matching.
        working_description = (
            original_description.lower()
        )

        # --------------------------------------------------
        # 1. PRIORITY
        # --------------------------------------------------

        priority = cls._parse_priority(
            working_description
        )

        # --------------------------------------------------
        # 2. DATE HINT
        # --------------------------------------------------

        due_date_hint = cls._parse_due_date(
            working_description
        )

        # --------------------------------------------------
        # 3. TITLE
        # --------------------------------------------------

        title = cls._build_title(
            original_description,
            priority_keywords=(
                cls.HIGH_PRIORITY_KEYWORDS
                + cls.LOW_PRIORITY_KEYWORDS
            ),
            due_date_hint=due_date_hint
        )

        # --------------------------------------------------
        # 4. EMPTY TITLE
        # --------------------------------------------------

        if not title.strip():

            title = "Untitled task"

        return {
            "title": title.strip(),
            "priority": priority,
            "due_date_hint": due_date_hint,
        }

    # ==================================================
    # PRIORITY PARSER
    # ==================================================

    @classmethod
    def _parse_priority(
        cls,
        text: str
    ) -> str:
        """
        Priority rules:

        Group 1:
            urgent / asap -> high

        Group 2:
            whenever / low priority -> low

        Otherwise:
            medium

        Group 1 always wins if both groups
        appear in the description.
        """

        # Group 1 has priority.
        for keyword in cls.HIGH_PRIORITY_KEYWORDS:

            if keyword in text:

                return "high"

        # Group 2.
        for keyword in cls.LOW_PRIORITY_KEYWORDS:

            if keyword in text:

                return "low"

        # Default.
        return "medium"

    # ==================================================
    # DATE PARSER
    # ==================================================

    @classmethod
    def _parse_due_date(
        cls,
        text: str
    ) -> Optional[str]:
        """
        Check date phrases in the exact required order.

        The first matching phrase wins.

        Returned value is always lower-case.
        """

        for phrase in cls.DATE_PHRASES:

            if phrase in text:

                return phrase

        return None

    # ==================================================
    # TITLE BUILDER
    # ==================================================

    @classmethod
    def _build_title(
        cls,
        original_description: str,
        priority_keywords: tuple[str, ...],
        due_date_hint: Optional[str]
    ) -> str:
        """
        Build the title from the original-cased description.

        Remove:

        1. Every occurrence of every priority keyword.
        2. Every occurrence of the matched date phrase.

        Matching is case-insensitive while the remaining
        original text keeps its original casing.
        """

        title = original_description

        # --------------------------------------------------
        # Remove ALL priority keyword occurrences
        # --------------------------------------------------

        for keyword in priority_keywords:

            title = re.sub(
                re.escape(keyword),
                "",
                title,
                flags=re.IGNORECASE
            )

        # --------------------------------------------------
        # Remove ALL occurrences of matched date phrase
        # --------------------------------------------------

        if due_date_hint is not None:

            title = re.sub(
                re.escape(due_date_hint),
                "",
                title,
                flags=re.IGNORECASE
            )

        # --------------------------------------------------
        # Trim only leading/trailing whitespace.
        # --------------------------------------------------

        return title.strip()


# ======================================================
# FUNCTION WRAPPER
# ======================================================

def parse_quick_add(
    description: str
) -> dict:
    """
    Simple function interface for the Quick-Add feature.

    Example:

        result = parse_quick_add(
            "Finish report next Friday, it's urgent"
        )

    Returns:

        {
            "title": "Finish report, it's",
            "priority": "high",
            "due_date_hint": "next friday"
        }
    """

    return QuickAddParser.parse(
        description
    )