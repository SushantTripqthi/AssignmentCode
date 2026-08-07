def binary_search(sorted_records, target_value, key):
    """
    Search a sorted list of dictionary records
    using Binary Search.

    Parameters:
        sorted_records: records already sorted by key
        target_value: value to search
        key: dictionary key

    Returns:
        Matching index.
        Returns -1 when no match is found.
    """

    low = 0
    high = len(sorted_records) - 1

    target = target_value

    if isinstance(target, str):
        target = target.lower().strip()

    while low <= high:

        mid = (low + high) // 2

        middle_value = sorted_records[mid][key]

        if isinstance(middle_value, str):
            middle_value = middle_value.lower().strip()

        if middle_value == target:

            return mid

        if middle_value < target:

            low = mid + 1

        else:

            high = mid - 1

    return -1