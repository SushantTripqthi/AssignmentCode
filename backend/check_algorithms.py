from algorithms.insertion_sort import insertion_sort
from algorithms.linear_search import linear_search
from algorithms.binary_search import binary_search

from algorithms.comparison_algorithms import (
    insertion_sort_count,
    binary_search_count,
    linear_search_count
)


# ==================================================
# HELPER
# ==================================================

def check_result(
    case_name,
    actual,
    expected
):

    if actual == expected:

        print(
            f"PASS: {case_name}"
        )

        return True

    else:

        print(
            f"FAIL: {case_name} — "
            f"expected {expected}, "
            f"got {actual}"
        )

        return False


# ==================================================
# INSERTION SORT - EMPTY LIST
# ==================================================

def check_insertion_sort_empty():

    records = []

    insertion_sort(
        records,
        "title"
    )

    expected = []

    return check_result(
        "insertion_sort empty list",
        records,
        expected
    )


# ==================================================
# INSERTION SORT - SINGLE ELEMENT
# ==================================================

def check_insertion_sort_single():

    records = [
        {
            "id": 1,
            "title": "Only Task",
            "priority": "medium"
        }
    ]

    original = records.copy()

    insertion_sort(
        records,
        "title"
    )

    return check_result(
        "insertion_sort single element",
        records,
        original
    )


# ==================================================
# BINARY SEARCH - FIRST INDEX
# ==================================================

def check_binary_search_first():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"},
        {"id": 3, "title": "Charlie"},
        {"id": 4, "title": "Delta"},
        {"id": 5, "title": "Echo"}
    ]

    result = binary_search(
        records,
        "Alpha",
        "title"
    )

    return check_result(
        "binary_search first index",
        result,
        0
    )


# ==================================================
# BINARY SEARCH - LAST INDEX
# ==================================================

def check_binary_search_last():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"},
        {"id": 3, "title": "Charlie"},
        {"id": 4, "title": "Delta"},
        {"id": 5, "title": "Echo"}
    ]

    result = binary_search(
        records,
        "Echo",
        "title"
    )

    return check_result(
        "binary_search last index",
        result,
        4
    )


# ==================================================
# BINARY SEARCH - MIDDLE INDEX
# ==================================================

def check_binary_search_middle():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"},
        {"id": 3, "title": "Charlie"},
        {"id": 4, "title": "Delta"},
        {"id": 5, "title": "Echo"}
    ]

    result = binary_search(
        records,
        "Charlie",
        "title"
    )

    return check_result(
        "binary_search middle index",
        result,
        2
    )


# ==================================================
# BINARY SEARCH - NOT FOUND
# ==================================================

def check_binary_search_not_found():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"},
        {"id": 3, "title": "Charlie"},
        {"id": 4, "title": "Delta"},
        {"id": 5, "title": "Echo"}
    ]

    result = binary_search(
        records,
        "Unknown",
        "title"
    )

    return check_result(
        "binary_search not found",
        result,
        -1
    )


# ==================================================
# INSERTION SORT COUNT
# ==================================================

def check_insertion_sort_count():

    records = [
        {"id": 1, "title": "Charlie"},
        {"id": 2, "title": "Alpha"},
        {"id": 3, "title": "Bravo"}
    ]

    result = insertion_sort_count(
        records,
        "title"
    )

    expected_records = [
        {"id": 2, "title": "Alpha"},
        {"id": 3, "title": "Bravo"},
        {"id": 1, "title": "Charlie"}
    ]

    sorted_correctly = (
        records == expected_records
    )

    result_is_int = (
        type(result) == int
    )

    result_positive = (
        result > 0
    )

    if (
        sorted_correctly
        and result_is_int
        and result_positive
    ):

        print(
            "PASS: insertion_sort_count"
        )

        return True

    else:

        print(
            "FAIL: insertion_sort_count — "
            f"expected sorted list and positive int, "
            f"got records={records}, "
            f"count={result}"
        )

        return False


# ==================================================
# BINARY SEARCH COUNT
# ==================================================

def check_binary_search_count():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"},
        {"id": 3, "title": "Charlie"},
        {"id": 4, "title": "Delta"},
        {"id": 5, "title": "Echo"}
    ]

    result = binary_search_count(
        records,
        "Charlie",
        "title"
    )

    correct_index = (
        result["index"] == 2
    )

    correct_count_type = (
        type(result["comparison_count"]) == int
    )

    correct_count_value = (
        result["comparison_count"] > 0
    )

    correct_keys = (
        set(result.keys())
        == {"index", "comparison_count"}
    )

    if (
        correct_index
        and correct_count_type
        and correct_count_value
        and correct_keys
    ):

        print(
            "PASS: binary_search_count"
        )

        return True

    else:

        print(
            "FAIL: binary_search_count — "
            f"got {result}"
        )

        return False


# ==================================================
# LINEAR SEARCH COUNT - ABSENT VALUE
# ==================================================

def check_linear_search_count():

    records = [
        {"id": 1, "title": "Alpha"},
        {"id": 2, "title": "Bravo"},
        {"id": 3, "title": "Charlie"},
        {"id": 4, "title": "Delta"},
        {"id": 5, "title": "Echo"}
    ]

    result = linear_search_count(
        records,
        "Unknown",
        "title"
    )

    expected_index = -1

    expected_comparisons = len(records)

    correct_index = (
        result["index"]
        == expected_index
    )

    correct_comparisons = (
        result["comparison_count"]
        == expected_comparisons
    )

    correct_count_type = (
        type(result["comparison_count"])
        == int
    )

    correct_keys = (
        set(result.keys())
        == {"index", "comparison_count"}
    )

    if (
        correct_index
        and correct_comparisons
        and correct_count_type
        and correct_keys
    ):

        print(
            "PASS: linear_search_count"
        )

        return True

    else:

        print(
            "FAIL: linear_search_count — "
            f"got {result}"
        )

        return False


# ==================================================
# MAIN
# ==================================================

def main():

    print()
    print("=" * 60)
    print("TASKFLOW ALGORITHM CHECK")
    print("=" * 60)

    results = []

    results.append(
        check_insertion_sort_empty()
    )

    results.append(
        check_insertion_sort_single()
    )

    results.append(
        check_binary_search_first()
    )

    results.append(
        check_binary_search_last()
    )

    results.append(
        check_binary_search_middle()
    )

    results.append(
        check_binary_search_not_found()
    )

    results.append(
        check_insertion_sort_count()
    )

    results.append(
        check_binary_search_count()
    )

    results.append(
        check_linear_search_count()
    )

    print()
    print("=" * 60)

    if all(results):

        print(
            "ALL ALGORITHM CHECKS PASSED"
        )

    else:

        print(
            "SOME ALGORITHM CHECKS FAILED"
        )

    print("=" * 60)
    print()


if __name__ == "__main__":
    main()