from algorithms.comparison_counter import ComparisonCounter


PRIORITY_ORDER = {
    "high": 1,
    "medium": 2,
    "low": 3
}


def get_sort_value(record, key):
    value = getattr(record, key)

    if key == "priority":
        value = value.value if hasattr(value, "value") else str(value)
        return PRIORITY_ORDER.get(value.lower(), 999)

    if key == "title":
        return str(value).lower()

    return value


def insertion_sort(records, key, counter=None):
    """
    Sort records using Insertion Sort.

    Parameters:
        records: list of objects
        key: object attribute used for sorting
        counter: optional ComparisonCounter

    Returns:
        New sorted list
    """

    if counter is None:
        counter = ComparisonCounter()

    arr = records[:]

    for i in range(1, len(arr)):

        current = arr[i]
        current_value = get_sort_value(current, key)

        j = i - 1

        while j >= 0:

            counter.increment()

            previous_value = get_sort_value(arr[j], key)

            if previous_value > current_value:
                arr[j + 1] = arr[j]
                j -= 1
            else:
                break

        arr[j + 1] = current

    return arr