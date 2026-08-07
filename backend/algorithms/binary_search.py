from algorithms.comparison_counter import increment


def binary_search(records, key, value):

    low = 0

    high = len(records) - 1

    while low <= high:

        mid = (low + high) // 2

        increment()

        current = str(getattr(records[mid], key)).lower()

        target = str(value).lower()

        if current == target:
            return records[mid]

        elif current < target:
            low = mid + 1

        else:
            high = mid - 1

    return None