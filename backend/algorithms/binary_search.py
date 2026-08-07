from algorithms.comparison_counter import ComparisonCounter


def binary_search(records, key, value, counter=None):
    """
    Search a sorted list using Binary Search.

    Returns:
        Matching record
        or None if not found
    """

    if counter is None:
        counter = ComparisonCounter()

    low = 0
    high = len(records) - 1

    target = value

    while low <= high:

        mid = (low + high) // 2

        middle_value = getattr(records[mid], key)

        if hasattr(middle_value, "value"):
            middle_value = middle_value.value

        counter.increment()

        if middle_value == target:
            return records[mid]

        if middle_value < target:
            low = mid + 1
        else:
            high = mid - 1

    return None